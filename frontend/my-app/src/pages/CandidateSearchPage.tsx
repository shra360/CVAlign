import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, getApplications } from '../lib/firebase';
import { useAppStore } from '../lib/store';
import toast from 'react-hot-toast';

// Inline SVG Icons
const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const StarIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  experience: string;
  location: string;
  resumeUrl?: string;
  bio?: string;
  tags?: string[];
  rating?: number;
}

export function CandidateSearchPage() {
  const { userProfile } = useAppStore();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: '',
    experience: '',
    location: '',
    rating: ''
  });

  useEffect(() => {
    if (userProfile?.role === 'recruiter') {
      loadCandidates();
    }
  }, [userProfile]);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, filters]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      
      // Get all users who are candidates
      const users = await getUsers({ role: 'candidate' });
      
      // Get applications to calculate ratings
      const applications = await getApplications({});
      
      const candidatesWithRatings = users.map((user: any) => {
        const userApplications = applications.filter((app: any) => app.candidateId === user.id);
        const averageRating = userApplications.length > 0 
          ? userApplications.reduce((sum: number, app: any) => sum + (app.score || 0), 0) / userApplications.length
          : 0;
        
        return {
          ...user,
          rating: Math.round(averageRating)
        };
      });
      
      setCandidates(candidatesWithRatings);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = candidates;

    // Search by name, email, or skills
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by skills
    if (filters.skills) {
      filtered = filtered.filter(candidate =>
        candidate.skills?.some(skill => skill.toLowerCase().includes(filters.skills.toLowerCase()))
      );
    }

    // Filter by experience
    if (filters.experience) {
      filtered = filtered.filter(candidate =>
        candidate.experience?.toLowerCase().includes(filters.experience.toLowerCase())
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(candidate =>
        candidate.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by rating
    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      filtered = filtered.filter(candidate => (candidate.rating || 0) >= minRating);
    }

    setFilteredCandidates(filtered);
  };

  const handleContactCandidate = (candidateId: string) => {
    // Navigate to chat or create new conversation
    toast.success('Contact feature coming soon!');
  };

  const handleViewProfile = (candidateId: string) => {
    // Navigate to candidate profile
    toast.success('Profile view feature coming soon!');
  };

  if (!userProfile || userProfile.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600">Only recruiters can search candidates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Candidate Search</h1>
        <p className="text-secondary-600">Find and connect with top talent</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search candidates by name, email, or skills..."
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Skills</label>
              <Input
                value={filters.skills}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., React, Python"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Experience</label>
              <Input
                value={filters.experience}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="e.g., 3-5 years"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Location</label>
              <Input
                value={filters.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Min Rating</label>
              <Select
                value={filters.rating}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                options={[
                  { value: '', label: 'Any' },
                  { value: '70', label: '70%+' },
                  { value: '80', label: '80%+' },
                  { value: '90', label: '90%+' }
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="flex justify-between items-center">
        <p className="text-secondary-600">
          {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {loading ? (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading candidates...</p>
          </div>
        </Card>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <UserIcon />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No candidates found</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow duration-200">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-lg">
                        {candidate.name?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">{candidate.name}</h3>
                      <p className="text-sm text-secondary-500">{candidate.email}</p>
                    </div>
                  </div>
                  {candidate.rating && (
                    <div className="flex items-center space-x-1">
                      <StarIcon />
                      <span className="text-sm font-medium text-secondary-900">{candidate.rating}%</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {candidate.experience && (
                    <div>
                      <span className="text-sm font-medium text-secondary-700">Experience:</span>
                      <span className="text-sm text-secondary-600 ml-1">{candidate.experience}</span>
                    </div>
                  )}
                  
                  {candidate.location && (
                    <div>
                      <span className="text-sm font-medium text-secondary-700">Location:</span>
                      <span className="text-sm text-secondary-600 ml-1">{candidate.location}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Skills:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="primary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="default" className="text-xs">
                          +{candidate.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {candidate.bio && (
                  <p className="text-sm text-secondary-600 line-clamp-2">{candidate.bio}</p>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => handleViewProfile(candidate.id)}
                    className="flex-1"
                  >
                    <FileTextIcon />
                    <span className="ml-1">View Profile</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleContactCandidate(candidate.id)}
                    className="flex-1"
                  >
                    <MessageIcon />
                    <span className="ml-1">Contact</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateSearchPage; 