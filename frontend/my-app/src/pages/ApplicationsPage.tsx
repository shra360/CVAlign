import * as React from 'react';
import { useState, useEffect } from 'react';
import { getApplications, updateApplication, deleteApplication, getJobs } from '../lib/firebase';
import { useAppStore } from '../lib/store';
import toast from 'react-hot-toast';

// Inline SVG Icons
const FilterIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

const StarIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

const Input = ({ type = 'text', value, onChange, placeholder, className = '' }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 ${className}`}
  />
);

const Select = ({ value, onChange, options, className = '' }: any) => (
  <select
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 ${className}`}
  >
    {options.map((option: any) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
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

export function ApplicationsPage() {
  const { userProfile } = useAppStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    jobId: 'all'
  });

  // Check if user is a recruiter
  React.useEffect(() => {
    if (userProfile && userProfile.role !== 'recruiter') {
      toast.error('Only recruiters can view applications');
      return;
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.role === 'recruiter') {
      loadApplications();
      loadJobs();
    }
  }, [userProfile]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await getApplications({ recruiterId: userProfile?.id });
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await getJobs({ recruiterId: userProfile?.id });
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplication(applicationId, { status: newStatus });
      toast.success('Application status updated');
      loadApplications(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
    try {
      await deleteApplication(applicationId);
      toast.success('Application deleted');
      setApplications(apps => apps.filter(app => app.id !== applicationId));
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  // Helper to get job title for an application
  const getJobTitle = (application: any) => {
    if (application.jobTitle) return application.jobTitle;
    const job = jobs.find((j: any) => j.id === application.jobId);
    return job ? job.title : 'Job Title';
  };

  // Helper to get valid date
  const getValidDate = (date: any) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  };

  // Sort applications by score (descending)
  const sortedApplications = [...applications].sort((a, b) => {
    if (typeof b.score === 'number' && typeof a.score === 'number') {
      return b.score - a.score;
    }
    if (typeof b.score === 'number') return 1;
    if (typeof a.score === 'number') return -1;
    return 0;
  });

  const filteredApplications = sortedApplications.filter(app => {
    const matchesStatus = filters.status === 'all' || app.status === filters.status;
    const matchesSearch = app.candidateName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         app.candidateEmail.toLowerCase().includes(filters.search.toLowerCase());
    const matchesJob = filters.jobId === 'all' || app.jobId === filters.jobId;
    return matchesStatus && matchesSearch && matchesJob;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'primary';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      case 'hired': return 'success';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  // Helper function to validate and fix URLs (Firebase Storage URLs are direct)
  const getValidCvUrl = (url: string): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('blob:')) return null; // Don't allow blob URLs
    return null;
  };

  const handleOpenCv = (resumeUrl: string, cvFileName?: string) => {
    try {
      const validUrl = getValidCvUrl(resumeUrl);
      if (!validUrl) {
        toast.error('CV not available or invalid URL');
        return;
      }
      const newWindow = window.open(validUrl, '_blank');
      if (!newWindow) {
        toast.error('Popup blocked. Please allow popups and try again.');
      }
    } catch (error) {
      console.error('Error opening CV:', error);
      toast.error('Unable to open CV. Please try again.');
    }
  };

  if (!userProfile || userProfile.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600">Only recruiters can view applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Applications</h1>
          <p className="text-secondary-600">Manage and review job applications</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-secondary-600">Total Applications</p>
          <p className="text-2xl font-bold text-primary-600">{applications.length}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Status</label>
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'hired', label: 'Hired' }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                <SearchIcon />
              </div>
              <Input
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name or email"
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Job</label>
            <Select
              value={filters.jobId}
              onChange={(e) => setFilters(prev => ({ ...prev, jobId: e.target.value }))}
              options={[
                { value: 'all', label: 'All Jobs' },
                ...jobs.map((job: any) => ({ value: job.id, label: job.title }))
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Applications List */}
      {loading ? (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading applications...</p>
          </div>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <UserIcon className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No applications</h3>
            <p className="mt-1 text-sm text-secondary-500">
              {filters.status !== 'all' || filters.search || filters.jobId !== 'all' 
                ? 'No applications match your filters.' 
                : 'No applications have been submitted yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {application.candidateName.charAt(0)}
                      </span>
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
                      <p className="font-medium text-secondary-900">{getJobTitle(application)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Applied on</p>
                      <p className="font-medium text-secondary-900">{getValidDate(application.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-600">Match Score</p>
                      <p className={`font-medium ${getScoreColor(application.score || 0)}`}>
                        {application.score ? `${application.score}%` : 'Not scored'}
                      </p>
                    </div>
                  </div>
                  
                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="text-sm text-secondary-600 mb-1">Cover Letter</p>
                      <p className="text-sm text-secondary-900 line-clamp-2">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  <Badge variant={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCv(application.resumeUrl, application.cvFileName)}
                    >
                      <FileTextIcon />
                      <span className="ml-1">
                        {application.cvFileName ? 'CV' : 'Resume'}
                      </span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <EyeIcon />
                      <span className="ml-1">View</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* TODO: Open chat */}}
                    >
                      <MessageIcon />
                      <span className="ml-1">Chat</span>
                    </Button>
                  </div>
                  
                  <Select
                    value={application.status}
                    onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'reviewed', label: 'Reviewed' },
                      { value: 'shortlisted', label: 'Shortlisted' },
                      { value: 'rejected', label: 'Rejected' },
                      { value: 'hired', label: 'Hired' }
                    ]}
                    className="w-32"
                  />
                  {userProfile?.role === 'recruiter' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-error-600 border-error-300 hover:bg-error-50"
                      onClick={() => handleDeleteApplication(application.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
                      <p className="font-medium">{getJobTitle(selectedApplication) || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-secondary-600">Applied Date</p>
                      <p className="font-medium">{getValidDate(selectedApplication.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-secondary-600">Match Score</p>
                      <p className={`font-medium ${getScoreColor(selectedApplication.score || 0)}`}>
                        {selectedApplication.score ? `${selectedApplication.score}%` : 'Not scored'}
                      </p>
                    </div>
                    <div>
                      <p className="text-secondary-600">Status</p>
                      <Badge variant={getStatusColor(selectedApplication.status)}>
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
                
                <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                  <Button
                    onClick={() => handleOpenCv(selectedApplication.resumeUrl, selectedApplication.cvFileName)}
                    className="flex-1"
                  >
                    <FileTextIcon />
                    <span className="ml-2">
                      View {selectedApplication.cvFileName ? 'CV' : 'Resume'}
                    </span>
                  </Button>
                  
                  <Button
                    onClick={() => {/* TODO: Open chat */}}
                    className="flex-1"
                  >
                    <MessageIcon />
                    <span className="ml-2">Start Chat</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 