#!/usr/bin/env python3
"""
Simple script to start the Resume Checker API server
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'flask',
        'flask-cors',
        'PyMuPDF',
        'tiktoken',
        'faiss-cpu',
        'numpy',
        'sentence-transformers',
        'ctransformers'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nInstall them with:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    print("✅ All dependencies are installed")
    return True

def start_server():
    """Start the API server"""
    print("🚀 Starting Resume Checker API Server...")
    print("📍 Server will be available at: http://localhost:8501")
    print("🔗 Test endpoint: http://localhost:8501/api/test")
    print("📊 Status endpoint: http://localhost:8501/api/status")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        # Start the server
        subprocess.run([sys.executable, "api_server.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        return False
    except FileNotFoundError:
        print("❌ api_server.py not found in current directory")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("Resume Checker API Server")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Start server
    start_server() 