import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, createApplication } from '../lib/firebase';
import { useAppStore } from '../lib/store';
import toast from 'react-hot-toast';

// Inline SVG Icons
const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DollarSignIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

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

const ArrowLeftIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Inline UI Components
const Button = ({ children, type = 'button', className = '', disabled = false, onClick }: any) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-sm ${className}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

const Input = ({ type = 'file', onChange, accept, className = '', required = false, id }: any) => (
  <input
    id={id}
    type={type}
    onChange={onChange}
    accept={accept}
    required={required}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 ${className}`}
  />
);

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

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-secondary-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

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

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAppStore();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cvFile: null as File | null,
    coverLetter: ''
  });
  const [cvFileName, setCvFileName] = useState('');

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await getJob(id!);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or DOCX file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setApplicationData(prev => ({ ...prev, cvFile: file }));
      setCvFileName(file.name);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast.error('Please log in to apply');
      return;
    }

    if (!applicationData.cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    try {
      setApplying(true);
      
      // Upload CV to Firebase Storage
      const { uploadResume } = await import('../lib/firebaseStorage');
      const cvUrl = await uploadResume(applicationData.cvFile, userProfile.id);
      
      const application = {
        jobId: job.id,
        candidateId: userProfile.id,
        candidateName: userProfile.name,
        candidateEmail: userProfile.email,
        resumeUrl: cvUrl, // Use the uploaded CV as the resume
        coverLetter: applicationData.coverLetter,
        recruiterId: job.recruiterId,
        cvFileName: cvFileName
      };

      await createApplication(application);
      
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      setApplicationData({ cvFile: null, coverLetter: '' });
      setCvFileName('');
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary: any) => {
    if (!salary || !salary.min || !salary.max) return 'Not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'success';
      case 'part-time': return 'primary';
      case 'contract': return 'warning';
      case 'internship': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/jobs')}
            className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
          >
            <ArrowLeftIcon />
            <span className="ml-2">Back to Jobs</span>
          </Button>
        </div>
        
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading job details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/jobs')}
            className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
          >
            <ArrowLeftIcon />
            <span className="ml-2">Back to Jobs</span>
          </Button>
        </div>
        
        <Card>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Job Not Found</h2>
            <p className="text-secondary-600">The job you're looking for doesn't exist or has been removed.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/jobs')}
            className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
          >
            <ArrowLeftIcon />
            <span className="ml-2">Back to Jobs</span>
          </Button>
        </div>
        
        {userProfile?.role === 'candidate' && !showApplicationForm && (
          <Button onClick={() => setShowApplicationForm(true)}>
            Apply Now
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">{job.title}</h1>
                <p className="text-lg text-secondary-600">{job.recruiterCompany || job.recruiterName}</p>
              </div>
              <Badge variant={getJobTypeColor(job.type)}>
                {job.type.replace('-', ' ')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-sm text-secondary-600">
                <div className="mr-2">
                  <MapPinIcon />
                </div>
                {job.location || 'Remote'}
              </div>
              <div className="flex items-center text-sm text-secondary-600">
                <div className="mr-2">
                  <DollarSignIcon />
                </div>
                {formatSalary(job.salary)}
              </div>
              <div className="flex items-center text-sm text-secondary-600">
                <div className="mr-2">
                  <CalendarIcon />
                </div>
                Posted {new Date(job.createdAt?.toDate?.() || job.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Job Description */}
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Job Description</h3>
            <div className="prose max-w-none">
              <p className="text-secondary-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </Card>

          {/* Requirements */}
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Requirements</h3>
            <div className="prose max-w-none">
              <p className="text-secondary-700 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">About the Company</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon />
              </div>
              <div>
                <p className="font-medium text-secondary-900">{job.recruiterName}</p>
                <p className="text-sm text-secondary-600">{job.recruiterCompany}</p>
              </div>
            </div>
            
            {userProfile?.role === 'candidate' && (
              <Button
                onClick={() => navigate(`/chat?recipient=${job.recruiterId}`)}
                className="w-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
              >
                <FileTextIcon />
                <span className="ml-2">Message Recruiter</span>
              </Button>
            )}
          </Card>

          {/* Application Form */}
          {showApplicationForm && userProfile?.role === 'candidate' && (
            <Card>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Apply for this Position</h3>
              <form onSubmit={handleApply} className="space-y-4">
                {/* CV Upload */}
                <div>
                  <label htmlFor="cvFile" className="block text-sm font-medium text-secondary-700 mb-1">
                    CV/Resume <span className="text-error-600">*</span>
                  </label>
                  <div className="border-2 border-dashed border-secondary-300 rounded-lg p-4 text-center">
                    <UploadIcon />
                    <p className="mt-2 text-sm text-secondary-600">
                      Upload your CV (PDF or DOCX)
                    </p>
                    <Input
                      id="cvFile"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleCvUpload}
                      required
                      className="mt-2"
                    />
                  </div>
                  {cvFileName && (
                    <div className="mt-2 flex items-center space-x-2 p-2 bg-success-50 rounded-lg">
                      <FileTextIcon />
                      <span className="text-sm text-success-700">{cvFileName}</span>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-secondary-500">
                    Maximum file size: 10MB. Supported formats: PDF, DOCX
                  </p>
                </div>

                {/* Cover Letter */}
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-secondary-700 mb-1">
                    Cover Letter (Optional)
                  </label>
                  <Textarea
                    id="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    placeholder="Tell us why you're interested in this position..."
                    rows={4}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setApplicationData({ cvFile: null, coverLetter: '' });
                      setCvFileName('');
                    }}
                    className="flex-1 bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={applying || !applicationData.cvFile}
                    className="flex-1"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Job Stats (Recruiters Only) */}
          {userProfile?.role === 'recruiter' && userProfile.id === job.recruiterId && (
            <Card>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Job Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-secondary-600">Applications</span>
                  <span className="font-medium">{job.applicationsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary-600">Views</span>
                  <span className="font-medium">{job.viewsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-secondary-600">Posted</span>
                  <span className="font-medium">
                    {new Date(job.createdAt?.toDate?.() || job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <Button
                  onClick={() => navigate(`/applications?jobId=${job.id}`)}
                  className="w-full"
                >
                  View Applications
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 