import * as React from 'react';
import { Link } from 'react-router-dom';

// Inline SVG Icons
const SearchIcon = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 005.25 5.25h1.5a6 6 0 005.25-5.25V9.75a6 6 0 00-6-6z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// Inline UI Components
const Button = ({ children, size = 'md', variant = 'primary', className = '', ...props }: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline';
  className?: string;
  [key: string]: any;
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const variantClasses: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    outline: 'border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500'
  };
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-secondary-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold text-gradient">HireSync</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-secondary-600 hover:text-secondary-900">
                Sign In
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6">
              Smart Hiring for
              <span className="text-gradient"> Modern Teams</span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              AI-powered resume matching, seamless communication, and intelligent candidate screening. 
              Find the perfect match for your team or land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Hiring
                  <ArrowRightIcon />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Why Choose HireSync?
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with intuitive design to revolutionize 
              the hiring process for both recruiters and candidates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Smart Resume Matcher
              </h3>
              <p className="text-secondary-600">
                AI-powered matching that understands context and finds the perfect fit 
                between candidates and job requirements.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Personalized Profiles
              </h3>
              <p className="text-secondary-600">
                Create detailed profiles that showcase your skills and experience 
                in a way that stands out to recruiters.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellIcon />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Real-time Updates
              </h3>
              <p className="text-secondary-600">
                Stay informed with instant notifications about applications, 
                messages, and important updates.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                Powerful Features for Every Need
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUpIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">
                      Advanced Analytics
                    </h3>
                    <p className="text-secondary-600">
                      Track application success rates, candidate engagement, and hiring metrics 
                      with detailed analytics and insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">
                      Secure & Private
                    </h3>
                    <p className="text-secondary-600">
                      Your data is protected with enterprise-grade security and privacy controls. 
                      We never share your information without permission.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ZapIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">
                      Lightning Fast
                    </h3>
                    <p className="text-secondary-600">
                      Process hundreds of resumes in minutes with our optimized AI algorithms 
                      and cloud infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-4">
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                  <div className="h-4 bg-secondary-200 rounded w-5/6"></div>
                  <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
                </div>
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm font-medium text-secondary-900">
                      Match Score: 95%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies and candidates who trust HireSync for their hiring needs.
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 py-4 bg-white text-primary-600 hover:bg-secondary-50">
              Get Started Today
              <ArrowRightIcon />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-xl font-bold">HireSync</span>
              </div>
              <p className="text-secondary-400">
                Smart hiring for modern teams. AI-powered resume matching and seamless communication.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Recruiters</h3>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-white">Post Jobs</a></li>
                <li><a href="#" className="hover:text-white">Find Candidates</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Candidates</h3>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-white">Find Jobs</a></li>
                <li><a href="#" className="hover:text-white">Resume Builder</a></li>
                <li><a href="#" className="hover:text-white">Career Advice</a></li>
                <li><a href="#" className="hover:text-white">Profile</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 HireSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 