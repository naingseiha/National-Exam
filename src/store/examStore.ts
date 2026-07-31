'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, ExamType, Room, SchoolInfo, ExamConfig } from '@/types';
import { EXAM_CONFIGS } from '@/config/examConfig';
import { calculateStudentResult, calculateRanks, generateStudentId } from '@/lib/calculations';
import {
  pushStudentsToFirebase,
  pushSchoolInfoToFirebase,
  pushExamConfigsToFirebase,
} from '@/lib/firebase';

interface ExamStore {
  // School info
  schoolInfo: SchoolInfo;
  setSchoolInfo: (info: SchoolInfo, skipFirebase?: boolean) => void;

  // Students
  students: Student[];
  setStudentsFromRemote: (students: Student[]) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (students: Omit<Student, 'id'>[]) => void;
  clearStudents: (examType?: ExamType) => void;

  // Score entry
  updateScore: (studentId: string, subjectId: string, score: number | null) => void;
  updateAllScores: (studentId: string, scores: Record<string, number | null>) => void;
  recalculateAll: () => void;

  // Exam configs (customizable)
  examConfigs: Record<ExamType, ExamConfig>;
  updateExamConfig: (examType: ExamType, config: Partial<ExamConfig>, skipFirebase?: boolean) => void;
  setExamConfigsFromRemote: (configs: Record<ExamType, ExamConfig>) => void;

  // Sync state
  firebaseStatus: 'connected' | 'disconnected' | 'not_configured';
  setFirebaseStatus: (status: 'connected' | 'disconnected' | 'not_configured') => void;

  // Filters/UI state
  selectedExamType: ExamType;
  setSelectedExamType: (type: ExamType) => void;
  selectedRoom: string | null;
  setSelectedRoom: (room: string | null) => void;

  // Computed getters
  getStudentsByRoom: (examType: ExamType, room: string) => Student[];
  getRooms: (examType: ExamType) => Room[];
  getStudentById: (id: string) => Student | undefined;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      // School info
      schoolInfo: {
        name: 'មណ្ឌលប្រឡង',
        examYear: '2026',
        examSession: 'សម័យប្រឡង ២០២៦',
        province: '',
        examCenter: '',
      },
      setSchoolInfo: (info, skipFirebase) => {
        set({ schoolInfo: info });
        if (!skipFirebase) pushSchoolInfoToFirebase(info);
      },

      // Students
      students: [],

      setStudentsFromRemote: (remoteStudents) => {
        set({ students: remoteStudents });
      },

      addStudent: (studentData) => {
        const newStudent: Student = {
          ...studentData,
          id: generateStudentId(),
          scores: studentData.scores ?? {},
        };
        const calculated = calculateStudentResult(newStudent);
        const nextStudents = [...get().students, calculated];
        set({ students: nextStudents });
        pushStudentsToFirebase(nextStudents);
      },

      updateStudent: (id, updates) => {
        const nextStudents = get().students.map((s) => {
          if (s.id !== id) return s;
          const updated = { ...s, ...updates };
          return calculateStudentResult(updated);
        });
        set({ students: nextStudents });
        pushStudentsToFirebase(nextStudents);
      },

      deleteStudent: (id) => {
        const nextStudents = get().students.filter((s) => s.id !== id);
        set({ students: nextStudents });
        pushStudentsToFirebase(nextStudents);
      },

      importStudents: (studentsData) => {
        const newStudents = studentsData.map((s) => {
          const student: Student = { ...s, id: generateStudentId(), scores: s.scores ?? {} };
          return calculateStudentResult(student);
        });
        const nextStudents = [...get().students, ...newStudents];
        set({ students: nextStudents });
        pushStudentsToFirebase(nextStudents);
      },

      clearStudents: (examType) => {
        let nextStudents: Student[];
        if (examType) {
          nextStudents = get().students.filter((s) => s.examType !== examType);
        } else {
          nextStudents = [];
        }
        set({ students: nextStudents });
        pushStudentsToFirebase(nextStudents);
      },

      // Score updates
      updateScore: (studentId, subjectId, score) => {
        const nextStudents = get().students.map((s) => {
          if (s.id !== studentId) return s;
          const updated = { ...s, scores: { ...s.scores, [subjectId]: score } };
          return calculateStudentResult(updated);
        });
        set({ students: nextStudents });
        pushStudentsToFirebase(nextStudents);
      },

      updateAllScores: (studentId, scores) => {
        const nextStudents = get().students.map((s) => {
          if (s.id !== studentId) return s;
          const updated = { ...s, scores };
          return calculateStudentResult(updated);
        });
        set({ students: nextStudents });
        pushStudentsToFirebase(nextStudents);
      },

      recalculateAll: () => {
        const recalculated = get().students.map((s) => calculateStudentResult(s));
        const grouped: Record<string, Student[]> = {};
        recalculated.forEach((s) => {
          const key = `${s.examType}__${s.room}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(s);
        });
        const withRanks: Student[] = [];
        Object.values(grouped).forEach((group) => {
          withRanks.push(...calculateRanks(group));
        });
        set({ students: withRanks });
        pushStudentsToFirebase(withRanks);
      },

      // Exam configs
      examConfigs: EXAM_CONFIGS,
      updateExamConfig: (examType, config, skipFirebase) => {
        const nextConfigs = {
          ...get().examConfigs,
          [examType]: { ...get().examConfigs[examType], ...config },
        };
        set({ examConfigs: nextConfigs });
        if (!skipFirebase) pushExamConfigsToFirebase(nextConfigs);
      },
      setExamConfigsFromRemote: (configs) => {
        set({ examConfigs: configs });
      },

      // Firebase status
      firebaseStatus: 'not_configured',
      setFirebaseStatus: (status) => set({ firebaseStatus: status }),

      // UI state
      selectedExamType: 'grade12_science',
      setSelectedExamType: (type) => set({ selectedExamType: type }),
      selectedRoom: null,
      setSelectedRoom: (room) => set({ selectedRoom: room }),

      // Computed getters
      getStudentsByRoom: (examType, room) => {
        return get().students.filter(
          (s) => s.examType === examType && s.room === room
        );
      },

      getRooms: (examType) => {
        const students = get().students.filter((s) => s.examType === examType);
        const roomMap: Record<string, number> = {};
        students.forEach((s) => {
          if (!roomMap[s.room]) roomMap[s.room] = 0;
          roomMap[s.room]++;
        });
        return Object.entries(roomMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, count]) => ({
            id: `${examType}_${name}`,
            name,
            examType,
            capacity: 30,
            studentCount: count,
          }));
      },

      getStudentById: (id) => get().students.find((s) => s.id === id),
    }),
    {
      name: 'national-exam-storage',
      version: 1,
    }
  )
);
