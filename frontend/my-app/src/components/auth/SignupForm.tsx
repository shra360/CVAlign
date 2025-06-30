import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail, createUserProfile } from '../../lib/firebase';
import { useAppStore } from '../../lib/store';
import toast from 'react-hot-toast';

// Simple SVG Icons
const MailIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

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

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-secondary-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

export function SignupForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setIsLoading } = useAppStore();
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      setError('Please select your role');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIsLoading(true);
      
      // Create user account
      const user = await signUpWithEmail(email, password);
      
      // Create user profile in Firestore
      const userProfile = {
        id: user.uid,
        email: user.email,
        name: name,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await createUserProfile(user.uid, userProfile);
      
      console.log('User created successfully:', user);
      
      // Show success message
      toast.success(`Account created successfully! Welcome to HireSync as a ${role}!`);
      
      // Navigate to dashboard after successful signup
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      
      toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Card className="w-full max-w-md mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-secondary-600">Sign up for your HireSync account</p>
          
          {/* Step indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-secondary-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-secondary-300'}`}></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <UserIcon />
                </div>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <MailIcon />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <LockIcon />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <LockIcon />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Next: Choose Your Role
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Choose Your Role</h3>
              <p className="text-secondary-600 mb-6">Select how you'll be using HireSync</p>
              
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    role === 'candidate'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-300 hover:border-secondary-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      role === 'candidate' ? 'bg-primary-100' : 'bg-secondary-100'
                    }`}>
                      <UsersIcon />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900">Job Seeker</h4>
                      <p className="text-sm text-secondary-600">I'm looking for job opportunities</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    role === 'recruiter'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-300 hover:border-secondary-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      role === 'recruiter' ? 'bg-primary-100' : 'bg-secondary-100'
                    }`}>
                      <BriefcaseIcon />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900">Recruiter</h4>
                      <p className="text-sm text-secondary-600">I'm hiring for my company</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !role}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Already have an account?{' '}
            <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </React.Fragment>
  );
} 