'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/examStore';
import { listenToFirebaseSync, isFirebaseConfigured } from '@/lib/firebase';

/**
 * FirebaseSync: Keeps the app in sync with Firebase in real-time.
 *
 * After SeedLoader has done the initial load, this component:
 * - Listens for changes from OTHER devices and updates the local store.
 * - Does NOT push data to Firebase (that's done only by user actions).
 */
export default function FirebaseSync() {
  const {
    setStudentsFromRemote,
    setSchoolInfo,
    setExamConfigsFromRemote,
    setFirebaseStatus,
  } = useExamStore();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseStatus('not_configured');
      return;
    }

    setFirebaseStatus('connected');

    const unsubscribe = listenToFirebaseSync({
      onStudentsChange: (remoteStudents) => {
        if (remoteStudents && remoteStudents.length > 0) {
          // Always apply remote changes — this keeps multi-device in sync
          setStudentsFromRemote(remoteStudents);
        }
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
