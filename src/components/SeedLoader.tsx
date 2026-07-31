'use client';

import { useEffect, useRef } from 'react';
import { useExamStore } from '@/store/examStore';
import { listenToFirebaseSync, isFirebaseConfigured } from '@/lib/firebase';
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
  const { students, importStudents, setSchoolInfo, setStudentsFromRemote, setExamConfigsFromRemote } =
    useExamStore();

  const seeded = useRef(false);

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
    let unsub: (() => void) | null = null;

    const timeoutId = setTimeout(() => {
      // Safety: if Firebase doesn't respond in 8s and store is still empty → seed locally
      if (!seeded.current && students.length === 0) {
        seeded.current = true;
        setSchoolInfo(SEED_SCHOOL_INFO, true);
        importStudents(seedData as Omit<Student, 'id'>[]);
      }
    }, 8000);

    unsub = listenToFirebaseSync({
      onStudentsChange: (remoteStudents) => {
        clearTimeout(timeoutId);
        if (remoteStudents && remoteStudents.length > 0) {
          // Firebase has real student data — use it, DO NOT seed
          setStudentsFromRemote(remoteStudents);
          seeded.current = true;
        } else if (!seeded.current) {
          // Firebase is empty — seed now and push to Firebase
          seeded.current = true;
          setSchoolInfo(SEED_SCHOOL_INFO, true);
          importStudents(seedData as Omit<Student, 'id'>[]);
        }
        // Cleanup — only need first snapshot for seeding decision
        if (unsub) {
          unsub();
          unsub = null;
        }
      },
      onSchoolInfoChange: (remoteInfo) => {
        if (remoteInfo) setSchoolInfo(remoteInfo, true);
      },
      onExamConfigsChange: (remoteConfigs) => {
        if (remoteConfigs) setExamConfigsFromRemote(remoteConfigs);
      },
    });

    return () => {
      clearTimeout(timeoutId);
      if (unsub) unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
