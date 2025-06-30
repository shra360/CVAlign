import * as React from 'react';
import { SignupForm } from '../components/auth/SignupForm';

export function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
} 