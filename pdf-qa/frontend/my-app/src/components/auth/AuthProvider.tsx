import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getUserProfile, createUserProfile } from '../../lib/firebase';
import { useAppStore } from '../../lib/store';
import type { User } from 'firebase/auth';

interface AuthContextType {
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const { 
    setUser, 
    setUserProfile, 
    setIsAuthenticated, 
    setIsLoading 
  } = useAppStore();

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChange(async (user: User | null) => {
      console.log('AuthProvider: Auth state changed', { user: user?.uid, email: user?.email });
      setLoading(true);
      
      if (user) {
        console.log('AuthProvider: User authenticated, setting user data');
        setUser(user);
        setIsAuthenticated(true);
        
        try {
          // Get user profile from Firestore
          console.log('AuthProvider: Fetching user profile');
          const profile = await getUserProfile(user.uid);
          
          if (profile) {
            console.log('AuthProvider: Found existing profile', profile);
            setUserProfile({
              id: user.uid,
              ...profile
            } as any);
          } else {
            console.log('AuthProvider: No profile found, creating default');
            // Create default profile for new users
            const defaultProfile = {
              id: user.uid,
              email: user.email || '',
              name: user.displayName || '',
              role: 'candidate' as const,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await createUserProfile(user.uid, defaultProfile);
            setUserProfile(defaultProfile);
            console.log('AuthProvider: Created default profile');
          }
        } catch (error) {
          console.error('AuthProvider: Error loading user profile:', error);
          // Even if profile loading fails, user is still authenticated
          setUserProfile({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || '',
            role: 'candidate' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any);
        }
      } else {
        console.log('AuthProvider: No user, clearing auth state');
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
      setIsLoading(false);
      console.log('AuthProvider: Auth state update complete');
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, [setUser, setUserProfile, setIsAuthenticated, setIsLoading]);

  const value = {
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 