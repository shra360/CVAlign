import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

export async function uploadFileToFirebase(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteFileFromFirebase(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

// Helper functions for specific use cases
export async function uploadResume(file: File, userId: string): Promise<string> {
  const path = `resumes/${userId}/${Date.now()}_${file.name}`;
  return uploadFileToFirebase(file, path);
}

export async function uploadJDFile(file: File, recruiterId: string): Promise<string> {
  const path = `job-descriptions/${recruiterId}/${Date.now()}_${file.name}`;
  return uploadFileToFirebase(file, path);
}

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const path = `profiles/${userId}/${Date.now()}_${file.name}`;
  return uploadFileToFirebase(file, path);
} 