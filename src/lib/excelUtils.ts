import * as XLSX from 'xlsx';
import { Student, ExamType, ImportResult } from '@/types';
import { EXAM_CONFIGS } from '@/config/examConfig';
import { generateStudentId } from '@/lib/calculations';

/**
 * Parse Excel file and extract student data
 * Supports the format from "បញ្ជីលទ្ធផលប្រឡង2026.xlsx"
 */
export async function parseExcelFile(
  file: File,
  examType: ExamType
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const students: Student[] = [];
        const errors: string[] = [];
        const roomSet = new Set<string>();

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as (string | number)[][];

          if (jsonData.length < 2) return;

          // Try to detect header row (look for ឈ្មោះ or name-like column)
          let headerRowIndex = 0;
          let examNumCol = -1;
          let nameCol = -1;
          let genderCol = -1;
          let roomCol = -1;

          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i].map((cell) => String(cell).trim());
            // Look for key columns
            const examNumIdx = row.findIndex(
              (c) => c.includes('លេខ') || c.toLowerCase().includes('no') || c.includes('ល.រ')
            );
            const nameIdx = row.findIndex(
              (c) => c.includes('ឈ្មោះ') || c.toLowerCase().includes('name')
            );
            const roomIdx = row.findIndex(
              (c) => c.includes('បន្ទប់') || c.toLowerCase().includes('room') || c.includes('ថ្នាក់')
            );

            if (nameIdx >= 0) {
              headerRowIndex = i;
              examNumCol = examNumIdx >= 0 ? examNumIdx : 0;
              nameCol = nameIdx;
              genderCol = row.findIndex(
                (c) => c.includes('ភេទ') || c.toLowerCase().includes('sex') || c.toLowerCase().includes('gender')
              );
              roomCol = roomIdx >= 0 ? roomIdx : -1;
              break;
            }
          }

          if (nameCol < 0) {
            // Fallback: assume first meaningful row is header, name is col 1 or 2
            headerRowIndex = 1;
            examNumCol = 0;
            nameCol = 1;
          }

          // Determine room from sheet name
          const roomFromSheet = sheetName.replace(/[^0-9]/g, '').padStart(2, '0') || sheetName;

          // Parse student rows
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const name = String(row[nameCol] || '').trim();
            if (!name || name === 'undefined') continue;

            const examNum = String(row[examNumCol] || '').trim() || `${i}`;
            const room = roomCol >= 0 ? String(row[roomCol] || roomFromSheet).trim() : roomFromSheet;
            const genderRaw = genderCol >= 0 ? String(row[genderCol] || '').trim() : '';
            const gender = genderRaw.includes('ស្រី') || genderRaw.toLowerCase() === 'f' || genderRaw.toLowerCase() === 'female'
              ? 'female'
              : 'male';

            roomSet.add(room);

            students.push({
              id: generateStudentId(),
              examNumber: examNum,
              name,
              gender,
              room,
              examType,
              scores: {},
              status: 'pending',
            });
          }
        });

        const rooms = Array.from(roomSet).map((name) => ({
          id: `${examType}_${name}`,
          name,
          examType,
          capacity: 30,
          studentCount: students.filter((s) => s.room === name).length,
        }));

        resolve({ success: true, students, errors, rooms });
      } catch (err) {
        resolve({
          success: false,
          students: [],
          errors: [`Error parsing file: ${err}`],
          rooms: [],
        });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export students to Excel with beautiful formatting
 */
export function exportToExcel(
  students: Student[],
  examType: ExamType,
  roomName: string,
  schoolInfo: { name: string; examYear: string; examSession?: string }
) {
  const config = EXAM_CONFIGS[examType];
  const subjects = config.subjects;

  const workbook = XLSX.utils.book_new();

  // Header data
  const headerRows = [
    [`ព្រះរាជាណាចក្រកម្ពុជា`],
    [`ជាតិ សាសនា ព្រះមហាក្សត្រ`],
    [''],
    [`${schoolInfo.name}`],
    [`${schoolInfo.examSession || `សម័យប្រឡង ${schoolInfo.examYear}`}`],
    [`បន្ទប់ ${roomName}`],
    [''],
  ];

  // Column headers
  const colHeaders = [
    'ល.រ',
    'លេខប្រឡង',
    'ឈ្មោះ',
    'ភេទ',
    ...subjects.map((s) => `${s.name}\n(/${s.maxScore})`),
    'ពិន្ទុសរុប',
    'មធ្យម',
    'លទ្ធផល',
    'ចំណាត់ថ្នាក់',
  ];

  // Data rows
  const dataRows = students.map((student, index) => [
    index + 1,
    student.examNumber,
    student.name,
    student.gender === 'female' ? 'ស្រី' : 'ប្រុស',
    ...subjects.map((s) => (student.scores || {})[s.id] ?? ''),
    student.totalScore ?? '',
    student.average ?? '',
    student.status === 'pass' ? 'ជាប់' : student.status === 'fail' ? 'ធ្លាក់' : 'មិនទាន់',
    student.rank ?? '',
  ]);

  const allRows = [...headerRows, colHeaders, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  // Column widths
  const colWidths = [
    { wch: 5 },   // ល.រ
    { wch: 12 },  // លេខប្រឡង
    { wch: 25 },  // ឈ្មោះ
    { wch: 8 },   // ភេទ
    ...subjects.map(() => ({ wch: 10 })),
    { wch: 10 },  // ពិន្ទុសរុប
    { wch: 8 },   // មធ្យម
    { wch: 8 },   // លទ្ធផល
    { wch: 10 },  // ចំណាត់ថ្នាក់
  ];
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, `បន្ទប់ ${roomName}`);

  // Download
  XLSX.writeFile(workbook, `លទ្ធផលប្រឡង_បន្ទប់${roomName}_${schoolInfo.examYear}.xlsx`);
}

/**
 * Export all rooms to separate sheets in one Excel file
 */
export function exportAllToExcel(
  students: Student[],
  examType: ExamType,
  schoolInfo: { name: string; examYear: string; examSession?: string }
) {
  const config = EXAM_CONFIGS[examType];
  const subjects = config.subjects;
  const workbook = XLSX.utils.book_new();

  const rooms = [...new Set(students.map((s) => s.room))].sort();

  rooms.forEach((room) => {
    const roomStudents = students.filter((s) => s.room === room);

    const headerRows = [
      [`ព្រះរាជាណាចក្រកម្ពុជា`],
      [`ជាតិ សាសនា ព្រះមហាក្សត្រ`],
      [''],
      [`${schoolInfo.name}`],
      [`${schoolInfo.examSession || `សម័យប្រឡង ${schoolInfo.examYear}`}`],
      [`បន្ទប់ ${room}`],
      [''],
    ];

    const colHeaders = [
      'ល.រ',
      'លេខប្រឡង',
      'ឈ្មោះ',
      'ភេទ',
      ...subjects.map((s) => `${s.name} (/${s.maxScore})`),
      'ពិន្ទុសរុប',
      'មធ្យម',
      'លទ្ធផល',
      'ចំណាត់ថ្នាក់',
    ];

    const dataRows = roomStudents.map((student, index) => [
      index + 1,
      student.examNumber,
      student.name,
      student.gender === 'female' ? 'ស្រី' : 'ប្រុស',
      ...subjects.map((s) => (student.scores || {})[s.id] ?? ''),
      student.totalScore ?? '',
      student.average ?? '',
      student.status === 'pass' ? 'ជាប់' : student.status === 'fail' ? 'ធ្លាក់' : 'មិនទាន់',
      student.rank ?? '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headerRows, colHeaders, ...dataRows]);
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 12 }, { wch: 25 }, { wch: 8 },
      ...subjects.map(() => ({ wch: 10 })),
      { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, `បន្ទប់ ${room}`);
  });

  XLSX.writeFile(workbook, `លទ្ធផលប្រឡងទាំងអស់_${schoolInfo.examYear}.xlsx`);
}
