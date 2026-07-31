// =============================================
// Types for National Exam Management System
// =============================================

export type ExamType = 'grade9' | 'grade12_science' | 'grade12_social';

export type Gender = 'male' | 'female';

export type StudentStatus = 'pass' | 'fail' | 'absent' | 'pending';

export interface Subject {
  id: string;
  name: string;         // Khmer name
  nameEn: string;       // English name
  maxScore: number;
  coefficient: number;
  passMark?: number;    // minimum score for this subject
}

export interface Student {
  id: string;
  examNumber: string;   // លេខប្រឡង
  name: string;         // ឈ្មោះ (Khmer)
  gender: Gender;
  dob?: string;
  birthPlace?: string;
  school?: string;
  room: string;         // បន្ទប់
  classNumber?: string; // ថ្នាក់
  examType: ExamType;
  scores: Record<string, number | null>; // subjectId -> score
  totalScore?: number;
  totalCoefficient?: number;
  average?: number;
  rank?: number;
  status?: StudentStatus;
  note?: string;
}

export interface Room {
  id: string;
  name: string;         // e.g. "01", "02"
  examType: ExamType;
  capacity: number;
  studentCount: number;
}

export interface ExamConfig {
  examType: ExamType;
  name: string;         // Khmer name
  nameEn: string;
  subjects: Subject[];
  passConditions: PassCondition;
}

export interface PassCondition {
  minAverage: number;            // minimum average to pass (e.g. 25)
  minSubjectScore?: number;      // minimum per-subject score (optional)
  noZeroAllowed?: boolean;       // fail if any subject = 0
  maxScoreForAverage?: number;   // total max for average calculation
}

export interface SchoolInfo {
  name: string;
  nameEn?: string;
  department?: string;
  address?: string;
  examYear: string;
  examSession?: string;
  province?: string;
  examCenter?: string;
}

export interface ExamStats {
  total: number;
  passed: number;
  failed: number;
  absent: number;
  passRate: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
}

// Import/Export
export interface ImportResult {
  success: boolean;
  students: Student[];
  errors: string[];
  rooms: Room[];
}
