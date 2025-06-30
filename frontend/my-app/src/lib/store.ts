import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'recruiter';
  bio?: string;
  profileImageUrl?: string;
  companyName?: string;
  designation?: string;
  tags?: string[];
  location?: string;
  skills?: string[];
  phone?: string;
  website?: string;
  education?: any[];
  experience?: any[];
  resumeUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  tags: string[];
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  } | null;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  recruiterId: string;
  recruiterName: string;
  recruiterCompany: string;
  jdFileUrl?: string;
  jdFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  candidateName: string;
  candidateEmail: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'shortlisted' | 'hired' | 'failed';
  createdAt: any;
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetter?: string;
  jobTitle?: string;
  score?: number;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

// Store interface
interface AppState {
  // Auth state
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Jobs state
  jobs: Job[];
  selectedJob: Job | null;
  
  // Applications state
  applications: Application[];
  selectedApplication: Application | null;
  
  // Chat state
  chats: Chat[];
  messages: Message[];
  selectedChat: Chat | null;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  deleteJob: (jobId: string) => void;
  setSelectedJob: (job: Job | null) => void;
  
  setApplications: (applications: Application[]) => void;
  addApplication: (application: Application) => void;
  updateApplication: (applicationId: string, updates: Partial<Application>) => void;
  setSelectedApplication: (application: Application | null) => void;
  
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setSelectedChat: (chat: Chat | null) => void;
  
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Reset state
  reset: () => void;
}

// Initial state
const initialState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: false,
  
  jobs: [],
  selectedJob: null,
  
  applications: [],
  selectedApplication: null,
  
  chats: [],
  messages: [],
  selectedChat: null,
  
  sidebarOpen: false,
  theme: 'light' as const,
};

// Create store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Auth actions
      setUser: (user) => set({ user }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Jobs actions
      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
      updateJob: (jobId, updates) => set((state) => ({
        jobs: state.jobs.map(job => 
          job.id === jobId ? { ...job, ...updates } : job
        )
      })),
      deleteJob: (jobId) => set((state) => ({
        jobs: state.jobs.filter(job => job.id !== jobId)
      })),
      setSelectedJob: (job) => set({ selectedJob: job }),
      
      // Applications actions
      setApplications: (applications) => set({ applications }),
      addApplication: (application) => set((state) => ({ 
        applications: [application, ...state.applications] 
      })),
      updateApplication: (applicationId, updates) => set((state) => ({
        applications: state.applications.map(app => 
          app.id === applicationId ? { ...app, ...updates } : app
        )
      })),
      setSelectedApplication: (application) => set({ selectedApplication: application }),
      
      // Chat actions
      setChats: (chats) => set({ chats }),
      addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (chatId, updates) => set((state) => ({
        chats: state.chats.map(chat => 
          chat.id === chatId ? { ...chat, ...updates } : chat
        )
      })),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setSelectedChat: (chat) => set({ selectedChat: chat }),
      
      // UI actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      
      // Reset state
      reset: () => set(initialState),
    }),
    {
      name: 'hiresync-store',
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
    }
  )
);

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useUserProfile = () => useAppStore((state) => state.userProfile);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);

export const useJobs = () => useAppStore((state) => state.jobs);
export const useSelectedJob = () => useAppStore((state) => state.selectedJob);

export const useApplications = () => useAppStore((state) => state.applications);
export const useSelectedApplication = () => useAppStore((state) => state.selectedApplication);

export const useChats = () => useAppStore((state) => state.chats);
export const useMessages = () => useAppStore((state) => state.messages);
export const useSelectedChat = () => useAppStore((state) => state.selectedChat);

export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useTheme = () => useAppStore((state) => state.theme); 