'use client';

import { useEffect, useRef } from 'react';
import { useExamStore } from '@/store/examStore';
import { listenToFirebaseSync, isFirebaseConfigured } from '@/lib/firebase';

/**
 * FirebaseSync - Real-time listener.
 * 
 * IMPORTANT: Firebase is the SOURCE OF TRUTH.
 * - When Firebase has data → always use it (override local)
 * - Never push local → Firebase here (only the store actions should push)
 * - SeedLoader should only run if Firebase has NO data
 */
export default function FirebaseSync() {
  const {
    setStudentsFromRemote,
    setSchoolInfo,
    setExamConfigsFromRemote,
    setFirebaseStatus,
    students,
  } = useExamStore();

  // Track whether we've received the first Firebase snapshot
  const firebaseLoaded = useRef(false);
  const studentsRef = useRef(students);
  studentsRef.current = students;

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseStatus('not_configured');
      return;
    }

    setFirebaseStatus('connected');

    const unsubscribe = listenToFirebaseSync({
      onStudentsChange: (remoteStudents) => {
        firebaseLoaded.current = true;
        if (remoteStudents && remoteStudents.length > 0) {
          // Firebase has data — always use it as source of truth
          setStudentsFromRemote(remoteStudents);
        }
        // If Firebase is empty, do NOT push local data here.
        // SeedLoader handles the initial seed separately.
      },
      onSchoolInfoChange: (remoteSchoolInfo) => {
        if (remoteSchoolInfo) {
          setSchoolInfo(remoteSchoolInfo, true);
        }
      },
      onExamConfigsChange: (remoteConfigs) => {
        if (remoteConfigs) {
          setExamConfigsFromRemote(remoteConfigs);
        }
      },
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
