import { ExamConfig, ExamType } from '@/types';

export const EXAM_CONFIGS: Record<ExamType, ExamConfig> = {
  grade9: {
    examType: 'grade9',
    name: 'ប្រឡងជំរើសសញ្ញាបត្រ មធ្យមសិក្សាបឋមភូមិ (ថ្នាក់ទី ៩)',
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
    name: 'ប្រឡងសញ្ញាបត្រ មធ្យមសិក្សាទុតិយភូមិ - ជំនាញវិទ្យាសាស្ត្រ (ថ្នាក់ទី ១២)',
    nameEn: 'Grade 12 National Exam - Science (BEPC)',
    subjects: [
      { id: 'khmer', name: 'ភាសាខ្មែរ', nameEn: 'Khmer', maxScore: 40, coefficient: 2 },
      { id: 'math', name: 'គណិតវិទ្យា', nameEn: 'Mathematics', maxScore: 60, coefficient: 3 },
      { id: 'physics', name: 'រូបវិទ្យា', nameEn: 'Physics', maxScore: 40, coefficient: 2 },
      { id: 'chemistry', name: 'គីមីវិទ្យា', nameEn: 'Chemistry', maxScore: 40, coefficient: 2 },
      { id: 'biology', name: 'ជីវវិទ្យា', nameEn: 'Biology', maxScore: 40, coefficient: 2 },
      { id: 'english', name: 'ភាសាអង់គ្លេស', nameEn: 'English', maxScore: 40, coefficient: 2 },
      { id: 'history_geo', name: 'ប្រវត្តិ-ភូមិ', nameEn: 'History-Geography', maxScore: 40, coefficient: 2 },
    ],
    passConditions: {
      minAverage: 25,
      noZeroAllowed: true,
      maxScoreForAverage: 300,
    },
  },

  grade12_social: {
    examType: 'grade12_social',
    name: 'ប្រឡងសញ្ញាបត្រ មធ្យមសិក្សាទុតិយភូមិ - ជំនាញសង្គមវិទ្យា (ថ្នាក់ទី ១២)',
    nameEn: 'Grade 12 National Exam - Social Science (BEPC)',
    subjects: [
      { id: 'khmer', name: 'ភាសាខ្មែរ', nameEn: 'Khmer', maxScore: 40, coefficient: 2 },
      { id: 'history_geo', name: 'ប្រវត្តិ-ភូមិវិទ្យា', nameEn: 'History-Geography', maxScore: 60, coefficient: 3 },
      { id: 'economy', name: 'សេដ្ឋកិច្ច', nameEn: 'Economics', maxScore: 40, coefficient: 2 },
      { id: 'civics', name: 'ពលរដ្ឋ', nameEn: 'Civics', maxScore: 40, coefficient: 2 },
      { id: 'english', name: 'ភាសាអង់គ្លេស', nameEn: 'English', maxScore: 40, coefficient: 2 },
      { id: 'math', name: 'គណិតវិទ្យា', nameEn: 'Mathematics', maxScore: 40, coefficient: 2 },
    ],
    passConditions: {
      minAverage: 25,
      noZeroAllowed: true,
      maxScoreForAverage: 260,
    },
  },
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  grade9: 'ថ្នាក់ទី ៩',
  grade12_science: 'ថ្នាក់ទី ១២ (វិទ្យាសាស្ត្រ)',
  grade12_social: 'ថ្នាក់ទី ១២ (សង្គមវិទ្យា)',
};

export const EXAM_TYPE_COLORS: Record<ExamType, { bg: string; text: string; border: string }> = {
  grade9: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  grade12_science: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  grade12_social: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
};
