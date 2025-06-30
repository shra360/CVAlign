import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, deleteJob } from '../lib/firebase';
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

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export function JobsPage() {
  const navigate = useNavigate();
  const { userProfile } = useAppStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: 'all',
    tags: [] as string[]
  });

  useEffect(() => {
    loadJobs();
  }, [userProfile]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters = userProfile?.role === 'recruiter' 
        ? { recruiterId: userProfile?.id }
        : {};
      const jobsData = await getJobs(filters);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        toast.success('Job deleted successfully');
        loadJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         job.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = !filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = filters.type === 'all' || job.type === filters.type;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'success';
      case 'part-time': return 'primary';
      case 'contract': return 'warning';
      case 'internship': return 'default';
      default: return 'default';
    }
  };

  const formatSalary = (salary: any) => {
    if (!salary?.min || !salary?.max) return 'Not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {userProfile?.role === 'recruiter' ? 'My Jobs' : 'Browse Jobs'}
            </h1>
            <p className="text-secondary-600">
              {userProfile?.role === 'recruiter' 
                ? 'Manage your job postings' 
                : 'Find your next opportunity'}
            </p>
          </div>
          {userProfile?.role === 'recruiter' && (
            <Button onClick={() => navigate('/post-job')}>
              <PlusIcon />
              <span className="ml-2">Post Job</span>
            </Button>
          )}
        </div>
        
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading jobs...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            {userProfile?.role === 'recruiter' ? 'My Jobs' : 'Browse Jobs'}
          </h1>
          <p className="text-secondary-600">
            {userProfile?.role === 'recruiter' 
              ? 'Manage your job postings' 
              : 'Find your next opportunity'}
          </p>
        </div>
        {userProfile?.role === 'recruiter' && (
          <Button onClick={() => navigate('/post-job')}>
            <PlusIcon />
            <span className="ml-2">Post Job</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                <SearchIcon />
              </div>
              <Input
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search jobs..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Location</label>
            <Input
              value={filters.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Job Type</label>
            <Select
              value={filters.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'full-time', label: 'Full Time' },
                { value: 'part-time', label: 'Part Time' },
                { value: 'contract', label: 'Contract' },
                { value: 'internship', label: 'Internship' }
              ]}
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ search: '', location: '', type: 'all', tags: [] })}
              className="w-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
            >
              <FilterIcon />
              <span className="ml-2">Clear Filters</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-secondary-400">
              <BriefcaseIcon />
            </div>
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No jobs found</h3>
            <p className="mt-1 text-sm text-secondary-500">
              {filters.search || filters.location || filters.type !== 'all'
                ? 'No jobs match your filters.' 
                : userProfile?.role === 'recruiter'
                ? 'You haven\'t posted any jobs yet.'
                : 'No jobs are currently available.'}
            </p>
            {userProfile?.role === 'recruiter' && (
              <div className="mt-6">
                <Button onClick={() => navigate('/post-job')}>
                  <PlusIcon />
                  <span className="ml-2">Post Your First Job</span>
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {job.recruiterCompany || job.recruiterName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getJobTypeColor(job.type)}>
                        {job.type.replace('-', ' ')}
                      </Badge>
                      {userProfile?.role === 'recruiter' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            <EyeIcon />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-error-600 hover:bg-error-50"
                          >
                            <TrashIcon />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    <div className="text-sm text-secondary-600">
                      Posted {new Date(job.createdAt?.toDate?.() || job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-sm text-secondary-700 line-clamp-2 mb-4">
                    {job.description}
                  </p>
                  
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="default">
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 3 && (
                        <Badge variant="default">
                          +{job.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
                <div className="flex items-center space-x-4 text-sm text-secondary-600">
                  {userProfile?.role === 'recruiter' && (
                    <span>{job.applicationsCount || 0} applications</span>
                  )}
                  <span>{job.viewsCount || 0} views</span>
                </div>
                
                <div className="flex space-x-2">
                  {userProfile?.role === 'candidate' ? (
                    <Button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/applications?jobId=${job.id}`)}
                      className="flex-1"
                    >
                      View Applications
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 