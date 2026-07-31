import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, ExamType } from '@/types';
import { EXAM_CONFIGS } from '@/config/examConfig';

/**
 * Export results to PDF with beautiful A4 layout
 */
export async function exportToPDF(
  students: Student[],
  examType: ExamType,
  roomName: string,
  schoolInfo: { name: string; examYear: string; examSession?: string; examCenter?: string }
) {
  const config = EXAM_CONFIGS[examType];
  const subjects = config.subjects;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text('ព្រះរាជាណាចក្រកម្ពុជា', pageWidth / 2, 12, { align: 'center' });
  doc.text('ជាតិ សាសនា ព្រះមហាក្សត្រ', pageWidth / 2, 17, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolInfo.name, pageWidth / 2, 26, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(config.name, pageWidth / 2, 33, { align: 'center' });
  doc.text(`${schoolInfo.examSession || `សម័យប្រឡង ${schoolInfo.examYear}`}`, pageWidth / 2, 39, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`បន្ទប់ : ${roomName}`, 15, 47);

  const passed = students.filter((s) => s.status === 'pass').length;
  const failed = students.filter((s) => s.status === 'fail').length;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`ចំនួនសិស្សសរុប: ${students.length}  |  ជាប់: ${passed}  |  ធ្លាក់: ${failed}`, pageWidth - 15, 47, { align: 'right' });

  // Table
  const headers = [
    'ល.រ',
    'លេខប្រឡង',
    'ឈ្មោះ',
    'ភេទ',
    ...subjects.map((s) => `${s.nameEn}\n/${s.maxScore}`),
    'Total',
    'Avg',
    'Result',
    'Rank',
  ];

  const rows = students.map((student, i) => [
    i + 1,
    student.examNumber,
    student.name,
    student.gender === 'female' ? 'F' : 'M',
    ...subjects.map((s) => student.scores[s.id] ?? '-'),
    student.totalScore ?? '-',
    student.average ?? '-',
    student.status === 'pass' ? 'PASS' : student.status === 'fail' ? 'FAIL' : '-',
    student.rank ?? '-',
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 52,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 30, 30],
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 40 },
      3: { halign: 'center', cellWidth: 10 },
    },
    didParseCell: (data) => {
      // Red background for failed students
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        if (students[rowIndex]?.status === 'fail') {
          data.cell.styles.textColor = [180, 50, 50];
          data.cell.styles.fillColor = [255, 240, 240];
        }
      }
    },
    didDrawCell: (data) => {
      // Draw red line across failed student rows
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        if (students[rowIndex]?.status === 'fail') {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(220, 50, 50);
          doc.setLineWidth(0.5);
          doc.line(x, y + height / 2, x + width, y + height / 2);
        }
      }
    },
  });

  // Footer
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || pageHeight - 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `បោះពុម្ភ: ${new Date().toLocaleDateString('km-KH')}`,
    15,
    Math.min(finalY + 10, pageHeight - 10)
  );

  doc.save(`លទ្ធផលប្រឡង_បន្ទប់${roomName}_${schoolInfo.examYear}.pdf`);
}

/**
 * Export all rooms to PDF (one per page)
 */
export async function exportAllToPDF(
  students: Student[],
  examType: ExamType,
  schoolInfo: { name: string; examYear: string; examSession?: string }
) {
  const config = EXAM_CONFIGS[examType];
  const subjects = config.subjects;
  const rooms = [...new Set(students.map((s) => s.room))].sort();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  rooms.forEach((room, roomIndex) => {
    if (roomIndex > 0) doc.addPage();

    const roomStudents = students.filter((s) => s.room === room);
    const passed = roomStudents.filter((s) => s.status === 'pass').length;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('ព្រះរាជាណាចក្រកម្ពុជា', pageWidth / 2, 12, { align: 'center' });
    doc.text('ជាតិ សាសនា ព្រះមហាក្សត្រ', pageWidth / 2, 17, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolInfo.name, pageWidth / 2, 26, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(config.name, pageWidth / 2, 33, { align: 'center' });
    doc.text(`${schoolInfo.examSession || `សម័យប្រឡង ${schoolInfo.examYear}`}`, pageWidth / 2, 39, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`បន្ទប់ : ${room}`, 15, 47);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `ចំនួន: ${roomStudents.length}  |  ជាប់: ${passed}  |  ធ្លាក់: ${roomStudents.length - passed}`,
      pageWidth - 15,
      47,
      { align: 'right' }
    );

    const headers = [
      'ល.រ', 'លេខប្រឡង', 'ឈ្មោះ', 'ភេទ',
      ...subjects.map((s) => `${s.nameEn}\n/${s.maxScore}`),
      'Total', 'Avg', 'Result', 'Rank',
    ];

    const rows = roomStudents.map((student, i) => [
      i + 1,
      student.examNumber,
      student.name,
      student.gender === 'female' ? 'F' : 'M',
      ...subjects.map((s) => student.scores[s.id] ?? '-'),
      student.totalScore ?? '-',
      student.average ?? '-',
      student.status === 'pass' ? 'PASS' : 'FAIL',
      student.rank ?? '-',
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 52,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      didDrawCell: (data) => {
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          if (roomStudents[rowIndex]?.status === 'fail') {
            const { x, y, width, height } = data.cell;
            doc.setDrawColor(220, 50, 50);
            doc.setLineWidth(0.6);
            doc.line(x, y + height / 2, x + width, y + height / 2);
          }
        }
      },
    });
  });

  doc.save(`លទ្ធផលប្រឡងទាំងអស់_${schoolInfo.examYear}.pdf`);
}
