import * as React from 'react';
import { useState, useEffect } from 'react';
import { updateUserProfile } from '../lib/firebase';
import { useAppStore } from '../lib/store';
import toast from 'react-hot-toast';
import { getUserProfile } from '../lib/firebase';
import { uploadProfileImage } from '../lib/firebaseStorage';

// Inline SVG Icons
const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TagIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

const Input = ({ type = 'text', value, onChange, placeholder, className = '', required = false, id }: any) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
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

export function ProfilePage() {
  const { userProfile, setUserProfile } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    companyName: '',
    designation: '',
    website: '',
    tags: [] as string[],
    resumeUrl: '',
    skills: [] as string[],
    education: [] as any[],
    experience: [] as any[],
    profileImageUrl: '',
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        companyName: userProfile.companyName || '',
        designation: userProfile.designation || '',
        website: userProfile.website || '',
        tags: userProfile.tags || [],
        resumeUrl: userProfile.resumeUrl || '',
        skills: userProfile.skills || [],
        education: userProfile.education || [],
        experience: userProfile.experience || [],
        profileImageUrl: userProfile.profileImageUrl || '',
      });
      if (userProfile.profileImageUrl) {
        setImagePreview(userProfile.profileImageUrl);
      }
    }
  }, [userProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setProfileData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      toast.error('You must be logged in to update your profile.');
      return;
    }

    setLoading(true);
    const updates: any = { ...profileData };

    if (profileImageFile) {
      try {
        const imageUrl = await uploadProfileImage(profileImageFile, userProfile.id);
        updates.profileImageUrl = imageUrl;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        toast.error('Failed to upload profile image.');
        setLoading(false);
        return;
      }
    }

    try {
      await updateUserProfile(userProfile.id, updates);
      // Create an updated profile object for the local state
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile); // Update the global state
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Profile Settings</h1>
        <p className="text-secondary-600">Manage your account information and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Profile Picture</h3>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon />
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
              >
                <CameraIcon />
              </label>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <h4 className="font-medium text-secondary-900">{profileData.name}</h4>
              <p className="text-sm text-secondary-600 capitalize">{userProfile.role}</p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                Full Name *
              </label>
              <Input
                id="name"
                value={profileData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
                Location
              </label>
              <Input
                id="location"
                value={profileData.location}
                onChange={handleChange}
                placeholder="Enter your location"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="bio" className="block text-sm font-medium text-secondary-700 mb-1">
              Bio
            </label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
        </Card>

        {/* Company Information (Recruiters Only) */}
        {userProfile.role === 'recruiter' && (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-secondary-700 mb-1">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  value={profileData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-secondary-700 mb-1">
                  Designation
                </label>
                <Input
                  id="designation"
                  value={profileData.designation}
                  onChange={handleChange}
                  placeholder="Enter your designation"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-secondary-700 mb-1">
                  Company Website
                </label>
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={handleChange}
                  placeholder="Enter company website URL"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Resume Upload (Candidates Only) */}
        {userProfile.role === 'candidate' && (
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Resume</h3>
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-secondary-700 mb-1">
                Upload Resume (PDF)
              </label>
              <div className="flex items-center space-x-4">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleChange}
                />
                {profileData.resumeUrl && (
                  <Button
                    type="button"
                    onClick={() => window.open(profileData.resumeUrl, '_blank')}
                    className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                  >
                    <FileTextIcon />
                    <span className="ml-2">View Current Resume</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Skills/Tags */}
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            {userProfile.role === 'recruiter' ? 'Industries/Expertise' : 'Skills'}
          </h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <TagIcon />
                </div>
                <Input
                  value={profileData.tags.join(',')}
                  onChange={handleTagsChange}
                  placeholder={userProfile.role === 'recruiter' 
                    ? 'Add industries (e.g., Technology, Healthcare)' 
                    : 'Add skills (e.g., React, Python)'}
                  className="pl-10"
                />
              </div>
            </div>
            
            {profileData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profileData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 