# Manual Upload Resume Checker Guide

## Overview
The Manual Upload Resume Checker allows both candidates and recruiters to upload resumes and job descriptions for AI-powered matching analysis.

## Features

### For Candidates
- Upload your resume (PDF or TXT format)
- Add multiple job descriptions to check against
- Upload job description PDFs
- Get detailed match scores and analysis

### For Recruiters
- Upload multiple resumes (PDF or TXT format)
- Add multiple job descriptions
- Upload job description PDFs
- Batch analysis of all resume-job combinations

## How to Use

### 1. Access the Manual Upload Section
- Navigate to the Resume Checker page
- Click the "Manual Upload" button in the top right

### 2. Upload Resumes
- Click "Choose Files" (recruiters) or "Choose Resume" (candidates)
- Select PDF or TXT files
- You can upload multiple files
- Remove files by clicking the "×" button

### 3. Add Job Descriptions
- **Text Input**: Paste job descriptions directly into the text areas
- **PDF Upload**: Click "Upload JD PDF" to upload job description PDFs
- Add multiple job descriptions using the "Add JD" button
- Remove job descriptions using the "Remove" button

### 4. Analyze
- Click "Analyze Resumes" (recruiters) or "Check Resume Match" (candidates)
- Wait for the analysis to complete
- View results with match scores and detailed reasoning

### 5. View Results
- Each result shows:
  - Resume name and job title
  - Match score (0-100%)
  - Detailed analysis and reasoning
- Results are color-coded based on score:
  - Green: High match (80-100%)
  - Yellow: Medium match (60-79%)
  - Red: Low match (0-59%)

## File Requirements

### Resume Files
- **Format**: PDF or TXT
- **Size**: Maximum 10MB per file
- **Content**: Should contain relevant information like skills, experience, education

### Job Description Files
- **Format**: PDF only
- **Size**: Maximum 10MB per file
- **Content**: Should contain detailed job requirements, responsibilities, and qualifications

## Troubleshooting

### Common Issues

1. **"Please upload at least one resume"**
   - Make sure you've selected and uploaded resume files
   - Check that files are in PDF or TXT format

2. **"Please provide at least one job description"**
   - Add either text job descriptions or upload JD PDFs
   - Make sure at least one job description is provided

3. **"API not connected"**
   - Check if the API server is running
   - Ensure the server is accessible at http://localhost:8501

4. **"Failed to analyze resumes"**
   - Check the API server logs for errors
   - Verify file formats and sizes
   - Try uploading different files

### API Server Setup

If the API server is not running:

1. Navigate to the API directory:
   ```bash
   cd Hiresync/pdf-qa
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   python api_server.py
   ```

4. The server should start on http://localhost:8501

### Testing the API

Run the test script to verify the API is working:
```bash
cd Hiresync/pdf-qa
python test_api.py
```

## Tips for Better Results

1. **Resume Quality**: Ensure resumes contain relevant keywords and detailed information
2. **Job Description Clarity**: Provide comprehensive job descriptions with specific requirements
3. **File Quality**: Use high-quality PDFs with clear text (avoid scanned images)
4. **Multiple JDs**: Try different job descriptions to see how your resume matches various roles

## Reset Functionality

Use the "Reset" button to:
- Clear all uploaded files
- Reset job descriptions
- Clear previous results
- Start fresh with new uploads

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the API server is running
3. Test with different file formats
4. Contact support with specific error messages 