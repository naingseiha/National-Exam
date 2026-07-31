'use client';

import { useEffect, useRef, useState } from 'react';
import { useExamStore } from '@/store/examStore';
import { listenToFirebaseSync, isFirebaseConfigured, pushStudentsToFirebase, pushSchoolInfoToFirebase } from '@/lib/firebase';
import seedData from '@/data/seedStudents.json';
import { Student, SchoolInfo } from '@/types';

const SEED_SCHOOL_INFO: SchoolInfo = {
  department: 'មន្ទីរអប់រំ យុវជន និងកីឡា',
  province: 'ខេត្តសៀមរាប',
  name: 'វិទ្យាល័យ ហ៊ុន សែន ស្វាយធំ',
  examYear: '២០២៦',
  examSession: 'សម័យប្រឡង៖ ២២ កក្កដា ២០២៦',
  examCenter: 'វិទ្យាល័យ ហ៊ុន សែន ស្វាយធំ',
};

/**
 * Handles initial data seeding.
 * 
 * Strategy:
 * - If Firebase is configured: wait for Firebase to respond first.
 *   Only seed if Firebase has NO students after a timeout.
 * - If Firebase is NOT configured: seed local store directly if empty.
 * 
 * This prevents overwriting scores already saved in Firebase.
 */
export default function SeedLoader() {
  const { students, importStudents, setSchoolInfo, setStudentsFromRemote, setExamConfigsFromRemote, firebaseStatus } =
    useExamStore();

  const seeded = useRef(false);
  const [firebaseChecked, setFirebaseChecked] = useState(false);

  useEffect(() => {
    if (seeded.current) return;

    if (!isFirebaseConfigured()) {
      // No Firebase: seed locally only if empty
      if (students.length === 0) {
        seeded.current = true;
        setSchoolInfo(SEED_SCHOOL_INFO, true);
        importStudents(seedData as Omit<Student, 'id'>[]);
      }
      return;
    }

    // Firebase IS configured: listen for first snapshot before deciding to seed
    let unsubscribe: (() => void) | undefined;
    let seedTimeout: ReturnType<typeof setTimeout>;

    unsubscribe = listenToFirebaseSync({
      onStudentsChange: (remoteStudents) => {
        setFirebaseChecked(true);
        if (remoteStudents && remoteStudents.length > 0) {
          // Firebase has real student data — use it, DO NOT seed
          setStudentsFromRemote(remoteStudents);
          clearTimeout(seedTimeout);
          seeded.current = true;
        } else if (!seeded.current) {
          // Firebase is empty — seed now and push to Firebase
          seeded.current = true;
          setSchoolInfo(SEED_SCHOOL_INFO, true);
          importStudents(seedData as Omit<Student, 'id'>[]);
        }
        // Cleanup listener — one-time check is enough
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = undefined;
        }
      },
      onSchoolInfoChange: (remoteInfo) => {
        if (remoteInfo) setSchoolInfo(remoteInfo, true);
      },
      onExamConfigsChange: (remoteConfigs) => {
        if (remoteConfigs) setExamConfigsFromRemote(remoteConfigs);
      },
    });

    // Safety timeout: if Firebase doesn't respond in 8 seconds and still empty → seed locally
    seedTimeout = setTimeout(() => {
      if (!seeded.current && students.length === 0) {
        seeded.current = true;
        setSchoolInfo(SEED_SCHOOL_INFO, true);
        importStudents(seedData as Omit<Student, 'id'>[]);
      }
    }, 8000);

    return () => {
      clearTimeout(seedTimeout);
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
