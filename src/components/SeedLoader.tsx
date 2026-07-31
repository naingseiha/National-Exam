'use client';

import { useEffect, useRef } from 'react';
import { useExamStore } from '@/store/examStore';
import {
  isFirebaseConfigured,
  fetchStudentsOnce,
} from '@/lib/firebase';
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
 * SeedLoader: Runs ONLY on first app load.
 *
 * Logic:
 * 1. If Firebase is NOT configured → seed locally (no Firebase).
 * 2. If Firebase IS configured:
 *    a. Fetch Firebase data once.
 *    b. If Firebase has students → use Firebase data (source of truth).
 *    c. If Firebase has no students → import seed data AND push seed to Firebase.
 *    d. Firebase failure timeout → use localStorage (Zustand persist already loaded).
 */
export default function SeedLoader() {
  const {
    students,
    importStudents,
    setSchoolInfo,
    setStudentsFromRemote,
  } = useExamStore();

  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    if (!isFirebaseConfigured()) {
      // No Firebase — seed locally only if store is completely empty
      if (students.length === 0) {
        done.current = true;
        setSchoolInfo(SEED_SCHOOL_INFO, true);
        importStudents(seedData as Omit<Student, 'id'>[]);
      } else {
        done.current = true;
      }
      return;
    }

    // Firebase IS configured.
    // Strategy: fetch Firebase ONCE, decide whether to seed.
    // Timeout so app doesn't hang if Firebase is unreachable.
    const timeoutId = setTimeout(() => {
      if (done.current) return;
      console.warn('[SeedLoader] Firebase timeout — using localStorage data');
      done.current = true;
      // Students from localStorage (Zustand persist) are already in store. Do nothing.
    }, 6000);

    const unsub = fetchStudentsOnce((firebaseStudents) => {
      if (done.current) return;
      clearTimeout(timeoutId);
      done.current = true;

      if (firebaseStudents && firebaseStudents.length > 0) {
        // Firebase has data → use it as source of truth
        console.log('[SeedLoader] Loaded', firebaseStudents.length, 'students from Firebase');
        setStudentsFromRemote(firebaseStudents);
      } else {
        // Firebase is empty → seed it
        console.log('[SeedLoader] Firebase empty — seeding data');
        setSchoolInfo(SEED_SCHOOL_INFO, true);
        importStudents(seedData as Omit<Student, 'id'>[]);
        // importStudents calls pushStudentsToFirebase internally
      }

      unsub();
    });

    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
