import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { Student, SchoolInfo, ExamConfig, ExamType } from '@/types';

// Default / Environment Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if valid Firebase Database URL is configured
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.databaseURL && firebaseConfig.databaseURL.startsWith('https://')
  );
}

// Initialize Firebase App & Database
export function getFirebaseDb() {
  if (!isFirebaseConfigured()) return null;

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getDatabase(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

// Firebase Realtime DB References
const DB_PATHS = {
  STUDENTS: 'national_exam_2026/students',
  SCHOOL_INFO: 'national_exam_2026/schoolInfo',
  EXAM_CONFIGS: 'national_exam_2026/examConfigs',
};

/**
 * Save all students to Firebase Realtime Database
 */
export async function pushStudentsToFirebase(students: Student[]) {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const studentsRef = ref(db, DB_PATHS.STUDENTS);
    // Store as array or dictionary
    const dataMap: Record<string, Student> = {};
    students.forEach((s) => {
      dataMap[s.id] = s;
    });
    await set(studentsRef, dataMap);
    return true;
  } catch (error) {
    console.error('Error pushing students to Firebase:', error);
    return false;
  }
}

/**
 * Save school info to Firebase Realtime Database
 */
export async function pushSchoolInfoToFirebase(info: SchoolInfo) {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const schoolRef = ref(db, DB_PATHS.SCHOOL_INFO);
    await set(schoolRef, info);
    return true;
  } catch (error) {
    console.error('Error pushing school info to Firebase:', error);
    return false;
  }
}

/**
 * Save exam configs to Firebase Realtime Database
 */
export async function pushExamConfigsToFirebase(configs: Record<ExamType, ExamConfig>) {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const configRef = ref(db, DB_PATHS.EXAM_CONFIGS);
    await set(configRef, configs);
    return true;
  } catch (error) {
    console.error('Error pushing exam configs to Firebase:', error);
    return false;
  }
}

/**
 * Subscribe to real-time updates from Firebase
 */
export function listenToFirebaseSync(callbacks: {
  onStudentsChange?: (students: Student[]) => void;
  onSchoolInfoChange?: (info: SchoolInfo) => void;
  onExamConfigsChange?: (configs: Record<ExamType, ExamConfig>) => void;
}) {
  const db = getFirebaseDb();
  if (!db) return () => {};

  const studentsRef = ref(db, DB_PATHS.STUDENTS);
  const schoolRef = ref(db, DB_PATHS.SCHOOL_INFO);
  const configRef = ref(db, DB_PATHS.EXAM_CONFIGS);

  const unsubStudents = onValue(studentsRef, (snapshot) => {
    if (snapshot.exists() && callbacks.onStudentsChange) {
      const val = snapshot.val();
      if (!val) return;
      const list: Student[] = Array.isArray(val)
        ? val.filter(Boolean)
        : Object.values(val);
      callbacks.onStudentsChange(list);
    }
  });

  const unsubSchool = onValue(schoolRef, (snapshot) => {
    if (snapshot.exists() && callbacks.onSchoolInfoChange) {
      callbacks.onSchoolInfoChange(snapshot.val());
    }
  });

  const unsubConfigs = onValue(configRef, (snapshot) => {
    if (snapshot.exists() && callbacks.onExamConfigsChange) {
      callbacks.onExamConfigsChange(snapshot.val());
    }
  });

  return () => {
    off(studentsRef, 'value', unsubStudents);
    off(schoolRef, 'value', unsubSchool);
    off(configRef, 'value', unsubConfigs);
  };
}
