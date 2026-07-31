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
 * Remove undefined values recursively — Firebase rejects undefined properties.
 */
function sanitizeForFirebase<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as T;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase) as T;
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(obj as object)) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirebase(val);
    }
  }
  return cleaned as T;
}

/**
 * Save all students to Firebase Realtime Database.
 * Returns true on success, false on failure.
 */
export async function pushStudentsToFirebase(students: Student[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Firebase] Not configured — skipping push');
    return false;
  }

  try {
    const studentsRef = ref(db, DB_PATHS.STUDENTS);
    const dataMap: Record<string, Student> = {};
    students.forEach((s) => {
      dataMap[s.id] = sanitizeForFirebase(s);
    });
    await set(studentsRef, dataMap);
    console.log('[Firebase] Pushed', students.length, 'students successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Error pushing students:', error);
    return false;
  }
}

/**
 * Save school info to Firebase Realtime Database
 */
export async function pushSchoolInfoToFirebase(info: SchoolInfo): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const schoolRef = ref(db, DB_PATHS.SCHOOL_INFO);
    await set(schoolRef, info);
    return true;
  } catch (error) {
    console.error('[Firebase] Error pushing school info:', error);
    return false;
  }
}

/**
 * Save exam configs to Firebase Realtime Database
 */
export async function pushExamConfigsToFirebase(configs: Record<ExamType, ExamConfig>): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const configRef = ref(db, DB_PATHS.EXAM_CONFIGS);
    await set(configRef, configs);
    return true;
  } catch (error) {
    console.error('[Firebase] Error pushing exam configs:', error);
    return false;
  }
}

/**
 * Fetch students from Firebase ONCE (no real-time listener).
 * Returns the students array or null if Firebase is not configured / has no data.
 */
export function fetchStudentsOnce(
  onResult: (students: Student[] | null) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) {
    onResult(null);
    return () => {};
  }

  const studentsRef = ref(db, DB_PATHS.STUDENTS);
  const unsub = onValue(
    studentsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onResult(null);
        return;
      }
      const val = snapshot.val();
      if (!val) {
        onResult(null);
        return;
      }
      const list: Student[] = Array.isArray(val)
        ? val.filter(Boolean)
        : Object.values(val);
      onResult(list.length > 0 ? list : null);
    },
    (error) => {
      console.error('[Firebase] fetchStudentsOnce error:', error);
      onResult(null);
    }
  );

  return () => off(studentsRef, 'value', unsub);
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
      if (list.length > 0) {
        callbacks.onStudentsChange(list);
      }
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
