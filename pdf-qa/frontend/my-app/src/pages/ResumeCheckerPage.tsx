import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAppStore, type Application } from '../lib/store';
import { getApplications, getJobs, getRecruiterCutoff, setRecruiterCutoff, updateApplicationScore, getRecruiterAutoStatus, setRecruiterAutoStatus } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Inline SVG Icons
const FileTextIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const CalculatorIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Inline UI Components
const Button = ({ children, type = 'button', className = '', disabled = false, onClick, variant = 'primary' }: any) => {
  let base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm ';
  let color = '';
  if (variant === 'primary') color = 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
  else if (variant === 'secondary') color = 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-500';
  else if (variant === 'danger') color = 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500';
  else color = '';
  return (
  <button
    type={type}
      className={base + color + ' ' + className}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
};

const Textarea = ({ value, onChange, placeholder, className = '', required = false, id, rows = 4 }: any) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    rows={rows}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 resize-vertical ${className}`}
  />
);

const Card = React.forwardRef<HTMLDivElement, any>(({ children, className = '' }, ref) => (
  <div ref={ref} className={`bg-white rounded-lg border border-secondary-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
));

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants: Record<string, string> = {
    default: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    primary: 'bg-primary-100 text-primary-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

// Expandable Text Component
const ExpandableText = ({ text, maxLines = 2, className = '' }: { text: string; maxLines?: number; className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={className}>
      <div className={`text-sm text-secondary-600 whitespace-pre-wrap break-words ${
        isExpanded ? '' : `line-clamp-${maxLines}`
      }`}>
        {text}
      </div>
      {text.length > 100 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

interface ApplicationWithJob extends Application {
  job?: any;
  reasoning?: string;
  isCalculating?: boolean;
  candidateProfileImageUrl?: string;
  profileImageUrl?: string;
}

export function ResumeCheckerPage({ manualMode = false }: { manualMode?: boolean } = {}) {
  const { userProfile } = useAppStore();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatingAll, setCalculatingAll] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithJob | null>(null);
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [cutoffScore, setCutoffScore] = useState<number>(70);
  const [cutoffLoading, setCutoffLoading] = useState<boolean>(false);
  const [autoStatus, setAutoStatus] = useState<string>('shortlisted');
  const [autoStatusLoading, setAutoStatusLoading] = useState<boolean>(false);
  
  // Manual upload state (existing functionality)
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<string[]>(['']);
  const [manualResults, setManualResults] = useState<any[]>([]);
  const [showManualResults, setShowManualResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Candidate-only: manual checker result state
  const [candidateManualResults, setCandidateManualResults] = useState<any[]>([]);
  const [candidateManualLoading, setCandidateManualLoading] = useState(false);
  const [candidateResumeFiles, setCandidateResumeFiles] = useState<File[]>([]);
  const [candidateJobDescriptions, setCandidateJobDescriptions] = useState<string[]>(['']);
  const [candidateJDfiles, setCandidateJDfiles] = useState<(File | null)[]>([null]);

  // Add to recruiter state:
  const [jdFiles, setJDFiles] = useState<(File | null)[]>([null]);

  const manualSectionRef = useRef<HTMLDivElement>(null);

  // Check if user is logged in
  React.useEffect(() => {
    if (!userProfile) {
      toast.error('You must be logged in to access the resume checker');
      return;
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      // Only load recruiter-specific data if user is a recruiter
      if (userProfile.role === 'recruiter') {
        loadData();
        // Fetch recruiter's cutoff
        setCutoffLoading(true);
        getRecruiterCutoff(userProfile.id).then(score => {
          setCutoffScore(score);
          setCutoffLoading(false);
        });
        // Fetch recruiter's auto status
        setAutoStatusLoading(true);
        getRecruiterAutoStatus(userProfile.id).then(status => {
          setAutoStatus(status);
          setAutoStatusLoading(false);
        });
      }
    }
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load applications and jobs in parallel
      const [apps, jobsData] = await Promise.all([
        getApplications({ recruiterId: userProfile?.id }),
        getJobs({ recruiterId: userProfile?.id })
      ]);

      // Match applications with their jobs
      const appsWithJobs: ApplicationWithJob[] = (apps as any[]).map(app => ({
        ...app,
        job: jobsData.find(job => job.id === app.jobId)
      }));

      setApplications(appsWithJobs);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load applications and jobs');
    } finally {
      setLoading(false);
    }
  };

  // Handler to update cutoff in Firestore
  const handleCutoffChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setCutoffScore(value);
    if (userProfile?.id) {
      await setRecruiterCutoff(userProfile.id, value);
      toast.success('Cutoff score updated');
    }
  };

  // Handler to update auto status in Firestore
  const handleAutoStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAutoStatus(value);
    if (userProfile?.id) {
      await setRecruiterAutoStatus(userProfile.id, value);
      toast.success('Auto-status updated');
    }
  };

  const calculateScore = async (application: ApplicationWithJob) => {
    // Remove any UI that displays apiStatus or API connection status to the user
    // if (apiStatus !== 'connected') {
    //   toast.error('API not connected. Please check the API server.');
    //   return;
    // }

    if (!application.resumeUrl || (!application.job?.description && !application.job?.jdFileUrl)) {
      toast.error('Missing resume or job description');
      return;
    }

    // Check if the resume URL is a blob URL (which can't be accessed by the API server)
    if (application.resumeUrl.startsWith('blob:')) {
      toast.error('Resume is stored locally and cannot be processed. Please re-upload the resume.');
      return;
    }

    try {
      // Update application to show calculating state
      setApplications(prev => prev.map(app => 
        app.id === application.id ? { ...app, isCalculating: true } : app
      ));

      // Fetch resume file from URL
      const resumeResponse = await fetch(application.resumeUrl);
      if (!resumeResponse.ok) {
        throw new Error(`Failed to fetch resume: ${resumeResponse.status}`);
      }
      const resumeBlob = await resumeResponse.blob();
      const resumeFile = new File([resumeBlob], `${application.candidateName}_resume.pdf`, { type: 'application/pdf' });

      // Create FormData for the API call
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      // Use JD file if available, otherwise use job description text
      if (application.job?.jdFileUrl) {
        // Check if JD URL is a blob URL
        if (application.job.jdFileUrl.startsWith('blob:')) {
          toast.error('JD file is stored locally and cannot be processed. Please re-upload the JD file.');
          return;
        }
        
        // Fetch JD file from URL
        const jdResponse = await fetch(application.job.jdFileUrl);
        if (!jdResponse.ok) {
          throw new Error(`Failed to fetch JD file: ${jdResponse.status}`);
        }
        const jdBlob = await jdResponse.blob();
        const jdFile = new File([jdBlob], `${application.job.jdFileName || 'job_description.pdf'}`, { type: 'application/pdf' });
        formData.append('job_description_file', jdFile);
      } else {
        formData.append('job_description', application.job.description);
      }
      
      formData.append('max_score', '100');
      formData.append('cutoff_score', cutoffScore.toString());

      console.log('Sending request to API...');
      
      // Call the resume checker API (main.py functionality)
      const response = await fetch('http://localhost:8501/api/single-resume-check', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // If score meets/exceeds cutoff, set status to autoStatus; else set to 'failed'
      let newStatus: 'pending' | 'reviewed' | 'rejected' | 'shortlisted' | 'hired' | 'failed' = application.status;
      if (result.score >= cutoffScore) {
        // Only allow valid status values
        if (['shortlisted', 'hired', 'reviewed', 'pending', 'rejected', 'failed'].includes(autoStatus)) {
          newStatus = autoStatus as typeof newStatus;
        } else {
          newStatus = 'shortlisted';
        }
      } else {
        newStatus = 'failed';
      }

      // Persist score, reasoning, and status in Firestore
      await updateApplicationScore(application.id, result.score, result.reasoning, newStatus);

      // Update application with score and status
      setApplications(prev => prev.map(app => 
        app.id === application.id ? { 
          ...app, 
          score: result.score, 
          reasoning: result.reasoning,
          status: newStatus,
          isCalculating: false 
        } : app
      ));

      toast.success(`Score calculated: ${result.score}%`);
      
    } catch (error) {
      console.error('Error calculating score:', error);
      toast.error('Failed to calculate score');
      
      // Reset calculating state
      setApplications(prev => prev.map(app => 
        app.id === application.id ? { ...app, isCalculating: false } : app
      ));
    }
  };

  const calculateAllScores = async () => {
    const applicationsWithResume = applications.filter(app => 
      app.resumeUrl && (app.job?.description || app.job?.jdFileUrl) && !app.score
    );

    if (applicationsWithResume.length === 0) {
      toast('No applications to calculate scores for');
      return;
    }

    try {
      setCalculatingAll(true);
      
      for (const application of applicationsWithResume) {
        await calculateScore(application);
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast.success(`Calculated scores for ${applicationsWithResume.length} applications`);
    } catch (error) {
      console.error('Error calculating all scores:', error);
      toast.error('Failed to calculate some scores');
    } finally {
      setCalculatingAll(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= cutoffScore) return 'success';
    return 'error';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= cutoffScore) return 'text-success-600';
    return 'text-error-600';
  };

  // Helper to get valid date
  const getValidDate = (date: any) => {
    if (!date) return 'Date not available';
    
    try {
      // Handle Firebase Timestamp objects
      if (date && typeof date === 'object' && date.toDate) {
        return date.toDate().toLocaleDateString();
      }
      
      // Handle regular date strings/numbers
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return 'Invalid date';
      }
      return d.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Date error';
    }
  };

  // Manual upload handlers (existing functionality)
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Resume upload triggered', e.target.files);
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files);
    
    if (files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || file.type === 'text/plain';
      console.log(`File ${file.name}: type=${file.type}, valid=${isValid}`);
      return isValid;
    });
    
    if (validFiles.length !== files.length) {
      toast.error('Please upload only PDF or TXT files');
    }
    
    if (validFiles.length > 0) {
      setResumeFiles(prev => [...prev, ...validFiles]);
      toast.success(`Uploaded ${validFiles.length} file(s)`);
      console.log('Files added to state:', validFiles.map(f => f.name));
    }
    
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleRemoveResume = (index: number) => {
    setResumeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddJobDescription = () => {
    setJobDescriptions(prev => [...prev, '']);
    setJDFiles(prev => [...prev, null]);
  };

  const handleRemoveJobDescription = (index: number) => {
    if (jobDescriptions.length > 1) {
      setJobDescriptions(prev => prev.filter((_, i) => i !== index));
      setJDFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleJobDescriptionChange = (index: number, value: string) => {
    setJobDescriptions(prev => prev.map((desc, i) => i === index ? value : desc));
  };

  const handleJDFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('JD file upload triggered for index', index, e.target.files);
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log(`JD file selected: ${file.name}, type: ${file.type}`);
      if (file.type === 'application/pdf') {
        setJDFiles(prev => prev.map((jd, i) => i === index ? file : jd));
        toast.success(`Uploaded JD file: ${file.name}`);
        console.log('JD file added to state');
      } else {
        toast.error('Please upload only PDF files for job descriptions');
        console.log('Invalid file type for JD');
      }
    } else {
      console.log('No JD file selected');
    }
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const resetManualUpload = () => {
    setResumeFiles([]);
    setJobDescriptions(['']);
    setJDFiles([null]);
    setManualResults([]);
    setShowManualResults(false);
    setIsAnalyzing(false);
    toast.success('Manual upload reset');
  };

  const testFileInput = () => {
    console.log('Testing file input...');
    const input = document.getElementById('recruiter-resume-upload') as HTMLInputElement;
    if (input) {
      console.log('File input found, triggering click');
      input.click();
    } else {
      console.log('File input not found');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Files dropped:', e.dataTransfer.files);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || file.type === 'text/plain'
    );
    
    if (validFiles.length > 0) {
      setResumeFiles(prev => [...prev, ...validFiles]);
      toast.success(`Uploaded ${validFiles.length} file(s) via drag & drop`);
    } else {
      toast.error('Please drop only PDF or TXT files');
    }
  };

  const handleManualAnalyze = async () => {
    if (resumeFiles.length === 0) {
      toast.error('Please upload at least one resume');
      return;
    }
    
    // Check if we have at least one job description (either text or file)
    const hasTextJD = jobDescriptions.some(desc => desc.trim() !== '');
    const hasFileJD = jdFiles.some(jd => jd !== null);
    
    if (!hasTextJD && !hasFileJD) {
      toast.error('Please provide at least one job description (text or PDF file)');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add resume files
      resumeFiles.forEach((file, index) => {
        formData.append(`resume_${index}`, file);
      });
      
      // Add job descriptions and files
      jobDescriptions.forEach((desc, index) => {
        if (desc.trim()) {
          formData.append(`job_description_${index}`, desc);
        }
        if (jdFiles[index]) {
          formData.append(`job_description_file_${index}`, jdFiles[index]!);
        }
      });
      
      const response = await fetch('http://localhost:8501/api/resume-checker', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setManualResults(data.results || []);
      setShowManualResults(true);
      toast.success('Resume analysis completed!');
    } catch (error) {
      console.error('Error analyzing resumes:', error);
      toast.error(`Failed to analyze resumes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600">You must be logged in to use the resume checker.</p>
        </div>
      </div>
    );
  }

  // If recruiter and manualMode, show only manual upload section (with recruiter features)
  if (userProfile?.role === 'recruiter' && manualMode) {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
      <div>
            <h1 className="text-3xl font-bold text-secondary-900">Manual Resume Checker</h1>
            <p className="text-secondary-600">Upload resumes and job descriptions to analyze matches</p>
          </div>
        </div>
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">Manual Resume Upload</h2>
            <div className="flex space-x-2">
              <Button onClick={testFileInput} className="bg-green-600 text-white hover:bg-green-700">Test Upload</Button>
              <Button onClick={resetManualUpload} className="bg-blue-600 text-white hover:bg-blue-700">Reset</Button>
            </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-900">Upload Resumes</h3>
              <div 
                className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <UploadIcon />
                <p className="mt-2 text-sm text-secondary-600">
                  Drag and drop PDF or TXT files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="recruiter-resume-upload"
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor="recruiter-resume-upload" 
                  className="cursor-pointer inline-block"
                  onClick={() => {
                    console.log('Label clicked, triggering file input');
                    document.getElementById('recruiter-resume-upload')?.click();
                  }}
                >
                  <Button className="mt-4" variant="primary">
                    <FileTextIcon />
                    <span className="ml-2">Choose Files</span>
                  </Button>
                </label>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-secondary-900">
                  Uploaded Files ({resumeFiles.length}):
                </h4>
                {resumeFiles.length > 0 ? (
                  resumeFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileTextIcon />
                        <span className="text-sm text-secondary-700">{file.name}</span>
                        <span className="text-xs text-secondary-500">({file.type})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveResume(index)}
                        className="text-error-600 hover:text-error-800"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-secondary-500 italic">No files uploaded yet</div>
                )}
              </div>
            </div>
            {/* JD Inputs (multiple, with PDF upload) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Job Descriptions</h3>
                <Button
                  onClick={handleAddJobDescription}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add JD
                </Button>
              </div>
              {jobDescriptions.map((description, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-secondary-700">
                      Job Description {index + 1}
                    </label>
                    {jobDescriptions.length > 1 && (
                      <button
                        onClick={() => handleRemoveJobDescription(index)}
                        className="text-error-600 hover:text-error-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleJobDescriptionChange(index, e.target.value)}
                    placeholder="Paste job description here..."
                    rows={4}
                  />
                  <div className="mt-2">
                                                        <input
                    type="file"
                    accept=".pdf"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleJDFileUpload(index, e)}
                    id={`jd-upload-${index}`}
                    className="hidden"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor={`jd-upload-${index}`} 
                    className="cursor-pointer inline-block"
                    onClick={() => {
                      console.log('JD label clicked, triggering file input for index', index);
                      document.getElementById(`jd-upload-${index}`)?.click();
                    }}
                  >
                    <Button className="mt-2" variant="primary">
                      <UploadIcon />
                      <span className="ml-2">Upload JD PDF</span>
                    </Button>
                  </label>
                    {jdFiles[index] && (
                      <div className="text-xs text-secondary-700 mt-1">{jdFiles[index]?.name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Analyze Button */}
          <div className="mt-6">
            <Button
              onClick={handleManualAnalyze}
              disabled={resumeFiles.length === 0 || isAnalyzing}
              variant="primary"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <SearchIcon />
                  <span className="ml-2">Analyze Resumes</span>
                </>
              )}
            </Button>
          </div>
          {/* Manual Results */}
          {showManualResults && manualResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Results</h3>
              <div className="space-y-4">
                {manualResults.map((result, index) => (
                  <div key={index} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-secondary-900">
                        {result.resume_name || 'Resume'} → {result.job_title || 'Job Description'}
                      </h4>
                      <Badge variant={getScoreColor(result.score || 0)}>
                        {result.score || 0}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <StarIcon />
                        <span className="text-sm text-secondary-600">Match Score</span>
                        <span className="font-medium">{result.score || 0}%</span>
                      </div>
                      {result.reasoning && (
                        <div>
                          <p className="text-sm font-medium text-secondary-700 mb-1">Analysis:</p>
                          <div className="bg-secondary-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                            <p className="text-sm text-secondary-600 whitespace-pre-wrap break-words">
                              {result.reasoning}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Resume Checker</h1>
          <p className="text-secondary-600">
            {userProfile.role === 'recruiter' 
              ? 'AI-powered resume matching for your job applications'
              : 'Check how well your resume matches job descriptions'
            }
          </p>
        </div>
        <div className="flex space-x-3 items-center">
          
          {/* Recruiter-specific controls */}
          {userProfile.role === 'recruiter' && (
            <>
              {/* Cutoff Score Input */}
              <div className="flex items-center space-x-2">
                <label htmlFor="cutoff-score" className="text-sm text-secondary-700 font-medium">Cutoff:</label>
                <input
                  id="cutoff-score"
                  type="number"
                  min={0}
                  max={100}
                  value={cutoffScore}
                  onChange={handleCutoffChange}
                  className="w-16 px-2 py-1 border border-secondary-300 rounded text-sm"
                  disabled={cutoffLoading}
                />
              </div>
              {/* Auto Status Select */}
              <div className="flex items-center space-x-2">
                <label htmlFor="auto-status" className="text-sm text-secondary-700 font-medium">Auto Status:</label>
                <select
                  id="auto-status"
                  value={autoStatus}
                  onChange={handleAutoStatusChange}
                  className="w-28 px-2 py-1 border border-secondary-300 rounded text-sm"
                  disabled={autoStatusLoading}
                >
                  <option value="shortlisted">Shortlisted</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
              
              <Button
                onClick={calculateAllScores}
                disabled={calculatingAll || userProfile?.role !== 'recruiter'}
                variant="primary"
              >
                <CalculatorIcon />
                <span className="ml-2">
                  {calculatingAll ? 'Calculating...' : 'Calculate All'}
                </span>
              </Button>
            </>
          )}
          
          <Button
            onClick={() => manualSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            variant="primary"
          >
            <UploadIcon />
            <span className="ml-2">Manual Upload</span>
          </Button>
        </div>
      </div>

      {/* Applications with Resumes Section */}
      {userProfile.role === 'recruiter' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">
              Applications with Resumes ({applications.filter(app => app.resumeUrl).length})
            </h2>
            <div className="text-sm text-secondary-600">
              {applications.filter(app => app.score).length} scored
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-secondary-600">Loading applications...</p>
            </div>
          ) : applications.filter(app => app.resumeUrl).length === 0 ? (
            <div className="text-center py-8">
              <FileTextIcon />
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No applications with resumes</h3>
              <p className="mt-1 text-sm text-secondary-500">
                When candidates apply to your jobs, their resumes will appear here for scoring.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications
                .filter(app => app.resumeUrl)
                .map((application) => (
                  <div key={application.id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                            {(application.candidateProfileImageUrl || application.profileImageUrl) ? (
                              <img src={application.candidateProfileImageUrl || application.profileImageUrl} alt={application.candidateName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary-600 font-medium">
                                {application.candidateName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-secondary-900">
                              {application.candidateName}
                            </h3>
                            <p className="text-sm text-secondary-600">{application.candidateEmail}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-secondary-600">Applied for</p>
                            <p className="font-medium text-secondary-900">
                              {application.job?.title || 'Job Title'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600">Applied on</p>
                            <p className="font-medium text-secondary-900">
                              {getValidDate(application.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-secondary-600">Match Score</p>
                            {application.isCalculating ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                <span className="text-sm text-secondary-600">Calculating...</span>
                              </div>
                            ) : application.score ? (
                              <p className={`font-medium ${getScoreTextColor(application.score)}`}>
                                {application.score}%
                              </p>
                            ) : (
                              <p className="text-sm text-secondary-500">Not scored</p>
                            )}
                          </div>
                        </div>
                        
                        {application.reasoning && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-secondary-700 mb-1">Analysis:</p>
                            <ExpandableText text={application.reasoning} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        {application.score && (
                          <Badge variant={getScoreColor(application.score)}>
                            {application.score}%
                          </Badge>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => window.open(application.resumeUrl, '_blank')}
                            variant="primary"
                          >
                            <FileTextIcon />
                            <span className="ml-1">Resume</span>
                          </Button>
                          
                          {application.job?.jdFileUrl && (
                            <Button
                              onClick={() => {
                                try {
                                  if (!application.job?.jdFileUrl) {
                                    toast.error('JD not available');
                                    return;
                                  }
                                  
                                  const newWindow = window.open(application.job.jdFileUrl, '_blank');
                                  if (!newWindow) {
                                    toast.error('Popup blocked. Please allow popups and try again.');
                                  }
                                } catch (error) {
                                  console.error('Error opening JD:', error);
                                  toast.error('Unable to open JD. Please try again.');
                                }
                              }}
                              variant="primary"
                            >
                              <FileTextIcon />
                              <span className="ml-1">
                                {application.job.jdFileName ? 'JD' : 'Job Description'}
                              </span>
                            </Button>
                          )}
                          
                          {!application.score && !application.isCalculating && (
                            <Button
                              onClick={() => calculateScore(application)}
                              variant="primary"
                            >
                              <CalculatorIcon />
                              <span className="ml-1">Calculate</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}

      {/* Manual Upload Section */}
      <Card ref={manualSectionRef}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            {userProfile.role === 'recruiter' ? 'Manual Resume Upload' : 'Resume Checker'}
          </h2>
          <div className="flex space-x-2">
            <Button
              onClick={resetManualUpload}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Reset
            </Button>
            <Button
              onClick={() => setShowManualUpload(false)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Hide
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              {userProfile.role === 'recruiter' ? 'Upload Resumes' : 'Upload Your Resume'}
            </h3>
            <div 
              className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <UploadIcon />
              <p className="mt-2 text-sm text-secondary-600">
                {userProfile.role === 'recruiter' 
                  ? 'Drag and drop PDF or TXT files here, or click to browse'
                  : 'Upload your resume to check how well it matches job descriptions'
                }
              </p>
              <input
                type="file"
                multiple={userProfile.role === 'recruiter'}
                accept=".pdf,.txt"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleResumeUpload(e)}
                className="hidden"
                id="resume-upload"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="resume-upload" 
                className="cursor-pointer inline-block"
                onClick={() => {
                  console.log('Label clicked, triggering file input');
                  document.getElementById('resume-upload')?.click();
                }}
              >
                <Button className="mt-4" variant="primary">
                  <FileTextIcon />
                  <span className="ml-2">
                    {userProfile.role === 'recruiter' ? 'Choose Files' : 'Choose Resume'}
                  </span>
                </Button>
              </label>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-secondary-900">
                Uploaded Files ({resumeFiles.length}):
              </h4>
              {resumeFiles.length > 0 ? (
                resumeFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileTextIcon />
                      <span className="text-sm text-secondary-700">{file.name}</span>
                      <span className="text-xs text-secondary-500">({file.type})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveResume(index)}
                      className="text-error-600 hover:text-error-800"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-secondary-500 italic">No files uploaded yet</div>
              )}
            </div>
          </div>

          {/* Job Descriptions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">
                {userProfile.role === 'recruiter' ? 'Job Descriptions' : 'Job Descriptions to Check Against'}
              </h3>
              <Button
                onClick={handleAddJobDescription}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Add JD
              </Button>
            </div>
            
            <div className="space-y-4">
              {jobDescriptions.map((description, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-secondary-700">
                      Job Description {index + 1}
                    </label>
                    {jobDescriptions.length > 1 && (
                      <button
                        onClick={() => handleRemoveJobDescription(index)}
                        className="text-error-600 hover:text-error-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      handleJobDescriptionChange(index, e.target.value)
                    }
                    placeholder="Paste job description here..."
                    rows={4}
                  />
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleJDFileUpload(index, e)}
                    id={`candidate-jd-upload-${index}`}
                    className="hidden"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor={`candidate-jd-upload-${index}`} 
                    className="cursor-pointer inline-block"
                    onClick={() => {
                      console.log('Candidate JD label clicked, triggering file input for index', index);
                      document.getElementById(`candidate-jd-upload-${index}`)?.click();
                    }}
                  >
                    <Button className="mt-2" variant="primary">
                      <UploadIcon />
                      <span className="ml-2">Upload JD PDF</span>
                    </Button>
                  </label>
                  {jdFiles[index] && (
                    <div className="text-xs text-secondary-700 mt-1">{jdFiles[index]?.name}</div>
                  )}
                </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Analyze Button */}
        <div className="mt-6">
            <Button
            onClick={handleManualAnalyze}
            disabled={resumeFiles.length === 0 || isAnalyzing}
            variant="primary"
          >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon />
                      <span className="ml-2">{userProfile.role === 'recruiter' ? 'Analyze Resumes' : 'Check Resume Match'}</span>
                    </>
                  )}
                </Button>
              </div>
              
        {/* Manual Results */}
        {showManualResults && manualResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Results</h3>
              <div className="space-y-4">
                              {manualResults.map((result, index) => (
                  <div key={index} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-secondary-900">
                        {result.resume_name || 'Resume'} → {result.job_title || 'Job Description'}
                      </h4>
                      <Badge variant={getScoreColor(result.score || 0)}>
                        {result.score || 0}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <StarIcon />
                        <span className="text-sm text-secondary-600">Match Score</span>
                        <span className="font-medium">{result.score || 0}%</span>
                      </div>
                      
                      {result.reasoning && (
                        <div>
                          <p className="text-sm font-medium text-secondary-700 mb-1">Analysis:</p>
                          <div className="bg-secondary-50 rounded-lg p-3">
                            <ExpandableText text={result.reasoning} maxLines={4} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
            </Card>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    {selectedApplication.candidateName}
                  </h2>
                  <p className="text-secondary-600">{selectedApplication.candidateEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Application Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-secondary-600">Job Title</p>
                      <p className="font-medium">{selectedApplication.job?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-secondary-600">Applied Date</p>
                      <p className="font-medium">
                        {getValidDate(selectedApplication.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-secondary-600">Match Score</p>
                      <p className={`font-medium ${getScoreTextColor(selectedApplication.score || 0)}`}>
                        {selectedApplication.score ? `${selectedApplication.score}%` : 'Not scored'}
                      </p>
                    </div>
                    <div>
                      <p className="text-secondary-600">Status</p>
                      <Badge variant={selectedApplication.status === 'pending' ? 'warning' : 'success'}>
                        {selectedApplication.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">Cover Letter</h3>
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                {selectedApplication.reasoning && (
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">AI Analysis</h3>
                    <div className="bg-secondary-50 rounded-lg p-4">
                      <ExpandableText text={selectedApplication.reasoning} maxLines={6} />
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                  <Button
                    onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
                    variant="primary"
                  >
                    <FileTextIcon />
                    <span className="ml-2">View Resume</span>
                  </Button>
                  
                  {!selectedApplication.score && (
                    <Button
                      onClick={() => {
                        calculateScore(selectedApplication);
                        setSelectedApplication(null);
                      }}
                      variant="primary"
                    >
                      <CalculatorIcon />
                      <span className="ml-2">Calculate Score</span>
                    </Button>
                  )}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 