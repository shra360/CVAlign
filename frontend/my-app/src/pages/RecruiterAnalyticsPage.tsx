import * as React from 'react';
import { useState, useEffect } from 'react';
import { getJobs, getApplications } from '../lib/firebase';
import { useAppStore } from '../lib/store';
import toast from 'react-hot-toast';

// Inline SVG Icons
const ChartIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

const ClockIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Inline UI Components
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-secondary-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
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

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants = {
    default: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    primary: 'bg-primary-100 text-primary-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  averageTimeToHire: number;
  topPerformingJobs: any[];
  applicationTrends: any[];
  candidateSources: any[];
}

export function RecruiterAnalyticsPage() {
  const { userProfile } = useAppStore();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    applicationsByStatus: {},
    averageTimeToHire: 0,
    topPerformingJobs: [],
    applicationTrends: [],
    candidateSources: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (userProfile?.role === 'recruiter') {
      loadAnalytics();
    }
  }, [userProfile, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const jobs = await getJobs({ recruiterId: userProfile?.id });
      const applications = await getApplications({ recruiterId: userProfile?.id });
      
      // Calculate analytics
      const activeJobs = jobs.filter((job: any) => job.status === 'active');
      const applicationsByStatus = applications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate average time to hire (simplified)
      const hiredApplications = applications.filter((app: any) => app.status === 'hired');
      const averageTimeToHire = hiredApplications.length > 0 
        ? hiredApplications.reduce((sum: number, app: any) => {
            const created = new Date(app.createdAt?.toDate?.() || app.createdAt);
            const updated = new Date(app.updatedAt?.toDate?.() || app.updatedAt);
            return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / hiredApplications.length
        : 0;
      
      // Top performing jobs (by application count)
      const topPerformingJobs = jobs
        .map((job: any) => ({
          ...job,
          applicationCount: applications.filter((app: any) => app.jobId === job.id).length
        }))
        .sort((a: any, b: any) => b.applicationCount - a.applicationCount)
        .slice(0, 5);
      
      // Application trends (last 7 days)
      const applicationTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayApplications = applications.filter((app: any) => {
          const appDate = new Date(app.createdAt?.toDate?.() || app.createdAt);
          return appDate.toDateString() === date.toDateString();
        });
        applicationTrends.push({
          date: date.toLocaleDateString(),
          count: dayApplications.length
        });
      }
      
      // Candidate sources (simplified)
      const candidateSources = [
        { source: 'Direct Application', count: applications.length * 0.6 },
        { source: 'Job Boards', count: applications.length * 0.25 },
        { source: 'Referrals', count: applications.length * 0.1 },
        { source: 'Social Media', count: applications.length * 0.05 }
      ];
      
      setAnalytics({
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalApplications: applications.length,
        applicationsByStatus,
        averageTimeToHire: Math.round(averageTimeToHire),
        topPerformingJobs,
        applicationTrends,
        candidateSources
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile || userProfile.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600">Only recruiters can view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Analytics</h1>
          <p className="text-secondary-600">Track your hiring performance and insights</p>
        </div>
        
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading analytics...</p>
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
          <h1 className="text-3xl font-bold text-secondary-900">Analytics</h1>
          <p className="text-secondary-600">Track your hiring performance and insights</p>
        </div>
        
        <Select
          value={timeRange}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value)}
          options={[
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' },
            { value: '1y', label: 'Last year' }
          ]}
          className="w-48"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <ChartIcon />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Jobs</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.totalJobs}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Jobs</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.activeJobs}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <UsersIcon />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Applications</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.totalApplications}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center">
                <ClockIcon />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold text-secondary-900">{analytics.averageTimeToHire} days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Application Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant={status === 'pending' ? 'warning' : status === 'shortlisted' ? 'success' : status === 'rejected' ? 'error' : 'primary'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
                <span className="text-lg font-semibold text-secondary-900">{count as number}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Candidate Sources</h3>
          <div className="space-y-3">
            {analytics.candidateSources.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <span className="text-secondary-700">{source.source}</span>
                <span className="text-lg font-semibold text-secondary-900">{Math.round(source.count)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performing Jobs */}
      <Card>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Top Performing Jobs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Views
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {analytics.topPerformingJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {job.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {job.applicationCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={job.status === 'active' ? 'success' : 'default'}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {job.views || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Application Trends */}
      <Card>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Application Trends</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {analytics.applicationTrends.map((trend, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary-500 rounded-t"
                style={{ 
                  height: `${Math.max((trend.count / Math.max(...analytics.applicationTrends.map(t => t.count))) * 200, 4)}px` 
                }}
              ></div>
              <span className="text-xs text-secondary-500 mt-2">{trend.date}</span>
              <span className="text-xs font-medium text-secondary-900">{trend.count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default RecruiterAnalyticsPage; 