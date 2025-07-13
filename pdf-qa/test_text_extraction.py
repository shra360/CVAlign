#!/usr/bin/env python3
"""
Test script for the text extraction API endpoint
"""

import requests
import json

def test_text_extraction():
    """Test the text extraction endpoint"""
    try:
        # Create a simple test PDF content (this would normally be a real PDF file)
        # For testing, we'll create a simple text file and send it
        test_content = "This is a test job description.\n\nRequirements:\n- Python experience\n- 3+ years of development\n- Team collaboration skills"
        
        # Create a file-like object
        files = {
            'pdf_file': ('test_jd.pdf', test_content, 'application/pdf')
        }
        
        print("Testing text extraction API...")
        response = requests.post('http://localhost:8501/api/extract-text', files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Text extraction test passed")
            print(f"Response: {result}")
            return True
        else:
            print(f"❌ Text extraction failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing text extraction: {e}")
        return False

if __name__ == "__main__":
    print("Testing Text Extraction API...")
    print("=" * 50)
    
    test_text_extraction()
    
    print("\n" + "=" * 50)
    print("✅ Text extraction testing completed!") 