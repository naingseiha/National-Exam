import { ExamConfig, ExamType } from '@/types';

export const EXAM_CONFIGS: Record<ExamType, ExamConfig> = {
  grade9: {
    examType: 'grade9',
    name: 'ប្រឡងជ្រើសរើសសញ្ញាបត្រ មធ្យមសិក្សាបឋមភូមិ (ថ្នាក់ទី ៩)',
    nameEn: 'Grade 9 National Exam (BEFE)',
    subjects: [
      { id: 'khmer', name: 'ភាសាខ្មែរ', nameEn: 'Khmer', maxScore: 40, coefficient: 2 },
      { id: 'math', name: 'គណិតវិទ្យា', nameEn: 'Mathematics', maxScore: 40, coefficient: 2 },
      { id: 'physics', name: 'រូបវិទ្យា', nameEn: 'Physics', maxScore: 20, coefficient: 1 },
      { id: 'chemistry', name: 'គីមីវិទ្យា', nameEn: 'Chemistry', maxScore: 20, coefficient: 1 },
      { id: 'biology', name: 'ជីវវិទ្យា', nameEn: 'Biology', maxScore: 20, coefficient: 1 },
      { id: 'history', name: 'ប្រវត្តិវិទ្យា', nameEn: 'History', maxScore: 20, coefficient: 1 },
      { id: 'geography', name: 'ភូមិវិទ្យា', nameEn: 'Geography', maxScore: 20, coefficient: 1 },
      { id: 'civics', name: 'ពលរដ្ឋ', nameEn: 'Civics', maxScore: 20, coefficient: 1 },
      { id: 'english', name: 'ភាសាអង់គ្លេស', nameEn: 'English', maxScore: 40, coefficient: 2 },
    ],
    passConditions: {
      minAverage: 25,
      noZeroAllowed: true,
      maxScoreForAverage: 240,
    },
  },

  grade12_science: {
    examType: 'grade12_science',
    name: 'ប្រឡងសញ្ញាបត្រ មធ្យមសិក្សាទុតិយភូមិ (ថ្នាក់ទី ១២ - វិទ្យាសាស្ត្រ)',
    nameEn: 'Grade 12 National Exam - Science Stream',
    subjects: [
      { id: 'math', name: 'គណិត', nameEn: 'Math', maxScore: 125, coefficient: 2.5 },
      { id: 'physics', name: 'រូប', nameEn: 'Physics', maxScore: 75, coefficient: 1.5 },
      { id: 'chemistry', name: 'គីមី', nameEn: 'Chemistry', maxScore: 75, coefficient: 1.5 },
      { id: 'biology', name: 'ជីវៈ', nameEn: 'Biology', maxScore: 75, coefficient: 1.5 },
      { id: 'khmer', name: 'ខ្មែរ', nameEn: 'Khmer', maxScore: 75, coefficient: 1.5 },
      { id: 'history', name: 'ប្រវត្តិ', nameEn: 'History', maxScore: 50, coefficient: 1 },
      { id: 'foreign', name: 'ភាសា', nameEn: 'Foreign Language', maxScore: 50, coefficient: 1 },
    ],
    passConditions: {
      minAverage: 237.5,
      noZeroAllowed: true,
      maxScoreForAverage: 525,
    },
  },

  grade12_social: {
    examType: 'grade12_social',
    name: 'ប្រឡងសញ្ញាបត្រ មធ្យមសិក្សាទុតិយភូមិ (ថ្នាក់ទី ១២ - វិទ្យាសាស្ត្រសង្គម)',
    nameEn: 'Grade 12 National Exam - Social Science Stream',
    subjects: [
      { id: 'khmer', name: 'ខ្មែរ', nameEn: 'Khmer', maxScore: 125, coefficient: 2.5 },
      { id: 'math', name: 'គណិត', nameEn: 'Math', maxScore: 75, coefficient: 1.5 },
      { id: 'history', name: 'ប្រវត្តិ', nameEn: 'History', maxScore: 75, coefficient: 1.5 },
      { id: 'civics', name: 'សីល', nameEn: 'Civics', maxScore: 75, coefficient: 1.5 },
      { id: 'geography', name: 'ភូមិ', nameEn: 'Geography', maxScore: 75, coefficient: 1.5 },
      { id: 'earth', name: 'ផែនដី', nameEn: 'Earth Science', maxScore: 50, coefficient: 1 },
      { id: 'foreign', name: 'ភាសា', nameEn: 'Foreign Language', maxScore: 50, coefficient: 1 },
    ],
    passConditions: {
      minAverage: 237.5,
      noZeroAllowed: true,
      maxScoreForAverage: 525,
    },
  },
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  grade9: 'ថ្នាក់ទី ៩',
  grade12_science: 'ថ្នាក់ទី ១២ (វិទ្យាសាស្ត្រ)',
  grade12_social: 'ថ្នាក់ទី ១២ (វិទ្យាសាស្ត្រសង្គម)',
};

export const EXAM_TYPE_COLORS: Record<ExamType, { bg: string; text: string; border: string }> = {
  grade9: { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--accent-green)', border: 'rgba(16, 185, 129, 0.3)' },
  grade12_science: { bg: 'var(--accent-blue-transparent)', text: 'var(--accent-blue)', border: 'var(--accent-blue-transparent)' },
  grade12_social: { bg: 'rgba(139, 92, 246, 0.15)', text: 'var(--accent-purple)', border: 'rgba(139, 92, 246, 0.3)' },
};
