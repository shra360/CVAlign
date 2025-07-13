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
import re
from werkzeug.utils import secure_filename
import logging
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
tokenizer = None

# Configuration constants
MAX_CONTEXT_TOKENS = 400  # Reduced from 512 to leave more room
MAX_RESUME_TOKENS = 2000  # Maximum tokens to process from a resume
MAX_JD_TOKENS = 1000      # Maximum tokens to process from job description
CHUNK_SIZE = 100          # Increased chunk size for better context
CHUNK_OVERLAP = 50        # Overlap between chunks
MAX_CHUNKS_TO_PROCESS = 10  # Limit chunks processed per resume

def load_models():
    """Load the AI models once at startup"""
    global embed_model, llm_model, tokenizer
    try:
        if embed_model is None:
            logger.info("Loading embedding model...")
            embed_model = SentenceTransformer("all-MiniLM-L6-v2")
            
        if llm_model is None:
            logger.info("Loading LLM model...")
            llm_model = AutoModelForCausalLM.from_pretrained(
                "./mistral-7b-instruct-v0.2.Q4_K_M.gguf",
                model_type="mistral",
                gpu_layers=0,
                max_new_tokens=128,  # Reduced for more reliable responses
                context_length=512,
                temperature=0.1,     # Lower temperature for more consistent scoring
                repetition_penalty=1.1
            )
            
        if tokenizer is None:
            tokenizer = tiktoken.get_encoding("cl100k_base")
            
        logger.info("All models loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        raise

def analyze_font_properties(span):
    """Analyze font properties from a span"""
    font = span.get("font", "")
    flags = span.get("flags", 0)
    size = span.get("size", 0)
    
    # Font style analysis
    is_bold = bool(flags & 2**4)  # Bold flag
    is_italic = bool(flags & 2**1)  # Italic flag
    is_superscript = bool(flags & 2**0)  # Superscript flag
    is_subscript = bool(flags & 2**2)  # Subscript flag
    
    # Font family analysis
    font_lower = font.lower()
    is_monospace = any(mono in font_lower for mono in ['mono', 'courier', 'consolas', 'code'])
    is_serif = any(serif in font_lower for serif in ['times', 'georgia', 'garamond'])
    is_sans_serif = any(sans in font_lower for sans in ['arial', 'helvetica', 'calibri', 'verdana'])
    
    # Size categories
    size_category = 'normal'
    if size > 0:
        if size >= 16:
            size_category = 'large'
        elif size >= 14:
            size_category = 'medium-large'
        elif size >= 12:
            size_category = 'medium'
        elif size >= 10:
            size_category = 'small'
        else:
            size_category = 'tiny'
    
    return {
        'is_bold': is_bold,
        'is_italic': is_italic,
        'is_superscript': is_superscript,
        'is_subscript': is_subscript,
        'is_monospace': is_monospace,
        'is_serif': is_serif,
        'is_sans_serif': is_sans_serif,
        'font_name': font,
        'font_size': size,
        'size_category': size_category
    }

def format_text_with_style(text, font_props):
    """Format text with appropriate markdown styling"""
    if not text.strip():
        return text
    
    formatted = text
    
    # Apply bold formatting
    if font_props['is_bold']:
        formatted = f"**{formatted}**"
    
    # Apply italic formatting
    if font_props['is_italic']:
        formatted = f"*{formatted}*"
    
    # Apply monospace formatting
    if font_props['is_monospace']:
        formatted = f"`{formatted}`"
    
    # Apply superscript/subscript (using Unicode or markdown)
    if font_props['is_superscript']:
        formatted = f"^{formatted}^"
    elif font_props['is_subscript']:
        formatted = f"_{formatted}_"
    
    return formatted

def extract_text_blocks_with_positioning(page):
    """Extract text blocks with detailed positioning and formatting"""
    blocks = []
    text_dict = page.get_text("dict")
    
    for block in text_dict.get("blocks", []):
        if "lines" in block:
            block_info = {
                'bbox': block.get('bbox', [0, 0, 0, 0]),
                'lines': []
            }
            
            for line in block["lines"]:
                line_info = {
                    'bbox': line.get('bbox', [0, 0, 0, 0]),
                    'spans': []
                }
                
                for span in line.get("spans", []):
                    span_text = span.get("text", "")
                    if span_text.strip():
                        font_props = analyze_font_properties(span)
                        
                        span_info = {
                            'text': span_text,
                            'bbox': span.get('bbox', [0, 0, 0, 0]),
                            'font_props': font_props,
                            'formatted_text': format_text_with_style(span_text, font_props)
                        }
                        line_info['spans'].append(span_info)
                
                if line_info['spans']:
                    block_info['lines'].append(line_info)
            
            if block_info['lines']:
                blocks.append(block_info)
    
    return blocks

def detect_text_structure(blocks):
    """Detect document structure like headers, paragraphs, lists, etc."""
    structured_content = []
    
    for block in blocks:
        block_y = block['bbox'][1]  # Top y-coordinate
        
        for line in block['lines']:
            line_content = []
            line_y = line['bbox'][1]
            
            # Combine spans in the line
            full_line_text = ""
            line_has_bold = False
            line_has_large_font = False
            line_font_sizes = []
            
            for span in line['spans']:
                span_text = span['text']
                font_props = span['font_props']
                
                full_line_text += span_text
                line_content.append(span)
                
                if font_props['is_bold']:
                    line_has_bold = True
                if font_props['size_category'] in ['large', 'medium-large']:
                    line_has_large_font = True
                line_font_sizes.append(font_props['font_size'])
            
            # Determine line type
            line_type = 'paragraph'
            full_line_text_stripped = full_line_text.strip()
            
            if not full_line_text_stripped:
                line_type = 'blank'
            elif line_has_bold and line_has_large_font:
                line_type = 'main_header'
            elif line_has_bold:
                line_type = 'sub_header'
            elif full_line_text_stripped.startswith(('•', '▪', '▫', '◦', '‣', '⁃', '-', '*')):
                line_type = 'bullet_point'
            elif re.match(r'^\s*\d+[\.\)]\s', full_line_text_stripped):
                line_type = 'numbered_list'
            elif full_line_text_stripped.endswith(':') and len(full_line_text_stripped) < 100:
                line_type = 'section_header'
            elif len(full_line_text_stripped) < 80 and line_has_bold:
                line_type = 'sub_header'
            
            structured_content.append({
                'type': line_type,
                'content': line_content,
                'text': full_line_text,
                'y_position': line_y,
                'bbox': line['bbox']
            })
    
    return structured_content

def preserve_document_layout(structured_content):
    """Preserve document layout with proper spacing and formatting"""
    formatted_lines = []
    previous_y = None
    previous_type = None
    
    for item in structured_content:
        current_y = item['y_position']
        current_type = item['type']
        
        # Calculate vertical spacing
        if previous_y is not None:
            y_gap = abs(previous_y - current_y)
            
            # Add extra spacing for significant gaps
            if y_gap > 20:  # Significant vertical gap
                formatted_lines.append("")
                if y_gap > 40:  # Very large gap
                    formatted_lines.append("")
        
        # Format the line based on its type
        if current_type == 'blank':
            formatted_lines.append("")
        elif current_type == 'main_header':
            formatted_lines.append("")
            formatted_lines.append(format_line_content(item['content']))
            formatted_lines.append("")
        elif current_type == 'sub_header':
            if previous_type not in ['main_header', 'blank']:
                formatted_lines.append("")
            formatted_lines.append(format_line_content(item['content']))
        elif current_type == 'section_header':
            formatted_lines.append("")
            formatted_lines.append(format_line_content(item['content']))
        elif current_type == 'bullet_point':
            formatted_lines.append(format_line_content(item['content']))
        elif current_type == 'numbered_list':
            formatted_lines.append(format_line_content(item['content']))
        else:  # paragraph
            formatted_lines.append(format_line_content(item['content']))
        
        previous_y = current_y
        previous_type = current_type
    
    return formatted_lines

def format_line_content(spans):
    """Format a line's content preserving all formatting"""
    formatted_parts = []
    
    for span in spans:
        formatted_text = span['formatted_text']
        formatted_parts.append(formatted_text)
    
    return "".join(formatted_parts)

def extract_text_from_pdf(file):
    """Extract text from PDF file with perfect formatting preservation"""
    try:
        # Read file content
        file_content = file.read()
        file.seek(0)  # Reset file pointer
        
        if len(file_content) == 0:
            return "EMPTY_FILE"
        
        # Open PDF with PyMuPDF
        doc = fitz.open(stream=file_content, filetype="pdf")
        
        if doc.page_count == 0:
            return "EMPTY_CONTENT"
        
        # Extract text from all pages with perfect formatting
        all_pages_content = []
        
        for page_num in range(doc.page_count):
            page = doc[page_num]
            
            # Extract structured content with positioning
            blocks = extract_text_blocks_with_positioning(page)
            
            if not blocks:
                continue
            
            # Detect document structure
            structured_content = detect_text_structure(blocks)
            
            # Preserve layout and formatting
            formatted_lines = preserve_document_layout(structured_content)
            
            # Join the formatted lines
            page_content = "\n".join(formatted_lines)
            
            if page_content.strip():
                all_pages_content.append(page_content)
        
        doc.close()
        
        if not all_pages_content:
            return "EMPTY_CONTENT"
        
        # Join all pages with clear page breaks
        if len(all_pages_content) > 1:
            full_text = "\n\n--- PAGE BREAK ---\n\n".join(all_pages_content)
        else:
            full_text = all_pages_content[0]
        
        # Clean up excessive blank lines while preserving intentional spacing
        full_text = re.sub(r'\n{4,}', '\n\n\n', full_text)
        
        # Truncate if too long
        if count_tokens(full_text) > MAX_RESUME_TOKENS:
            full_text = truncate_text(full_text, MAX_RESUME_TOKENS)
            logger.info(f"Truncated document text to {MAX_RESUME_TOKENS} tokens")
        
        return full_text if full_text.strip() else "EMPTY_CONTENT"
        
    except Exception as e:
        logger.error(f"Error extracting PDF text: {str(e)}")
        return f"ERROR_EXTRACTION: {str(e)}"

def clean_text(text):
    """Clean text while preserving important formatting"""
    # Remove only problematic characters, keep structure
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f]', '', text)
    
    # Normalize Unicode characters
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u00a0', ' ')  # Non-breaking space
    
    # Clean up excessive spaces within lines but preserve line breaks
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        cleaned_line = ' '.join(line.split())
        cleaned_lines.append(cleaned_line)
    
    return '\n'.join(cleaned_lines)

def format_job_description_text(text):
    """Enhanced job description formatting"""
    if not text:
        return text
    
    # Clean the text first
    text = clean_text(text)
    
    # Split into lines and process
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        
        # Skip empty lines initially
        if not line:
            formatted_lines.append('')
            continue
        
        # Detect and format different content types
        if re.match(r'^\*\*.*\*\*$', line):  # Already formatted header
            formatted_lines.append(line)
        elif any(header in line.upper() for header in [
            'REQUIREMENTS', 'QUALIFICATIONS', 'RESPONSIBILITIES', 'SKILLS', 
            'EXPERIENCE', 'EDUCATION', 'ABOUT', 'OVERVIEW', 'JOB DESCRIPTION',
            'POSITION', 'ROLE', 'DUTIES', 'COMPANY', 'BENEFITS'
        ]):
            formatted_lines.append(f"**{line}**")
        elif line.startswith(('•', '▪', '▫', '◦', '‣', '⁃', '-', '*')):
            formatted_lines.append(line)
        elif re.match(r'^\d+[\.\)]\s', line):  # Numbered list
            formatted_lines.append(line)
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def count_tokens(text):
    """Count tokens in text"""
    return len(tokenizer.encode(text))

def truncate_text(text, max_tokens):
    """Truncate text to max_tokens while preserving structure"""
    tokens = tokenizer.encode(text)
    if len(tokens) <= max_tokens:
        return text
    
    # Try to truncate at paragraph boundaries
    paragraphs = text.split('\n\n')
    current_text = ""
    
    for paragraph in paragraphs:
        test_text = current_text + '\n\n' + paragraph if current_text else paragraph
        if count_tokens(test_text) <= max_tokens:
            current_text = test_text
        else:
            break
    
    if current_text:
        return current_text
    
    # Fallback to token-based truncation
    truncated_tokens = tokens[:max_tokens]
    return tokenizer.decode(truncated_tokens)

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
            
            # Apply job description formatting
            jd_text = format_job_description_text(jd_text)
            
            # Truncate JD if too long
            if count_tokens(jd_text) > MAX_JD_TOKENS:
                jd_text = truncate_text(jd_text, MAX_JD_TOKENS)
                logger.info(f"Truncated job description to {MAX_JD_TOKENS} tokens")
            
            return jd_text, None
    
    # If no file, check for text job description
    jd_text = request.form.get('job_description', '').strip()
    if jd_text:
        jd_text = format_job_description_text(jd_text)
        
        # Truncate JD if too long
        if count_tokens(jd_text) > MAX_JD_TOKENS:
            jd_text = truncate_text(jd_text, MAX_JD_TOKENS)
            logger.info(f"Truncated job description to {MAX_JD_TOKENS} tokens")
        
        return jd_text, None
    
    return None, "No job description provided (neither text nor file)"

def chunk_text_improved(text, max_tokens=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Improved text chunking with overlap and structure preservation"""
    # Try to split at natural boundaries first
    sections = re.split(r'\n\s*\n', text)
    chunks = []
    current_chunk = ""
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
        
        # Check if adding this section would exceed token limit
        test_chunk = current_chunk + '\n\n' + section if current_chunk else section
        
        if count_tokens(test_chunk) <= max_tokens:
            current_chunk = test_chunk
        else:
            # Save current chunk if it exists
            if current_chunk:
                chunks.append(current_chunk)
            
            # If section itself is too long, split it further
            if count_tokens(section) > max_tokens:
                # Split by sentences or tokens
                tokens = tokenizer.encode(section)
                start = 0
                while start < len(tokens):
                    end = min(start + max_tokens, len(tokens))
                    chunk_tokens = tokens[start:end]
                    chunk_text = tokenizer.decode(chunk_tokens)
                    chunks.append(chunk_text)
                    start = end - overlap
            else:
                current_chunk = section
    
    # Add final chunk
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks if chunks else [text]

def build_faiss_index(chunks, model):
    """Build FAISS index for chunks with error handling"""
    try:
        if not chunks:
            return None, None
        
        # Limit number of chunks to process
        if len(chunks) > MAX_CHUNKS_TO_PROCESS:
            chunks = chunks[:MAX_CHUNKS_TO_PROCESS]
            logger.info(f"Limited processing to {MAX_CHUNKS_TO_PROCESS} chunks")
        
        embeddings = model.encode(chunks, convert_to_tensor=False, show_progress_bar=False)
        dim = len(embeddings[0])
        index = faiss.IndexFlatL2(dim)
        index.add(np.array(embeddings).astype("float32"))
        return index, embeddings
        
    except Exception as e:
        logger.error(f"Error building FAISS index: {str(e)}")
        return None, None

def retrieve_chunks(query, chunks, index, model, k=3):
    """Retrieve relevant chunks for a query"""
    try:
        if index is None or not chunks:
            return []
        
        query_vec = model.encode([query], convert_to_tensor=False, show_progress_bar=False)
        D, I = index.search(np.array(query_vec).astype("float32"), k)
        return [chunks[i] for i in I[0] if i < len(chunks)]
        
    except Exception as e:
        logger.error(f"Error retrieving chunks: {str(e)}")
        return chunks[:k] if len(chunks) >= k else chunks

def create_scoring_prompt(jd_text, resume_chunks):
    """Create a concise scoring prompt"""
    # Combine chunks intelligently
    combined_resume = " ".join(resume_chunks)
    
    # Create a very focused prompt
    prompt = f"""Job: {jd_text[:200]}...

Resume: {combined_resume[:300]}...

Score this resume match (0-100) and explain briefly:
Score: """
    
    # Ensure prompt is within token limits
    if count_tokens(prompt) > MAX_CONTEXT_TOKENS:
        # Reduce content further
        jd_summary = jd_text[:100] + "..."
        resume_summary = combined_resume[:150] + "..."
        
        prompt = f"""Job: {jd_summary}
Resume: {resume_summary}
Score (0-100): """
    
    return prompt

def extract_score_from_response(response):
    """Extract score and reasoning from LLM response"""
    try:
        # Clean the response
        response = response.strip()
        
        # Look for numerical score
        score_patterns = [
            r'(?:score|rating):\s*(\d+)',
            r'(\d+)(?:/100|\%)',
            r'(\d+)\s*(?:out of 100)',
            r'^(\d+)',  # Score at the beginning
        ]
        
        for pattern in score_patterns:
            match = re.search(pattern, response.lower())
            if match:
                score = float(match.group(1))
                score = max(0, min(100, score))  # Clamp between 0-100
                return score, response
        
        # If no explicit score found, estimate based on content
        if any(word in response.lower() for word in ['excellent', 'perfect', 'great', 'strong']):
            return 80.0, response
        elif any(word in response.lower() for word in ['good', 'suitable', 'match']):
            return 70.0, response
        elif any(word in response.lower() for word in ['fair', 'adequate', 'some']):
            return 60.0, response
        elif any(word in response.lower() for word in ['poor', 'weak', 'limited']):
            return 40.0, response
        else:
            return 50.0, response
            
    except Exception as e:
        logger.error(f"Error extracting score: {str(e)}")
        return 50.0, response

def process_resume_jd_matching(resume_text, jd_text, resume_name):
    """Process a single resume against a job description"""
    try:
        if resume_text.startswith("ERROR_") or resume_text == "EMPTY_FILE" or resume_text == "EMPTY_CONTENT":
            return {
                'resume_name': resume_name,
                'score': 0.0,
                'reasoning': f"Error processing resume: {resume_text}",
                'chunks_used': 0
            }
        
        # Chunk the resume
        chunks = chunk_text_improved(resume_text)
        logger.info(f"Created {len(chunks)} chunks for resume: {resume_name}")
        
        # Build index for this resume
        index, embeddings = build_faiss_index(chunks, embed_model)
        
        if index is None:
            return {
                'resume_name': resume_name,
                'score': 0.0,
                'reasoning': "Failed to build search index",
                'chunks_used': 0
            }
        
        # Retrieve relevant chunks based on job description
        top_chunks = retrieve_chunks(jd_text, chunks, index, embed_model, k=3)
        
        # Create scoring prompt
        prompt = create_scoring_prompt(jd_text, top_chunks)
        
        # Generate response
        response = llm_model(prompt, max_new_tokens=64, temperature=0.1)
        score, reasoning = extract_score_from_response(response)
        
        return {
            'resume_name': resume_name,
            'score': score,
            'reasoning': reasoning,
            'chunks_used': len(top_chunks)
        }
        
    except Exception as e:
        logger.error(f"Error processing resume {resume_name}: {str(e)}")
        return {
            'resume_name': resume_name,
            'score': 0.0,
            'reasoning': f"Error processing: {str(e)}",
            'chunks_used': 0
        }

@app.route('/api/extract-text', methods=['POST'])
def extract_text_endpoint():
    """Extract text from a PDF file"""
    try:
        # Get the PDF file from the request
        pdf_file = request.files.get('pdf_file')
        if not pdf_file:
            return jsonify({'error': 'No PDF file provided'}), 400
        
        # Extract text from the PDF
        text = extract_text_from_pdf(pdf_file)
        
        if text.startswith("ERROR_") or text == "EMPTY_CONTENT":
            return jsonify({'error': f'Failed to extract text: {text}'}), 400
        
        return jsonify({
            'text': text,
            'success': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get API status"""
    return jsonify({
        'status': 'running',
        'message': 'Resume Checker API is running',
        'config': {
            'max_context_tokens': MAX_CONTEXT_TOKENS,
            'max_resume_tokens': MAX_RESUME_TOKENS,
            'max_jd_tokens': MAX_JD_TOKENS,
            'chunk_size': CHUNK_SIZE,
            'max_chunks': MAX_CHUNKS_TO_PROCESS
        }
    })

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Simple test endpoint for debugging"""
    return jsonify({
        'message': 'API is working!',
        'timestamp': '2024-01-01T00:00:00Z',
        'models_loaded': {
            'embed_model': embed_model is not None,
            'llm_model': llm_model is not None,
            'tokenizer': tokenizer is not None
        }
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
            'job_description_source': 'file' if 'job_description_file' in request.files else 'text',
            'chunks_used': result['chunks_used']
        })
        
    except Exception as e:
        logger.error(f"Error in single resume check: {str(e)}")
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
                jd_text = format_job_description_text(request.form[key])
                if count_tokens(jd_text) > MAX_JD_TOKENS:
                    jd_text = truncate_text(jd_text, MAX_JD_TOKENS)
                job_descriptions.append(jd_text)
        
        # Also check for JD files in batch processing
        for key in request.files:
            if key.startswith('job_description_file_'):
                jd_file = request.files[key]
                jd_text = extract_text_from_pdf(jd_file)
                if not jd_text.startswith("ERROR_") and jd_text != "EMPTY_CONTENT":
                    jd_text = format_job_description_text(jd_text)
                    if count_tokens(jd_text) > MAX_JD_TOKENS:
                        jd_text = truncate_text(jd_text, MAX_JD_TOKENS)
                    job_descriptions.append(jd_text)
        
        if not resumes:
            return jsonify({'error': 'No resume files provided'}), 400
        
        if not job_descriptions:
            return jsonify({'error': 'No job descriptions provided'}), 400
        
        # Process all combinations
        results = []
        for i, resume_file in enumerate(resumes):
            logger.info(f"Processing resume {i+1}/{len(resumes)}: {resume_file.filename}")
            resume_text = extract_text_from_pdf(resume_file)
            
            for j, jd in enumerate(job_descriptions):
                logger.info(f"Processing JD {j+1}/{len(job_descriptions)}")
                result = process_resume_jd_matching(
                    resume_text, 
                    jd, 
                    resume_file.filename
                )
                result['job_description'] = jd[:100] + "..." if len(jd) > 100 else jd
                results.append(result)
        
        return jsonify({
            'results': results,
            'total_processed': len(results),
            'resumes_count': len(resumes),
            'job_descriptions_count': len(job_descriptions)
        })
        
    except Exception as e:
        logger.error(f"Error in batch resume check: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Loading AI models...")
    load_models()
    print("Models loaded successfully!")
    print("Starting Flask server on http://localhost:8501")
    app.run(host='0.0.0.0', port=8501, debug=False)