# Resume Checker API Server

This Flask API server provides REST endpoints for the resume checking functionality, integrating with the AI models from `main.py`.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure you have the Mistral model file:
   - `mistral-7b-instruct-v0.2.Q4_K_M.gguf` should be in the same directory

## Running the Server

```bash
python api_server.py
```

The server will start on `http://localhost:8501`

## API Endpoints

### GET /api/status
Check if the API is running.

### POST /api/single-resume-check
Check a single resume against a job description.

**Form Data:**
- `resume`: PDF file
- `job_description`: Text description
- `max_score`: Maximum score (default: 100)
- `cutoff_score`: Cutoff score (default: 70)

**Response:**
```json
{
  "score": 85.5,
  "reasoning": "Detailed analysis...",
  "resume_name": "resume.pdf"
}
```

### POST /api/resume-checker
Check multiple resumes against multiple job descriptions.

**Form Data:**
- `resume_0`, `resume_1`, ...: PDF files
- `job_description_0`, `job_description_1`, ...: Text descriptions

**Response:**
```json
{
  "results": [
    {
      "resume_name": "resume1.pdf",
      "job_description": "Job description...",
      "score": 85.5,
      "reasoning": "Analysis...",
      "chunks_used": 3
    }
  ],
  "total_processed": 1
}
```

## Integration with Frontend

The frontend Resume Checker page calls these endpoints to:
1. Calculate scores for individual applications
2. Process bulk resume checking
3. Provide AI-powered resume matching

## Notes

- The server loads AI models on startup (may take a few minutes)
- Supports PDF files for resume processing
- Uses the same RAG + LLM pipeline as the Streamlit app
- CORS is enabled for frontend integration 