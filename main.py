import streamlit as st
import fitz  # PyMuPDF
import tiktoken
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from ctransformers import AutoModelForCausalLM

# --- Setup ---
@st.cache_resource
def load_models():
    embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    llm_model = AutoModelForCausalLM.from_pretrained(
        "./mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        model_type="mistral",
        gpu_layers=0,
        max_new_tokens=256,
        context_length=512  # Explicitly set context length
    )
    return embed_model, llm_model

embed_model, llm = load_models()

# --- Utils ---
def extract_text_from_pdf(uploaded_file):
    doc = fitz.open(stream=uploaded_file.read(), filetype="pdf")
    return "\n".join([page.get_text() for page in doc])

def chunk_text(text, max_tokens=80, stride=40):  # Reduced chunk size
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
    embeddings = model.encode(chunks, convert_to_tensor=False)
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))
    return index, embeddings

def retrieve_chunks(query, chunks, index, model, k=3):  # Reduced k to 3
    query_vec = model.encode([query], convert_to_tensor=False)
    D, I = index.search(np.array(query_vec).astype("float32"), k)
    return [chunks[i] for i in I[0]]

def make_prompt(question, context_chunks, model_max_tokens=512):
    enc = tiktoken.get_encoding("cl100k_base")
    
    # Create base prompt template
    base_prompt = (
        "Use the context to answer the question.\n\n"
        f"Question: {question}\nAnswer:"
    )
    
    base_tokens = len(enc.encode(base_prompt))
    
    # Reserve tokens for the answer generation
    reserved_for_answer = 100
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
    
    # Final prompt
    prompt = (
        "Use the context to answer the question.\n\n"
        f"Context:\n{context}"
        f"Question: {question}\n"
        f"Answer:"
    )
    
    # Verify final prompt length
    final_tokens = len(enc.encode(prompt))
    if final_tokens > model_max_tokens - 50:  # Leave some buffer
        # Truncate context if still too long
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

# --- Streamlit UI ---
st.set_page_config(page_title="📄 PDF Q&A Chatbot")
st.title("📄 PDF Q&A Chatbot (Local RAG)")

uploaded = st.file_uploader("Upload a PDF file", type="pdf")

if uploaded:
    with st.spinner("📄 Reading and processing PDF..."):
        raw_text = extract_text_from_pdf(uploaded)
        chunks = chunk_text(raw_text)

        # Store in session to avoid recomputing
        if "index" not in st.session_state or st.session_state.get("uploaded_file") != uploaded.name:
            index, embeddings = build_faiss_index(chunks, embed_model)
            st.session_state.index = index
            st.session_state.chunks = chunks
            st.session_state.uploaded_file = uploaded.name

    st.success(f"✅ PDF processed into {len(st.session_state.chunks)} chunks. Ask your question below.")

    question = st.text_input("🧠 Ask a question about the PDF")

    if question:
        with st.spinner("🔍 Retrieving & generating answer..."):
            top_chunks = retrieve_chunks(
                question,
                st.session_state.chunks,
                st.session_state.index,
                embed_model,
                k=3
            )
            prompt = make_prompt(question, top_chunks)
            
            # Debug: Show token count
            enc = tiktoken.get_encoding("cl100k_base")
            token_count = len(enc.encode(prompt))
            
            with st.expander("Debug Info"):
                st.write(f"Prompt token count: {token_count}")
                st.text_area("Generated prompt:", prompt, height=200)
            
            try:
                answer = llm(prompt, max_new_tokens=100)  # Reduced max_new_tokens
                
                st.markdown("### 🧾 Answer")
                st.write(answer)
                
            except Exception as e:
                st.error(f"Error generating answer: {str(e)}")
                st.info("Try asking a shorter question or check if your model supports the current context length.")

# Add some helpful information
with st.sidebar:
    st.markdown("### ℹ️ Model Info")
    st.write("- Context Length: 512 tokens")
    st.write("- Chunk Size: 80 tokens")
    st.write("- Max Retrieved Chunks: 3")
    st.write("- Max New Tokens: 100")
    
    st.markdown("### 💡 Tips")
    st.write("- Keep questions concise")
    st.write("- The model has limited context")
    st.write("- Check debug info if issues occur")