import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../lib/store';

// Inline SVG Icons
const HomeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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

const MessageIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export function Sidebar() {
  const location = useLocation();
  const { userProfile } = useAppStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getNavItemClass = (path: string) => {
    return `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
        : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
    }`;
  };

  const recruiterNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/jobs', label: 'My Jobs', icon: <BriefcaseIcon /> },
    { path: '/post-job', label: 'Post Job', icon: <PlusIcon /> },
    { path: '/applications', label: 'Applications', icon: <UsersIcon /> },
    { path: '/candidate-search', label: 'Find Candidates', icon: <SearchIcon /> },
    { path: '/resume-checker', label: 'Resume Checker', icon: <SearchIcon /> },
    { path: '/chat', label: 'Messages', icon: <MessageIcon /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon /> },
  ];

  const candidateNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/jobs', label: 'Browse Jobs', icon: <BriefcaseIcon /> },
    { path: '/resume-checker', label: 'Resume Checker', icon: <SearchIcon /> },
    { path: '/chat', label: 'Messages', icon: <MessageIcon /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon /> },
  ];

  const navItems = userProfile?.role === 'recruiter' ? recruiterNavItems : candidateNavItems;

  return (
    <div className="flex flex-col w-64 bg-white border-r border-secondary-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <h1 className="text-xl font-bold text-primary-600">HireSync</h1>
        </div>
        
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={getNavItemClass(item.path)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-secondary-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {userProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-secondary-900">
              {userProfile?.name || 'User'}
            </p>
            <p className="text-xs text-secondary-500 capitalize">
              {userProfile?.role || 'User'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 