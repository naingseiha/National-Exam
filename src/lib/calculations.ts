import { Student, ExamStats } from '@/types';
import { EXAM_CONFIGS } from '@/config/examConfig';

/**
 * Calculate pass/fail status and scores for a student
 */
export function calculateStudentResult(student: Student): Student {
  const config = EXAM_CONFIGS[student.examType] || EXAM_CONFIGS.grade12_science;
  const subjects = config.subjects || [];
  const passCondition = config.passConditions;
  const scores = student.scores || {};

  let totalWeighted = 0;
  let totalCoefficient = 0;
  let hasZero = false;
  let hasNull = false;

  subjects.forEach((subject) => {
    const score = scores[subject.id];
    if (score === null || score === undefined) {
      hasNull = true;
      return;
    }
    if (score === 0) hasZero = true;
    totalWeighted += score * subject.coefficient;
    totalCoefficient += subject.coefficient * (subject.maxScore / 20); // normalize to /20
  });

  if (hasNull) {
    return { ...student, status: 'pending' };
  }

  const maxPossible = subjects.reduce(
    (sum, s) => sum + s.maxScore * s.coefficient,
    0
  );
  const average = totalCoefficient > 0 ? (totalWeighted / (maxPossible / 20)) : 0;
  const totalScore = subjects.reduce(
    (sum, s) => sum + (scores[s.id] ?? 0),
    0
  );

  let status: 'pass' | 'fail' = 'pass';
  if (average < passCondition.minAverage) status = 'fail';
  if (passCondition.noZeroAllowed && hasZero) status = 'fail';

  return {
    ...student,
    totalScore,
    average: Math.round(average * 100) / 100,
    status,
  };
}

/**
 * Get grade letter (A, B, C, D, E, F) for a single subject score
 */
export function getSubjectGradeLetter(score: number | null | undefined, maxScore: number): string {
  if (score === null || score === undefined || isNaN(score)) return '-';
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  if (pct >= 50) return 'E';
  return 'F';
}

/**
 * Get overall grade letter (A, B, C, D, E, F) for a student
 */
export function getOverallGradeLetter(student: Student): string {
  if (student.status === 'pending' || student.average === undefined || student.average === null) return '-';
  if (student.status === 'fail') return 'F';
  const avg = student.average;
  // Based on 50 average scale
  const pct = (avg / 50) * 100;
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  if (pct >= 50) return 'E';
  return 'F';
}

/**
 * Calculate rank for all students in a room
 */
export function calculateRanks(students: Student[]): Student[] {
  const sorted = [...students]
    .filter((s) => s.status === 'pass')
    .sort((a, b) => (b.average ?? 0) - (a.average ?? 0));

  const withRanks = students.map((student) => {
    if (student.status !== 'pass') return { ...student, rank: undefined };
    const rank = sorted.findIndex((s) => s.id === student.id) + 1;
    return { ...student, rank };
  });

  return withRanks;
}

/**
 * Calculate statistics for a group of students
 */
export function calculateStats(students: Student[]): ExamStats {
  const total = students.length;
  const passed = students.filter((s) => s.status === 'pass').length;
  const failed = students.filter((s) => s.status === 'fail').length;
  const absent = students.filter((s) => s.status === 'absent').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const scores = students
    .filter((s) => s.average !== undefined && s.status !== 'absent')
    .map((s) => s.average ?? 0);

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const averageScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0;

  return { total, passed, failed, absent, passRate, highestScore, lowestScore, averageScore };
}

/**
 * Generate unique student ID
 */
export function generateStudentId(): string {
  return `std_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sort students by exam number
 */
export function sortStudentsByExamNumber(students: Student[]): Student[] {
  return [...students].sort((a, b) => {
    const numA = parseInt(a.examNumber.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.examNumber.replace(/\D/g, '')) || 0;
    return numA - numB;
  });
}

/**
 * Calculate continuous student sequence number (ល.រ) within their exam type
 */
export function getStudentSeqNo(student: Student, allStudents?: Student[]): number {
  if (allStudents && allStudents.length > 0) {
    const sameType = allStudents
      .filter((s) => s.examType === student.examType)
      .sort((a, b) => {
        const numA = parseInt((a.examNumber || '').replace(/\D/g, '')) || 0;
        const numB = parseInt((b.examNumber || '').replace(/\D/g, '')) || 0;
        return numA - numB;
      });
    const idx = sameType.findIndex((s) => s.id === student.id);
    if (idx !== -1) return idx + 1;
  }
  const parsed = parseInt((student.examNumber || '').replace(/\D/g, '')) % 1000;
  return isNaN(parsed) || parsed === 0 ? 1 : parsed;
}

/**
 * Format score for display
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '-';
  return score.toString();
}

/**
 * Get grade letter from average
 */
export function getGradeLetter(average: number): string {
  if (average >= 90) return 'A';
  if (average >= 80) return 'B';
  if (average >= 70) return 'C';
  if (average >= 60) return 'D';
  if (average >= 50) return 'E';
  return 'F';
}

/**
 * Convert number to Khmer numerals
 */
export function toKhmerNum(num: number | string): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/\d/g, (d) => khmerDigits[parseInt(d)]);
}
