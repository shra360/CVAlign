# HireSync - Smart Hiring Platform

## 🎯 Overview
**HireSync** is a resume-centric, smart hiring platform for modern recruiters and candidates. Built with AI-powered resume matching and seamless communication tools.

## 🧩 CORE MODULES

### 1. Landing Page
- **Hero Section** with animations or Lottie
- **Value Propositions:**
  - 🔍 Smart Resume Matcher
  - 👩‍💼 Personalized Profiles  
  - 🔔 Real-time Application Updates
- **Navigation:** About | Sign In | Sign Up | Explore Jobs

### 2. Authentication (Firebase Auth)
- **Sign In / Sign Up** with email/password
- **Google Sign-In** (OAuth2)
- **Role Selection** (Candidate / Recruiter) after first sign up
- **User Info Storage** in Firestore

## 🎭 USER FLOWS

### 👤 Recruiter Flow

#### Profile Setup
- **Fields:** Name, Bio, Profile Picture, Company Name, Designation, Tags/Industries, Contact Info
- **Storage:** Firestore
- **Image Upload:** Firebase Storage

#### Post Job
- **Fields:** Title, Description, Requirements (parsed to create JD), Tags, Location, Salary
- **Optional:** Upload JD PDF
- **Storage:** Jobs collection in Firestore

#### Applications Panel
- View applications for each job
- See candidate profile + resume
- **Built-in Resume-to-JD Matcher** (using `resume_checker.py`)
- Score candidates and write feedback

#### Communication
- **In-app Chat:** DM candidates
- **Email:** SendGrid or Firebase Cloud Functions
- **Bookmark:** Save favorite candidates

### 👤 Candidate Flow

#### Profile Setup
- **Fields:** Name, Bio, Profile Picture, Resume Upload, Skills/Tags, Education, Experience
- **Resume Storage:** Firebase Storage
- **Parsing:** Resume parser for indexing (optional)
- **Image Storage:** Firebase Storage

#### Job Feed
- **Filtering:** By tags, location, experience
- **Save Jobs:** Bookmark functionality
- **One-Click Apply:** Streamlined application process
- **Pre-Application Check:** Optional resume checker before applying

#### Resume Matcher (Self-Check)
- Choose JD or paste custom description
- Upload resume
- Get similarity score + detailed explanation
- **Uses:** `resume_checker.py` for accurate matching

#### Communication
- **Chat:** With recruiter (if enabled)
- **Notifications:** Email alerts for application updates

## 🔧 TECHNICAL ARCHITECTURE

### Backend Services
- **Firebase Auth:** User authentication
- **Firestore:** User profiles, jobs, applications
- **Firebase Storage:** Resume files
- **SendGrid:** Email notifications

### AI/ML Components
- **Resume Checker:** `resume_checker.py` integration
  - Mistral 7B local model
  - FAISS vector search
  - Sentence transformers for embeddings
  - Multi-resume to multi-JD matching

### Frontend Features
- **Real-time Updates:** Firebase listeners
- **File Upload:** Drag & drop interface
- **Chat System:** Real-time messaging
- **Analytics Dashboard:** Application metrics

## 📊 RESUME MATCHING FEATURES

### Powered by `resume_checker.py`
- **Multi-resume Processing:** Up to 200 resumes
- **Multi-JD Matching:** Up to 10 job descriptions
- **Scoring System:** 0-100 scale with configurable cutoff
- **Detailed Reasoning:** AI-generated explanations
- **Export Results:** CSV download functionality

### Matching Algorithm
- **Semantic Search:** FAISS vector similarity
- **Context-Aware:** Intelligent chunking and retrieval
- **Token Management:** Optimized for model context limits
- **Error Handling:** Robust file processing

## 🚀 DEPLOYMENT CONSIDERATIONS

### Performance
- **Caching:** Model loading with Streamlit cache
- **Batch Processing:** Efficient multi-file handling
- **Progress Tracking:** Real-time status updates

### Scalability
- **Cloud Storage:** Firebase for file management
- **Database:** Firestore for structured data
- **CDN:** Firebase Hosting's CDN for static assets and file delivery

### Security
- **Authentication:** Firebase Auth
- **File Validation:** PDF/TXT format checking
- **Error Handling:** Graceful failure management

## 📱 USER EXPERIENCE

### Recruiter Benefits
- **Efficient Screening:** AI-powered candidate ranking
- **Time Savings:** Automated resume analysis
- **Better Matches:** Semantic understanding of requirements
- **Communication Tools:** Integrated chat and email

### Candidate Benefits
- **Self-Assessment:** Resume matching before applying
- **Better Targeting:** Understand job requirements
- **Quick Applications:** Streamlined process
- **Real-time Updates:** Application status tracking

## 🔄 INTEGRATION POINTS

### Resume Checker Integration
- **API Endpoint:** RESTful service for matching
- **Batch Processing:** Multiple resume/JD combinations
- **Result Storage:** Firestore for persistence
- **Real-time Updates:** WebSocket for live results

### Third-party Services
- **Email:** SendGrid integration
- **Storage:** Firebase Storage
- **Authentication:** Google OAuth
- **Analytics:** Firebase Analytics

---

*HireSync combines modern web technologies with AI-powered resume matching to create a comprehensive hiring platform that benefits both recruiters and candidates.*
