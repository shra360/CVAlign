import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { deleteUserAccount } from '../lib/firebase';
import toast from 'react-hot-toast';

// Inline SVG Icons
const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SunIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Switch = ({ checked, onChange, className = '' }: { checked: boolean; onChange: (checked: boolean) => void; className?: string }) => (
  <button
    type="button"
    className={`${
      checked ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-600'
    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
    onClick={() => onChange(!checked)}
  >
    <span
      className={`${
        checked ? 'translate-x-6' : 'translate-x-1'
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);

export function SettingsPage() {
  const { userProfile, theme, setTheme } = useAppStore();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount();
      toast.success('Account deleted successfully');
      // The user will be redirected to login by the auth system
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">Settings</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Manage your account preferences and settings</p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <MoonIcon />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Appearance</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Customize your app appearance</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900 dark:text-secondary-100">Dark Mode</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Switch between light and dark themes</p>
              </div>
              <Switch checked={theme === 'dark'} onChange={handleThemeToggle} />
            </div>
          </div>
        </Card>

        {/* Profile Settings */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-success-100 rounded-lg">
              <UserIcon />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Profile</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Manage your profile information</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">Edit Profile</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">Update your personal information, skills, and preferences</p>
              <Button onClick={handleEditProfile} variant="primary">
                <UserIcon />
                <span className="ml-2">Edit Profile</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <Card className="lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-error-100 rounded-lg">
              <TrashIcon />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Account</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Manage your account settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">Delete Account</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <Button onClick={handleDeleteAccount} variant="danger">
                  <TrashIcon />
                  <span className="ml-2">Delete Account</span>
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-error-600 font-medium">
                    Are you sure you want to delete your account? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <Button onClick={handleDeleteAccount} variant="danger" disabled={isDeleting}>
                      <TrashIcon />
                      <span className="ml-2">
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </span>
                    </Button>
                    <Button onClick={cancelDelete} variant="secondary">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage; 