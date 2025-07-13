import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore, useUser } from '../../lib/store';
import { signOutUser } from '../../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProfileTemplate } from '../profile/ProfileTemplate';

// Simple SVG Icons
const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 005.25 5.25h1.5a6 6 0 005.25-5.25V9.75a6 6 0 00-6-6z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

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

const FileTextIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const BarChart3Icon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const XIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Inline UI Components
const Input = ({ type = 'text', placeholder, className = '', ...props }: any) => (
  <input
    type={type}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 ${className}`}
    {...props}
  />
);

// Fixed Navbar Component with Working Search
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userProfile, setSidebarOpen } = useAppStore();
  const user = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ChatPage-style search logic
  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);
    setSuggestions([]);
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      const searchTermLower = searchTerm.toLowerCase().trim();
      const filteredUsers = users.filter((userData: any) => {
        const displayName = (userData.displayName || userData.name || '').toLowerCase();
        const email = (userData.email || '').toLowerCase();
        return (userData.id !== user?.uid) &&
               (displayName.includes(searchTermLower) || email.includes(searchTermLower));
      });
      const sortedUsers = filteredUsers.sort((a: any, b: any) => {
        const aDisplayName = (a.displayName || a.name || '').toLowerCase();
        const bDisplayName = (b.displayName || b.name || '').toLowerCase();
        const aEmail = (a.email || '').toLowerCase();
        const bEmail = (b.email || '').toLowerCase();
        const aStartsWith = aDisplayName.startsWith(searchTermLower) || aEmail.startsWith(searchTermLower);
        const bStartsWith = bDisplayName.startsWith(searchTermLower) || bEmail.startsWith(searchTermLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0;
      });
      setSuggestions(sortedUsers.slice(0, 6));
    } catch (err) {
      setSearchError('Failed to search for users.');
      setSuggestions([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        handleSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleProfileSelect = (user: any) => {
    setSelectedProfile(user);
    setShowSuggestions(false);
    setSearchTerm(''); // Clear search
    console.log('Profile selected:', user);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/profiles?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <nav className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Sidebar toggle (mobile) */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-600"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Search bar centered and wider */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-lg relative">
              <div className="relative">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                    <SearchIcon />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search profiles by name or email"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  <button type="submit" className="hidden" aria-label="Search" />
                </form>
                {loadingSearch && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg divide-y divide-secondary-100 dark:divide-secondary-700">
                    {suggestions.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center px-4 py-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 cursor-pointer"
                        onMouseDown={e => {
                          e.preventDefault();
                          handleProfileSelect(user);
                        }}
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden mr-3">
                          {user.profileImageUrl || user.photoURL ? (
                            <img src={user.profileImageUrl || user.photoURL} alt={user.displayName || user.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-primary-600 font-medium text-sm">{(user.displayName || user.name)?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-secondary-900 dark:text-secondary-100">{user.name || user.displayName || 'Unknown User'}</span>
                          <div className="text-xs text-secondary-500 dark:text-secondary-400 capitalize mt-1">
                            {user.role === 'recruiter' ? 'Recruiter' : 'Job-seeker'}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'recruiter' ? 'bg-primary-100 text-primary-800' : 'bg-success-100 text-success-800'}`}>
                          {user.role === 'recruiter' ? 'Recruiter' : 'Job-seeker'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Modal for full profile */}
                {selectedProfile && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
                      <button className="absolute top-2 right-2 text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100" onClick={() => setSelectedProfile(null)}>&times;</button>
                      <ProfileTemplate profile={selectedProfile} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: profile photo and name */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Notifications */}
            <button className="p-2 rounded-md text-secondary-400 hover:text-secondary-600 relative">
              <BellIcon />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary-100"
              >
                {userProfile?.profileImageUrl ? (
                  <img
                    src={userProfile.profileImageUrl}
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {userProfile?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  {userProfile?.name || 'User'}
                </span>
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-md shadow-lg border border-secondary-200 dark:border-secondary-700 py-1 z-50">
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <SettingsIcon />
                    <span className="ml-2">Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOutUser();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  >
                    <LogOutIcon />
                    <span className="ml-2">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/settings"
              className="block px-3 py-2 text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={() => {
                signOutUser();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// Inline Sidebar Component
function Sidebar() {
    const location = useLocation();
    const { userProfile, sidebarOpen, setSidebarOpen } = useAppStore();
    const isRecruiter = userProfile?.role === 'recruiter';
  
    const candidateMenuItems = [
      { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
      { name: 'Jobs', icon: BriefcaseIcon, path: '/jobs' },
      { name: 'Applications', icon: FileTextIcon, path: '/applications' },
      { name: 'Resume Checker', icon: BarChart3Icon, path: '/resume-checker' },
      { name: 'Chat', icon: MessageSquareIcon, path: '/chat' },
      { name: 'Profile', icon: UsersIcon, path: '/profile' },
    ];
  
    const recruiterMenuItems = [
      { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
      { name: 'Post Job', icon: PlusIcon, path: '/post-job' },
      { name: 'Applications', icon: FileTextIcon, path: '/applications' },
      { name: 'Candidates', icon: UsersIcon, path: '/candidate-search' },
      { name: 'Resume Checker', icon: BarChart3Icon, path: '/resume-checker' },
      { name: 'Chat', icon: MessageSquareIcon, path: '/chat' },
      { name: 'Profile', icon: SettingsIcon, path: '/profile' },
    ];
  
    const menuItems = isRecruiter ? recruiterMenuItems : candidateMenuItems;
  
    const isActive = (path: string) => location.pathname === path;
  
    return (
      <div className="fixed top-0 left-0 z-50 w-64 h-screen bg-white dark:bg-secondary-800 shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-2xl font-extrabold text-primary-700 dark:text-primary-400 tracking-tight">HireSync</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-secondary-400 hover:text-secondary-600"
          >
            <XIcon />
          </button>
        </div>
  
        {/* Navigation (scrollable) */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActive(item.path)
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
  
        {/* Footer (always at the bottom, never scrolls) */}
        <div className="flex-shrink-0 p-4 border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {userProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {userProfile?.name || 'User'}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                {userProfile?.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <React.Fragment>
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 overflow-x-auto ml-64">
            {children}
          </main>
        </div>
      </div>
    </React.Fragment>
  );
} 