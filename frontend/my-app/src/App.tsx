import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
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
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
