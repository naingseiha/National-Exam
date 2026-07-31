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
        department: 'មន្ទីរអប់រំ យុវជន និងកីឡា',
        province: 'ខេត្តសៀមរាប',
        name: 'វិទ្យាល័យ ហ៊ុន សែន ស្វាយធំ',
        examYear: '២០២៦',
        examSession: 'សម័យប្រឡង៖ ២២ កក្កដា ២០២៦',
        examCenter: 'វិទ្យាល័យ ហ៊ុន សែន ស្វាយធំ',
      });
      // Import all 311 students from Excel
      importStudents(seedData as Omit<Student, 'id'>[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
