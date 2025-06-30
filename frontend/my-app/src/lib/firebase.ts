import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  type Query, 
  type CollectionReference 
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; // Exporting app, auth, and db

// Auth functions - Email/Password only
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUsers = async (filters: any = {}) => {
  try {
    let q: Query | CollectionReference = collection(db, 'users');
    
    if (filters.role) {
      q = query(q, where('role', '==', filters.role));
    }
    
    if (filters.skills) {
      q = query(q, where('skills', 'array-contains-any', filters.skills));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Job Management Functions
export const createJob = async (jobData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const getJobs = async (filters: any = {}) => {
  try {
    let q: Query | CollectionReference = collection(db, 'jobs');
    
    if (filters.recruiterId) {
      q = query(q, where('recruiterId', '==', filters.recruiterId));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting jobs:', error);
    throw error;
  }
};

export const getJob = async (jobId: string) => {
  try {
    const docRef = doc(db, 'jobs', jobId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Job not found');
    }
  } catch (error) {
    console.error('Error getting job:', error);
    throw error;
  }
};

export const updateJob = async (jobId: string, updates: any) => {
  try {
    const docRef = doc(db, 'jobs', jobId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const deleteJob = async (jobId: string) => {
  try {
    const docRef = doc(db, 'jobs', jobId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// Application Management Functions
export const createApplication = async (applicationData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'applications'), {
      ...applicationData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

export const getApplications = async (filters: any = {}) => {
  try {
    let q: Query | CollectionReference = collection(db, 'applications');
    
    if (filters.recruiterId) {
      q = query(q, where('recruiterId', '==', filters.recruiterId));
    }
    
    if (filters.candidateId) {
      q = query(q, where('candidateId', '==', filters.candidateId));
    }
    
    if (filters.jobId) {
      q = query(q, where('jobId', '==', filters.jobId));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
};

export const getApplication = async (applicationId: string) => {
  try {
    const docRef = doc(db, 'applications', applicationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Application not found');
    }
  } catch (error) {
    console.error('Error getting application:', error);
    throw error;
  }
};

export const updateApplication = async (applicationId: string, updates: any) => {
  try {
    const docRef = doc(db, 'applications', applicationId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

export const deleteApplication = async (applicationId: string) => {
  try {
    const docRef = doc(db, 'applications', applicationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

// No more Cloudinary related functions here

export const getChatMessages = async (chatId: string) => {
  // ... implementation
};

// Get recruiter's cutoff score from user profile
export const getRecruiterCutoff = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().cutoffScore || 70; // default to 70 if not set
  }
  return 70;
};

// Set recruiter's cutoff score in user profile
export const setRecruiterCutoff = async (userId: string, cutoffScore: number) => {
  await updateDoc(doc(db, 'users', userId), { cutoffScore, updatedAt: new Date() });
};

// Get recruiter's auto status from user profile
export const getRecruiterAutoStatus = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().autoStatus || 'shortlisted'; // default to shortlisted
  }
  return 'shortlisted';
};

// Set recruiter's auto status in user profile
export const setRecruiterAutoStatus = async (userId: string, autoStatus: string) => {
  await updateDoc(doc(db, 'users', userId), { autoStatus, updatedAt: new Date() });
};

// Update application score, reasoning, and optionally status
export const updateApplicationScore = async (applicationId: string, score: number, reasoning: string, status?: string) => {
  const update: any = { score, reasoning, updatedAt: new Date() };
  if (status) update.status = status;
  await updateDoc(doc(db, 'applications', applicationId), update);
}; 