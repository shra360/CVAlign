import streamlit as st
import fitz  # PyMuPDF
import tiktoken
import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from ctransformers import AutoModelForCausalLM
import os
from typing import List, Dict, Tuple
import tempfile

# --- Setup ---
@st.cache_resource
def load_models():
    embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    llm_model = AutoModelForCausalLM.from_pretrained(
        "./mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        model_type="mistral",
        gpu_layers=0,
        max_new_tokens=256,
        context_length=512
    )
    return embed_model, llm_model

embed_model, llm = load_models()

# --- Utils ---
def extract_text_from_pdf(uploaded_file):
    """Extract text from uploaded PDF file"""
    try:
        # Reset file pointer to beginning
        uploaded_file.seek(0)
        
        # Check if file is empty
        if uploaded_file.size == 0:
            return "EMPTY_FILE"
        
        doc = fitz.open(stream=uploaded_file.read(), filetype="pdf")
        text = "\n".join([page.get_text() for page in doc])
        doc.close()
        
        # Reset file pointer for potential future reads
        uploaded_file.seek(0)
        
        return text if text.strip() else "EMPTY_CONTENT"
    except Exception as e:
        uploaded_file.seek(0)  # Reset pointer even on error
        return f"ERROR_EXTRACTING_TEXT: {str(e)}"

def chunk_text(text, max_tokens=80, stride=40):
    """Split text into chunks for processing"""
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
    """Build FAISS index for semantic search"""
    embeddings = model.encode(chunks, convert_to_tensor=False)
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))
    return index, embeddings

def retrieve_chunks(query, chunks, index, model, k=3):
    """Retrieve most relevant chunks for a query"""
    query_vec = model.encode([query], convert_to_tensor=False)
    D, I = index.search(np.array(query_vec).astype("float32"), k)
    return [chunks[i] for i in I[0]]

def make_prompt(jd, context_chunks, model_max_tokens=512):
    """Create prompt for LLM to evaluate resume against JD"""
    enc = tiktoken.get_encoding("cl100k_base")
    
    base_prompt = (
        "Evaluate how well this resume matches the job description. "
        "Consider skills, experience, education, and overall fit. "
        "Provide a score out of 100 and brief reasoning.\n\n"
        f"Job Description: {jd}\n\n"
        "Resume Content:\n"
    )
    
    base_tokens = len(enc.encode(base_prompt))
    reserved_for_answer = 150
    available_for_context = model_max_tokens - base_tokens - reserved_for_answer
    
    # Build context within token limit
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
        "Evaluate how well this resume matches the job description. "
        "Consider skills, experience, education, and overall fit. "
        "Provide a score out of 100 and brief reasoning.\n\n"
        f"Job Description: {jd}\n\n"
        f"Resume Content:\n{context}\n"
        "Evaluation (Score/100 and reasoning):"
    )
    
    return prompt

def extract_score_from_response(response: str) -> Tuple[float, str]:
    """Extract numerical score from LLM response"""
    try:
        # Look for numbers in the response
        import re
        numbers = re.findall(r'\b(\d+(?:\.\d+)?)\b', response)
        if numbers:
            # Take the first number that's between 0 and 100
            for num in numbers:
                score = float(num)
                if 0 <= score <= 100:
                    return score, response
        # If no valid score found, return 0
        return 0.0, response
    except:
        return 0.0, response

def process_resume_jd_matching(resume_text: str, jd: str, resume_name: str) -> Dict:
    """Process a single resume against a job description"""
    # Chunk the resume
    chunks = chunk_text(resume_text)
    
    # Build index for this resume
    index, embeddings = build_faiss_index(chunks, embed_model)
    
    # Retrieve relevant chunks
    top_chunks = retrieve_chunks(jd, chunks, index, embed_model, k=3)
    
    # Create prompt and get LLM response
    prompt = make_prompt(jd, top_chunks)
    
    try:
        response = llm(prompt, max_new_tokens=100)
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

# --- Streamlit UI ---
st.set_page_config(page_title="📄 Resume Checker", layout="wide")
st.title("📄 Resume Checker & JD Matcher")

# Sidebar for configuration
with st.sidebar:
    st.header("⚙️ Configuration")
    max_score = st.number_input("Maximum Score", min_value=50, max_value=200, value=100, step=10)
    cutoff_score = st.number_input("Cutoff Score", min_value=0, max_value=max_score, value=70, step=5)
    
    st.markdown("### 📊 Current Settings")
    st.write(f"Max Score: {max_score}")
    st.write(f"Cutoff Score: {cutoff_score}")
    st.write(f"Model: Mistral 7B (Local)")

# Main content area
col1, col2 = st.columns([1, 1])

with col1:
    st.header("📄 Upload Resumes")
    uploaded_resumes = st.file_uploader(
        "Upload multiple resumes (PDF files)", 
        type="pdf", 
        accept_multiple_files=True,
        help="You can upload up to 200 resume files"
    )
    
    if uploaded_resumes:
        st.success(f"✅ Uploaded {len(uploaded_resumes)} resumes")
        
        # Display resume names
        with st.expander("📋 Uploaded Resumes"):
            for i, resume in enumerate(uploaded_resumes):
                st.write(f"{i+1}. {resume.name}")

with col2:
    st.header("💼 Upload Job Descriptions")
    uploaded_jds = st.file_uploader(
        "Upload job descriptions (PDF/TXT files)", 
        type=["pdf", "txt"], 
        accept_multiple_files=True,
        help="You can upload up to 10 job description files"
    )
    
    if uploaded_jds:
        st.success(f"✅ Uploaded {len(uploaded_jds)} job descriptions")
        
        # Display JD names
        with st.expander("📋 Uploaded Job Descriptions"):
            for i, jd in enumerate(uploaded_jds):
                st.write(f"{i+1}. {jd.name}")

# Process button
if uploaded_resumes and uploaded_jds:
    if st.button("🚀 Start Matching Process", type="primary"):
        if len(uploaded_jds) > 10:
            st.error("❌ Maximum 10 job descriptions allowed")
        elif len(uploaded_resumes) > 200:
            st.error("❌ Maximum 200 resumes allowed")
        else:
            # Initialize results storage
            all_results = []
            
            # Progress bar
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            total_operations = len(uploaded_resumes) * len(uploaded_jds)
            current_operation = 0
            
            # Process each JD against each resume
            for jd_idx, jd_file in enumerate(uploaded_jds):
                # Extract JD text
                if jd_file.type == "application/pdf":
                    jd_text = extract_text_from_pdf(jd_file)
                else:  # txt file
                    jd_file.seek(0)  # Reset file pointer
                    jd_text = jd_file.read().decode('utf-8')
                
                # Skip if JD text extraction failed
                if jd_text.startswith("ERROR_") or jd_text == "EMPTY_FILE" or jd_text == "EMPTY_CONTENT":
                    st.warning(f"⚠️ Could not extract text from JD: {jd_file.name}")
                    continue
                
                for resume_idx, resume_file in enumerate(uploaded_resumes):
                    # Update progress
                    current_operation += 1
                    progress = current_operation / total_operations
                    progress_bar.progress(progress)
                    status_text.text(f"Processing: {resume_file.name} against {jd_file.name}")
                    
                    # Extract resume text
                    resume_text = extract_text_from_pdf(resume_file)
                    
                    # Skip if resume text extraction failed
                    if resume_text.startswith("ERROR_") or resume_text == "EMPTY_FILE" or resume_text == "EMPTY_CONTENT":
                        st.warning(f"⚠️ Could not extract text from resume: {resume_file.name}")
                        continue
                    
                    # Process matching
                    result = process_resume_jd_matching(
                        resume_text, 
                        jd_text, 
                        resume_file.name
                    )
                    
                    # Add JD info to result
                    result['jd_name'] = jd_file.name
                    result['jd_index'] = jd_idx
                    result['resume_index'] = resume_idx
                    
                    all_results.append(result)
            
            # Store results in session state
            st.session_state.matching_results = all_results
            st.session_state.uploaded_jds = uploaded_jds
            st.session_state.uploaded_resumes = uploaded_resumes
            
            progress_bar.progress(1.0)
            status_text.text("✅ Matching completed!")
            
            st.success(f"✅ Processed {len(uploaded_resumes)} resumes against {len(uploaded_jds)} job descriptions")

# Display results
if 'matching_results' in st.session_state:
    st.header("📊 Results")
    
    # Convert results to DataFrame
    df = pd.DataFrame(st.session_state.matching_results)
    
    # Create tabs for different views
    tab1, tab2, tab3 = st.tabs(["📈 Summary", "📋 Detailed Results", "📊 Analytics"])
    
    with tab1:
        st.subheader("📈 Summary by Job Description")
        
        for jd_idx, jd_file in enumerate(st.session_state.uploaded_jds):
            jd_results = df[df['jd_index'] == jd_idx]
            
            if not jd_results.empty:
                st.markdown(f"### {jd_file.name}")
                
                # Calculate statistics
                avg_score = jd_results['score'].mean()
                max_score_found = jd_results['score'].max()
                min_score_found = jd_results['score'].min()
                passed_cutoff = len(jd_results[jd_results['score'] >= cutoff_score])
                total_resumes = len(jd_results)
                
                # Display stats
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Average Score", f"{avg_score:.1f}")
                with col2:
                    st.metric("Highest Score", f"{max_score_found:.1f}")
                with col3:
                    st.metric("Passed Cutoff", f"{passed_cutoff}/{total_resumes}")
                with col4:
                    st.metric("Pass Rate", f"{(passed_cutoff/total_resumes)*100:.1f}%")
                
                # Top candidates
                top_candidates = jd_results.nlargest(5, 'score')
                st.markdown("**Top 5 Candidates:**")
                for _, candidate in top_candidates.iterrows():
                    status = "✅ PASSED" if candidate['score'] >= cutoff_score else "❌ FAILED"
                    st.write(f"- {candidate['resume_name']}: {candidate['score']:.1f}/100 {status}")
                
                st.divider()
    
    with tab2:
        st.subheader("📋 Detailed Results")
        
        # Filter options
        col1, col2 = st.columns(2)
        with col1:
            selected_jd = st.selectbox(
                "Select Job Description",
                [jd.name for jd in st.session_state.uploaded_jds]
            )
        with col2:
            show_passed_only = st.checkbox("Show only passed candidates", value=False)
        
        # Filter data
        jd_idx = [i for i, jd in enumerate(st.session_state.uploaded_jds) if jd.name == selected_jd][0]
        filtered_df = df[df['jd_index'] == jd_idx]
        
        if show_passed_only:
            filtered_df = filtered_df[filtered_df['score'] >= cutoff_score]
        
        # Sort by score
        filtered_df = filtered_df.sort_values('score', ascending=False)
        
        # Display results
        for _, row in filtered_df.iterrows():
            status = "✅ PASSED" if row['score'] >= cutoff_score else "❌ FAILED"
            with st.expander(f"{row['resume_name']} - Score: {row['score']:.1f}/100 {status}"):
                st.write("**Reasoning:**")
                st.write(row['reasoning'])
                st.write(f"**Chunks used:** {row['chunks_used']}")
    
    with tab3:
        st.subheader("📊 Analytics")
        
        # Overall statistics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Matches", len(df))
        with col2:
            st.metric("Average Score", f"{df['score'].mean():.1f}")
        with col3:
            st.metric("Pass Rate", f"{(len(df[df['score'] >= cutoff_score])/len(df))*100:.1f}%")
        
        # Score distribution
        st.subheader("Score Distribution")
        fig = pd.DataFrame({
            'Score Range': ['0-20', '21-40', '41-60', '61-80', '81-100'],
            'Count': [
                len(df[df['score'] <= 20]),
                len(df[(df['score'] > 20) & (df['score'] <= 40)]),
                len(df[(df['score'] > 40) & (df['score'] <= 60)]),
                len(df[(df['score'] > 60) & (df['score'] <= 80)]),
                len(df[df['score'] > 80])
            ]
        })
        st.bar_chart(fig.set_index('Score Range'))
        
        # Export results
        st.subheader("📥 Export Results")
        csv = df.to_csv(index=False)
        st.download_button(
            label="Download Results as CSV",
            data=csv,
            file_name="resume_matching_results.csv",
            mime="text/csv"
        )

# Footer
st.markdown("---")
st.markdown("### 💡 Tips")
st.write("- Keep job descriptions concise and specific")
st.write("- Ensure resumes are in PDF format")
st.write("- Adjust cutoff score based on your requirements")
st.write("- Check detailed results for reasoning behind scores") 