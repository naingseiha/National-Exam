'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/store/examStore';
import seedData from '@/data/seedStudents.json';
import { Student } from '@/types';

/**
 * Loads seed student data from Excel on first visit (only if no students exist)
 */
export default function SeedLoader() {
  const { students, importStudents, setSchoolInfo } = useExamStore();

  useEffect(() => {
    if (students.length === 0) {
      // Set school info from the Excel file
      setSchoolInfo({
        name: 'វិទ្យាល័យ ហ៊ុន សែន ស្វាយធំ',
        examYear: '2026',
        examSession: 'បញ្ជីលទ្ធផលប្រឡងសាក ទី១២ — ឆ្នាំសិក្សា ២០២៥-២០២៦',
        province: 'ខេត្តស្វាយរៀង',
        examCenter: 'វិទ្យាល័យ ហ៊ុន សែន ស្វាយធំ',
      });
      // Import all 311 students from Excel
      importStudents(seedData as Omit<Student, 'id'>[]);
    }
  }, []);

  return null;
}
