#!/usr/bin/env python3
"""
Simple test script to verify the resume checker API is working
"""

import requests
import json

def test_api_status():
    """Test if the API server is running"""
    try:
        response = requests.get('http://localhost:8501/api/status')
        if response.status_code == 200:
            print("✅ API server is running")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ API server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server. Make sure it's running on http://localhost:8501")
        return False
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return False

def test_single_resume_check():
    """Test the single resume check endpoint"""
    try:
        # Create a simple test with text data
        data = {
            'job_description': 'Software Engineer with Python experience',
            'max_score': '100',
            'cutoff_score': '70'
        }
        
        # Create a simple text file for testing
        files = {
            'resume': ('test_resume.txt', 'Experienced Python developer with 5 years of experience in web development.', 'text/plain')
        }
        
        response = requests.post('http://localhost:8501/api/single-resume-check', data=data, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Single resume check test passed")
            print(f"Score: {result.get('score', 'N/A')}")
            print(f"Reasoning: {result.get('reasoning', 'N/A')[:100]}...")
            return True
        else:
            print(f"❌ Single resume check failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing single resume check: {e}")
        return False

def test_batch_resume_check():
    """Test the batch resume check endpoint"""
    try:
        # Create test data
        data = {
            'job_description_0': 'Software Engineer with Python experience',
            'job_description_1': 'Data Scientist with machine learning skills'
        }
        
        # Create test files
        files = {
            'resume_0': ('test_resume1.txt', 'Experienced Python developer with 5 years of experience in web development.', 'text/plain'),
            'resume_1': ('test_resume2.txt', 'Data scientist with expertise in machine learning and Python.', 'text/plain')
        }
        
        response = requests.post('http://localhost:8501/api/resume-checker', data=data, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Batch resume check test passed")
            print(f"Total results: {result.get('total_processed', 0)}")
            print(f"Results: {len(result.get('results', []))}")
            return True
        else:
            print(f"❌ Batch resume check failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing batch resume check: {e}")
        return False

if __name__ == "__main__":
    print("Testing Resume Checker API...")
    print("=" * 50)
    
    # Test API status
    if not test_api_status():
        print("\n❌ API server is not available. Please start the server first:")
        print("cd Hiresync/pdf-qa")
        print("python api_server.py")
        exit(1)
    
    print("\n" + "=" * 50)
    
    # Test single resume check
    test_single_resume_check()
    
    print("\n" + "=" * 50)
    
    # Test batch resume check
    test_batch_resume_check()
    
    print("\n" + "=" * 50)
    print("✅ API testing completed!") 