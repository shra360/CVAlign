import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './components/auth/AuthProvider';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Dashboard } from './pages/Dashboard';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { PostJobPage } from './pages/PostJobPage';
import { ProfilePage } from './pages/ProfilePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ResumeCheckerPage } from './pages/ResumeCheckerPage';
import { ChatPage } from './pages/ChatPage';
import { ChatWindowPage } from './pages/ChatWindowPage';
import { RecruiterAnalyticsPage } from './pages/RecruiterAnalyticsPage';
import { CandidateSearchPage } from './pages/CandidateSearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ProfilesSearchPage from './pages/ProfilesSearchPage';
import { ProfileTemplate } from './components/profile/ProfileTemplate';
import { getUserProfile } from './lib/firebase';
import type { UserProfile } from './lib/store';
import { ThemeProvider } from './components/ThemeProvider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProfilesDetailPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id) {
      getUserProfile(id).then((data) => {
        setProfile(data as UserProfile);
        setLoading(false);
      });
    }
  }, [id]);
  if (loading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div><p className="mt-2 text-secondary-600">Loading profile...</p></div>;
  if (!profile) return <div className="text-center py-12 text-secondary-600">Profile not found.</div>;
  return <ProfileTemplate profile={profile} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-secondary-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <Layout>
                    <JobsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/jobs/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <JobDetailPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/post-job" element={
                <ProtectedRoute>
                  <Layout>
                    <PostJobPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/applications" element={
                <ProtectedRoute>
                  <Layout>
                    <ApplicationsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/resume-checker" element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeCheckerPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/resume-checker/manual" element={
                <ProtectedRoute>
                  <Layout>
                    <ResumeCheckerPage manualMode={true} />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <RecruiterAnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/candidate-search" element={
                <ProtectedRoute>
                  <Layout>
                    <CandidateSearchPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Layout>
                    <ChatPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/chat/:chatId" element={
                <ProtectedRoute>
                  <ChatWindowPage />
                </ProtectedRoute>
              } />
              
              {/* Profile search and detail routes */}
              <Route path="/profiles" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilesSearchPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profiles/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilesDetailPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Redirect to dashboard if authenticated, otherwise to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
                  </div>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
