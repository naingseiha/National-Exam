'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/examStore';
import { listenToFirebaseSync, isFirebaseConfigured, pushStudentsToFirebase } from '@/lib/firebase';

export default function FirebaseSync() {
  const {
    students,
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
          setStudentsFromRemote(remoteStudents);
        } else if (students.length > 0) {
          // If remote is empty but local has seed students, push local to remote
          pushStudentsToFirebase(students);
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

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
