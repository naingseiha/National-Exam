import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, ExamType, SchoolInfo } from '@/types';
import { EXAM_CONFIGS } from '@/config/examConfig';
import { getSubjectGradeLetter, getOverallGradeLetter, getStudentSeqNo } from '@/lib/calculations';

/**
 * Generate Ministry MoEYS Official PDF report matching the user's sample format exactly
 */
export async function exportToPDF(
  students: Student[],
  examType: ExamType,
  roomName: string,
  schoolInfo: SchoolInfo
) {
  const config = EXAM_CONFIGS[examType];
  const subjects = config.subjects;

  const totalStudents = students.length;
  const femaleStudents = students.filter((s) => s.gender === 'female').length;

  const examStreamLabel =
    examType === 'grade12_science'
      ? 'ឯកទេស វិទ្យាសាស្ត្រ'
      : examType === 'grade12_social'
      ? 'ឯកទេស វិទ្យាសាស្ត្រសង្គម'
      : 'ថ្នាក់ទី ៩';

  // Create temporary container for HTML-to-Image rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '1120px'; // A4 Landscape width ratio
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = "'Noto Sans Khmer', 'Khmer OS Battambang', sans-serif";
  container.style.padding = '24px';
  container.style.boxSizing = 'border-box';

  const deptName = schoolInfo.department || 'មន្ទីរអប់រំ យុវជន និងកីឡា';
  const provName = schoolInfo.province || 'ខេត្តសៀមរាប';
  const schoolName = schoolInfo.name || 'វិទ្យាល័យ ហ៊ុន សែន ស្វាយធំ';
  const sessionText = schoolInfo.examSession || `សម័យប្រឡង៖ ២២ កក្កដា ២០២៦`;

  // Calculate total max score
  const totalMaxScore = subjects.reduce((sum, s) => sum + s.maxScore, 0);

  // Generate rows HTML
  const rowsHtml = students
    .map((student) => {
      const isFail = student.status === 'fail';
      const genderSymbol = student.gender === 'female' ? 'ស' : 'ប';
      const overallGrade = getOverallGradeLetter(student);
      const seqNo = getStudentSeqNo(student, students);

      const subjectCells = subjects
        .map((sub) => {
          const scores = student.scores || {};
          const score = scores[sub.id];
          const grade = getSubjectGradeLetter(score, sub.maxScore);
          return `
            <td style="border: 1px solid #000; text-align: center; padding: 4px 2px; font-size: 11px; font-weight: bold;">
              ${score !== null && score !== undefined ? score : '-'}
            </td>
            <td style="border: 1px solid #000; text-align: center; padding: 4px 2px; font-size: 11px; font-weight: bold; ${
              grade === 'F' ? 'color: #d32f2f;' : ''
            }">
              ${grade}
            </td>
          `;
        })
        .join('');

      return `
        <tr style="position: relative;">
          <td style="border: 1px solid #000; text-align: center; padding: 4px 2px; font-size: 11px; position: relative;">
            ${
              isFail
                ? `<span style="border: 1.5px solid #d32f2f; border-radius: 50%; padding: 1px 4px; color: #d32f2f; font-weight: bold; display: inline-block;">${
                    seqNo
                  }</span>`
                : `${seqNo}`
            }
          </td>
          <td style="border: 1px solid #000; text-align: left; padding: 4px 6px; font-size: 11px; font-weight: bold; white-space: nowrap; ${
            isFail ? 'text-decoration: line-through; text-decoration-color: #d32f2f; color: #d32f2f;' : ''
          }">
            ${student.name}
          </td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px 2px; font-size: 11px;">
            ${genderSymbol}
          </td>

          ${subjectCells}
          <td style="border: 1px solid #000; text-align: center; padding: 4px 2px; font-size: 11px; font-weight: bold; ${
            isFail ? 'color: #d32f2f;' : ''
          }">
            ${student.totalScore ?? '-'}
          </td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px 2px; font-size: 11px; font-weight: bold; ${
            isFail ? 'color: #d32f2f;' : ''
          }">
            ${overallGrade}
          </td>

        </tr>
      `;
    })
    .join('');

  const subjectHeaderCols = subjects
    .map(
      (sub) => `
      <th colspan="2" style="border: 1px solid #000; text-align: center; padding: 4px; font-size: 11px; font-weight: bold;">
        ${sub.name}
      </th>
    `
    )
    .join('');

  const subjectSubHeaderCols = subjects
    .map(
      () => `
      <th style="border: 1px solid #000; text-align: center; padding: 2px; font-size: 9px;">ពិន្ទុ</th>
      <th style="border: 1px solid #000; text-align: center; padding: 2px; font-size: 9px;">និទ្ទេស</th>
    `
    )
    .join('');

  const subjectMaxHeaderCols = subjects
    .map(
      (sub) => `
      <th colspan="2" style="border: 1px solid #000; text-align: center; padding: 2px; font-size: 10px; font-weight: bold; background-color: #f3f4f6;">
        ${sub.maxScore}
      </th>
    `
    )
    .join('');

  container.innerHTML = `
    <div style="width: 100%; background: #ffffff; color: #000000;">
      <!-- Top Header Row -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <!-- Left: Dept & School -->
        <div style="text-align: left; font-size: 12px; font-weight: bold; line-height: 1.5;">
          <div>${deptName} ${provName}</div>
          <div>${schoolName}</div>
        </div>

        <!-- Center: Kingdom Header -->
        <div style="text-align: center; line-height: 1.4;">
          <div style="font-size: 14px; font-weight: bold;">ព្រះរាជាណាចក្រកម្ពុជា</div>
          <div style="font-size: 12px; font-weight: bold;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
        </div>

        <!-- Right: Stream & Counts -->
        <div style="text-align: right; font-size: 12px; font-weight: bold; line-height: 1.5;">
          <div>${examStreamLabel}</div>
          <div>សិស្សសរុប ${totalStudents}នាក់ &nbsp; ស្រី ${femaleStudents}នាក់</div>
        </div>
      </div>

      <!-- Document Main Title -->
      <div style="text-align: center; margin-bottom: 14px;">
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">
          លទ្ធផលប្រឡងសាកល្បងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ
        </div>
        <div style="font-size: 12px; font-weight: bold;">
          ${sessionText}
        </div>
      </div>

      <!-- Main Results Table -->
      <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; font-family: inherit;">
        <thead>
          <tr style="background-color: #ffffff;">
            <th rowspan="2" style="border: 1px solid #000; width: 35px; text-align: center; font-size: 11px; font-weight: bold;">ល.រ</th>
            <th rowspan="2" style="border: 1px solid #000; text-align: center; font-size: 11px; font-weight: bold; min-width: 140px;">គោត្តនាម និងនាមសិស្ស</th>
            <th rowspan="2" style="border: 1px solid #000; width: 30px; text-align: center; font-size: 11px; font-weight: bold;">ភេទ</th>

            ${subjectHeaderCols}
            <th rowspan="2" style="border: 1px solid #000; width: 45px; text-align: center; font-size: 11px; font-weight: bold;">ពិន្ទុសរុប</th>
            <th rowspan="2" style="border: 1px solid #000; width: 45px; text-align: center; font-size: 11px; font-weight: bold;">និទ្ទេសសរុប</th>

          </tr>
          <tr style="background-color: #ffffff;">
            ${subjectSubHeaderCols}
          </tr>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #000; text-align: center; font-size: 9px; font-weight: bold;">No</th>
            <th style="border: 1px solid #000; text-align: center; font-size: 9px; font-weight: bold;">ឈ្មោះសិស្ស</th>
            <th style="border: 1px solid #000;"></th>
            ${subjectMaxHeaderCols}
            <th style="border: 1px solid #000; text-align: center; font-size: 10px; font-weight: bold; background-color: #f3f4f6;">${totalMaxScore}</th>
            <th style="border: 1px solid #000; background-color: #f3f4f6;"></th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution DPI
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 16; // 8mm margin left/right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 8; // Top margin

    pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Multi-page handling if table is long
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 8;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`របាយការណ៍លទ្ធផល_បន្ទប់${roomName}_${schoolInfo.examYear || '2026'}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    return false;
  }
}

/**
 * Export all rooms to PDF (one per page or combined)
 */
export async function exportAllToPDF(
  students: Student[],
  examType: ExamType,
  schoolInfo: SchoolInfo
) {
  return exportToPDF(students, examType, 'ទាំងអស់', schoolInfo);
}
