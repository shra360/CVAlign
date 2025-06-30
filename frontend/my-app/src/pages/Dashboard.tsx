import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, getApplications } from '../lib/firebase';
import { useAppStore } from '../lib/store';

// Inline SVG Icons
const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Inline UI Components
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-secondary-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = '', onClick }: any) => (
  <button
    className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-sm ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
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

export function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAppStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (userProfile?.role === 'recruiter') {
        // Load recruiter data
        const jobs = await getJobs({ recruiterId: userProfile?.id });
        const applications = await getApplications({ recruiterId: userProfile?.id });
        
        setStats({
          totalJobs: jobs.length,
          totalApplications: applications.length,
          pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
          shortlistedApplications: applications.filter((app: any) => app.status === 'shortlisted').length,
          rejectedApplications: applications.filter((app: any) => app.status === 'rejected').length
        });
        
        setRecentJobs(jobs.slice(0, 3));
        setRecentApplications(applications.slice(0, 5));
      } else if (userProfile?.role === 'candidate') {
        // Load candidate data
        const applications = await getApplications({ candidateId: userProfile?.id });
        const allJobs = await getJobs({});
        
        setStats({
          totalJobs: allJobs.length,
          totalApplications: applications.length,
          pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
          shortlistedApplications: applications.filter((app: any) => app.status === 'shortlisted').length,
          rejectedApplications: applications.filter((app: any) => app.status === 'rejected').length
        });
        
        setRecentApplications(applications.slice(0, 5));
        // Get recommended jobs based on candidate's skills/tags
        const recommendedJobs = allJobs.filter((job: any) => 
          job.tags?.some((tag: string) => 
            userProfile?.tags?.includes(tag)
          )
        ).slice(0, 3);
        setRecentJobs(recommendedJobs);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      case 'hired': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon />;
      case 'shortlisted': return <CheckCircleIcon />;
      case 'rejected': return <XCircleIcon />;
      case 'hired': return <CheckCircleIcon />;
      default: return <ClockIcon />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Welcome back, {userProfile?.name}!</p>
        </div>
        
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Welcome back, {userProfile?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BriefcaseIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Jobs</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalJobs}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <UsersIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Applications</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalApplications}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <ClockIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Pending</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircleIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Shortlisted</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.shortlistedApplications}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              {userProfile?.role === 'recruiter' ? 'Recent Job Postings' : 'Recommended Jobs'}
            </h3>
            <Link
              to="/jobs"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseIcon />
              <p className="mt-2 text-sm text-secondary-600">
                {userProfile?.role === 'recruiter' 
                  ? 'No jobs posted yet.' 
                  : 'No recommended jobs found.'}
              </p>
              {userProfile?.role === 'recruiter' && (
                <Button className="mt-4" onClick={() => navigate('/post-job')}>
                  <PlusIcon />
                  <span className="ml-2">Post Your First Job</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-900">{job.title}</h4>
                    <p className="text-sm text-secondary-600">
                      {job.recruiterCompany || job.recruiterName}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="default">{job.type}</Badge>
                      {job.location && (
                        <span className="text-xs text-secondary-500">{job.location}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ArrowRightIcon />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Applications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              {userProfile?.role === 'recruiter' ? 'Recent Applications' : 'My Applications'}
            </h3>
            <Link
              to="/applications"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon />
              <p className="mt-2 text-sm text-secondary-600">
                {userProfile?.role === 'recruiter' 
                  ? 'No applications received yet.' 
                  : 'No applications submitted yet.'}
              </p>
              {userProfile?.role === 'candidate' && (
                <Button className="mt-4" onClick={() => navigate('/jobs')}>
                  <EyeIcon />
                  <span className="ml-2">Browse Jobs</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900">
                        {userProfile?.role === 'recruiter' 
                          ? application.candidateName 
                          : application.jobTitle}
                      </h4>
                      <p className="text-sm text-secondary-600">
                        {userProfile?.role === 'recruiter' 
                          ? application.candidateEmail 
                          : application.recruiterCompany || application.recruiterName}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-secondary-500 ml-2">
                          {new Date(application.createdAt?.toDate?.() || application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/applications/${application.id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ArrowRightIcon />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 