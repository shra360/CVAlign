from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF
import tiktoken
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from ctransformers import AutoModelForCausalLM
import tempfile
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configure CORS to allow all origins, methods, and headers
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Global variables for models
embed_model = None
llm_model = None

def load_models():
    """Load the AI models once at startup"""
    global embed_model, llm_model
    if embed_model is None:
        embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    if llm_model is None:
        llm_model = AutoModelForCausalLM.from_pretrained(
            "./mistral-7b-instruct-v0.2.Q4_K_M.gguf",
            model_type="mistral",
            gpu_layers=0,
            max_new_tokens=256,
            context_length=512
        )

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = "\n".join([page.get_text() for page in doc])
        file.seek(0)  # Reset file pointer
        return text if text.strip() else "EMPTY_CONTENT"
    except Exception as e:
        return f"ERROR_EXTRACTION: {str(e)}"

def get_job_description_text(request):
    """Extract job description from either text field or PDF file"""
    # First check if there's a job description file
    if 'job_description_file' in request.files:
        jd_file = request.files['job_description_file']
        if jd_file and jd_file.filename:
            # Extract text from PDF
            jd_text = extract_text_from_pdf(jd_file)
            if jd_text.startswith("ERROR_") or jd_text == "EMPTY_CONTENT":
                return None, f"Failed to extract job description from PDF: {jd_text}"
            return jd_text, None
    
    # If no file, check for text job description
    jd_text = request.form.get('job_description', '').strip()
    if jd_text:
        return jd_text, None
    
    return None, "No job description provided (neither text nor file)"

def chunk_text(text, max_tokens=80, stride=40):
    """Chunk text into smaller pieces"""
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []
    for i in range(0, len(tokens), stride):
        chunk = tokens[i:i + max_tokens]
        chunk_text = enc.decode(chunk)
        chunks.append(chunk_text)
        if i + max_tokens >= len(tokens):
            break
    return chunks

def build_faiss_index(chunks, model):
    """Build FAISS index for chunks"""
    embeddings = model.encode(chunks, convert_to_tensor=False)
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))
    return index, embeddings

def retrieve_chunks(query, chunks, index, model, k=3):
    """Retrieve relevant chunks for a query"""
    query_vec = model.encode([query], convert_to_tensor=False)
    D, I = index.search(np.array(query_vec).astype("float32"), k)
    return [chunks[i] for i in I[0]]

def make_prompt(question, context_chunks, model_max_tokens=512):
    """Create prompt for LLM"""
    enc = tiktoken.get_encoding("cl100k_base")
    
    base_prompt = (
        "Use the context to answer the question.\n\n"
        f"Question: {question}\nAnswer:"
    )
    
    base_tokens = len(enc.encode(base_prompt))
    reserved_for_answer = 100
    available_for_context = model_max_tokens - base_tokens - reserved_for_answer
    
    context = ""
    used_tokens = 0
    
    for chunk in context_chunks:
        chunk_with_separator = chunk + "\n\n"
        chunk_tokens = len(enc.encode(chunk_with_separator))
        
        if used_tokens + chunk_tokens > available_for_context:
            break
            
        context += chunk_with_separator
        used_tokens += chunk_tokens
    
    prompt = (
        "Use the context to answer the question.\n\n"
        f"Context:\n{context}"
        f"Question: {question}\n"
        f"Answer:"
    )
    
    final_tokens = len(enc.encode(prompt))
    if final_tokens > model_max_tokens - 50:
        truncate_tokens = final_tokens - (model_max_tokens - 50)
        context_tokens = enc.encode(context)
        if len(context_tokens) > truncate_tokens:
            context_tokens = context_tokens[:-truncate_tokens]
            context = enc.decode(context_tokens)
        
        prompt = (
            "Use the context to answer the question.\n\n"
            f"Context:\n{context}"
            f"Question: {question}\n"
            f"Answer:"
        )
    
    return prompt

def extract_score_from_response(response):
    """Extract score and reasoning from LLM response"""
    try:
        # Look for score in the response
        response_lower = response.lower()
        if "score:" in response_lower:
            score_part = response_lower.split("score:")[1].split()[0]
            score = float(score_part)
        elif "%" in response:
            score_part = response.split("%")[0].split()[-1]
            score = float(score_part)
        else:
            # Default score based on response length and content
            score = min(100, len(response) / 2)
        
        # Ensure score is between 0 and 100
        score = max(0, min(100, score))
        
        return score, response
    except:
        return 50.0, response

def process_resume_jd_matching(resume_text, jd_text, resume_name):
    """Process a single resume against a job description"""
    if resume_text.startswith("ERROR_") or resume_text == "EMPTY_FILE" or resume_text == "EMPTY_CONTENT":
        return {
            'resume_name': resume_name,
            'score': 0.0,
            'reasoning': f"Error processing resume: {resume_text}",
            'chunks_used': 0
        }
    
    # Chunk the resume
    chunks = chunk_text(resume_text)
    
    # Build index for this resume
    index, embeddings = build_faiss_index(chunks, embed_model)
    
    # Retrieve relevant chunks based on job description
    top_chunks = retrieve_chunks(jd_text, chunks, index, embed_model, k=3)
    
    # Create a scoring prompt
    scoring_prompt = f"""
    Please analyze how well this resume matches the job requirements and provide a score from 0-100.
    
    Job Requirements:
    {jd_text[:1000]}...
    
    Resume Content:
    {' '.join(top_chunks)}
    
    Please provide a score (0-100) and brief reasoning for the match quality.
    Consider skills, experience, education, and overall fit.
    
    Format your response as:
    Score: [number]
    Reasoning: [brief explanation]
    """
    
    try:
        response = llm_model(scoring_prompt, max_new_tokens=150)
        score, reasoning = extract_score_from_response(response)
        
        return {
            'resume_name': resume_name,
            'score': score,
            'reasoning': reasoning,
            'chunks_used': len(top_chunks)
        }
    except Exception as e:
        return {
            'resume_name': resume_name,
            'score': 0.0,
            'reasoning': f"Error processing: {str(e)}",
            'chunks_used': 0
        }

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get API status"""
    return jsonify({
        'status': 'running',
        'message': 'Resume Checker API is running'
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Simple test endpoint for debugging"""
    return jsonify({
        'message': 'API is working!',
        'timestamp': '2024-01-01T00:00:00Z'
    })

@app.route('/api/single-resume-check', methods=['POST'])
def single_resume_check():
    """Check a single resume against a job description"""
    try:
        # Load models if not loaded
        load_models()
        
        # Get resume file
        resume_file = request.files.get('resume')
        if not resume_file:
            return jsonify({'error': 'No resume file provided'}), 400
        
        # Get job description (either from text or file)
        job_description, error = get_job_description_text(request)
        if error:
            return jsonify({'error': error}), 400
        
        # Get optional parameters
        max_score = int(request.form.get('max_score', 100))
        cutoff_score = int(request.form.get('cutoff_score', 70))
        
        # Extract text from resume
        resume_text = extract_text_from_pdf(resume_file)
        
        # Process matching
        result = process_resume_jd_matching(
            resume_text, 
            job_description, 
            resume_file.filename
        )
        
        # Scale score to max_score
        scaled_score = (result['score'] / 100) * max_score
        
        return jsonify({
            'score': round(scaled_score, 1),
            'reasoning': result['reasoning'],
            'resume_name': result['resume_name'],
            'job_description_source': 'file' if 'job_description_file' in request.files else 'text'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resume-checker', methods=['POST'])
def resume_checker():
    """Check multiple resumes against multiple job descriptions"""
    try:
        # Load models if not loaded
        load_models()
        
        # Get form data
        resumes = []
        job_descriptions = []
        
        # Extract resume files
        for key in request.files:
            if key.startswith('resume_'):
                resumes.append(request.files[key])
        
        # Extract job descriptions (text format for batch processing)
        for key in request.form:
            if key.startswith('job_description_'):
                job_descriptions.append(request.form[key])
        
        # Also check for JD files in batch processing
        for key in request.files:
            if key.startswith('job_description_file_'):
                jd_file = request.files[key]
                jd_text = extract_text_from_pdf(jd_file)
                if not jd_text.startswith("ERROR_") and jd_text != "EMPTY_CONTENT":
                    job_descriptions.append(jd_text)
        
        if not resumes:
            return jsonify({'error': 'No resume files provided'}), 400
        
        if not job_descriptions:
            return jsonify({'error': 'No job descriptions provided'}), 400
        
        # Process all combinations
        results = []
        for resume_file in resumes:
            resume_text = extract_text_from_pdf(resume_file)
            
            for jd in job_descriptions:
                result = process_resume_jd_matching(
                    resume_text, 
                    jd, 
                    resume_file.filename
                )
                result['job_description'] = jd[:100] + "..." if len(jd) > 100 else jd
                results.append(result)
        
        return jsonify({
            'results': results,
            'total_processed': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Loading AI models...")
    load_models()
    print("Models loaded successfully!")
    print("Starting Flask server on http://localhost:8501")
    app.run(host='0.0.0.0', port=8501, debug=False)