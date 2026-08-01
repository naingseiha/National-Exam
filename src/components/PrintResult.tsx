'use client';

import React, { useMemo } from 'react';
import { Student, ExamConfig, SchoolInfo } from '@/types';
import { getStudentSeqNo, toKhmerNum, getSubjectGradeLetter, getOverallGradeLetter } from '@/lib/calculations';

interface PrintResultProps {
  students: Student[];
  config: ExamConfig;
  schoolInfo: SchoolInfo;
  room?: string;
  totalMale?: number;
  totalFemale?: number;
  allStudents: Student[];
  isPreview?: boolean;
  onClosePreview?: () => void;
}

export default function PrintResult({ students, config, schoolInfo, totalFemale, allStudents, isPreview, onClosePreview }: PrintResultProps) {
  const subjects = config?.subjects || [];

  // Split students into chunks to handle page breaks for A4 if needed
  const ROWS_PER_PAGE = 35;
  const pages = useMemo(() => {
    const p = [];
    for (let i = 0; i < students.length; i += ROWS_PER_PAGE) {
      p.push(students.slice(i, i + ROWS_PER_PAGE));
    }
    return p;
  }, [students]);

  const totalStr = toKhmerNum(students.length);
  const femaleStr = toKhmerNum(totalFemale || students.filter(s => s.gender === 'female').length);

  const content = pages.map((pageStudents, pageIdx) => (
    <div key={pageIdx} className="print-page">
      {/* Header */}
      <div className="print-header">
        <div className="print-header-center top-title">
          ព្រះរាជាណាចក្រកម្ពុជា<br/>
          ជាតិ សាសនា ព្រះមហាក្សត្រ<br/>
          <span className="print-header-symbol">3</span>
        </div>
        
        <div className="print-header-row">
          <div className="print-header-left">
            មន្ទីរអប់រំ យុវជន និង កីឡា {schoolInfo.province || 'ខេត្ត'}<br/>
            <b>{schoolInfo.name || 'វិទ្យាល័យ'}</b>
          </div>
          <div className="print-header-right">
            ឯកទេស {config.name.includes('សង្គម') ? 'វិទ្យាសាស្ត្រសង្គម' : config.name.includes('វិទ្យាសាស្ត្រ') ? 'វិទ្យាសាស្ត្រ' : config.name}<br/>
            សិស្សសរុប{totalStr}នាក់ ស្រី {femaleStr}នាក់
          </div>
        </div>

        <div className="print-header-center main-title">
          <b>លទ្ធផលប្រឡងសាកល្បងបញ្ចប់មធ្យមសិក្សាទុតិយភូមិ</b><br/>
          {schoolInfo.examSession || 'សម័យប្រឡង៖ ...'}
        </div>
      </div>

      {/* Table */}
      <table className="print-table">
        <thead>
          {/* Row 1 */}
          <tr>
            <th rowSpan={3} className="col-no">ល.រ</th>
            <th rowSpan={3} className="col-name">គោត្តនាមនិងនាម</th>
            <th rowSpan={3} className="col-gender">ភេទ</th>

            {subjects.map((sub) => (
              <th key={sub.id} colSpan={2}>{sub.name}</th>
            ))}
            <th colSpan={3} className="col-total-header">ពិន្ទុ</th>
          </tr>
          {/* Row 2 */}
          <tr>
            {subjects.map((sub) => (
              <React.Fragment key={`${sub.id}-headers`}>
                <th>ពិន្ទុ</th>
                <th>និទ្ទេស</th>
              </React.Fragment>
            ))}
            <th rowSpan={2}>សរុប</th>
            <th rowSpan={2}>និទ្ទេស</th>
          </tr>
          {/* Row 3 */}
          <tr className="bg-gray">
            {subjects.map((sub) => (
              <th key={`${sub.id}-max`} colSpan={2} className="col-max">
                {sub.id === 'foreign' ? `(${sub.maxScore}-${sub.maxScore/2})` : sub.maxScore}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageStudents.map((student) => {
            const isFail = student.status === 'fail';
            const scores = student.scores || {};
            
            return (
              <tr key={student.id} className={isFail ? 'failed-row' : ''}>
                <td className="text-center">{toKhmerNum(getStudentSeqNo(student, allStudents))}</td>
                <td className="text-left font-bold px-1 name-cell">
                  {isFail ? (
                    <div className="strikethrough-red">{student.name}</div>
                  ) : (
                    student.name
                  )}
                </td>
                <td className="text-center">
                  {student.gender === 'female' ? 'ស' : 'ប'}
                </td>

                
                {subjects.map((sub) => {
                  const score = scores[sub.id];
                  const grade = getSubjectGradeLetter(score, sub.maxScore);
                  return (
                    <React.Fragment key={sub.id}>
                      <td className="text-center font-bold">
                        {score !== null && score !== undefined ? score : '-'}
                      </td>
                      <td className="text-center font-bold">
                        {grade}
                      </td>
                    </React.Fragment>
                  );
                })}
                
                <td className="text-center font-bold total-score">
                  {student.totalScore ?? '-'}
                </td>
                <td className="text-center font-bold">
                  {getOverallGradeLetter(student)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {pageIdx === pages.length - 1 && (
        <div className="print-footer" style={{ marginTop: '20px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            បានបញ្ឈប់បញ្ជីត្រឹមចំនួន <b>{totalStr}</b>នាក់ ក្នុងនោះស្រីចំនួន <b>{femaleStr}</b>នាក់
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <span style={{ minWidth: '130px' }}>បូកស្រង់ដោយ</span>
                <span style={{ borderBottom: '1.5px dotted black', width: '150px', height: '14px' }}></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <span style={{ minWidth: '130px' }}>ចុះចំណាត់ថ្នាក់ដោយ</span>
                <span style={{ borderBottom: '1.5px dotted black', width: '150px', height: '14px' }}></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <span style={{ minWidth: '130px' }}>ត្រួតពិនិត្យដោយ</span>
                <span style={{ borderBottom: '1.5px dotted black', width: '150px', height: '14px' }}></span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center', lineHeight: '1.6' }}>
              <div>ថ្ងៃព្រហស្បតិ៍ ១រោច ខែទុតិយាសាឍ ឆ្នាំរោង ឆស័ក ព.ស ២៥៦៨</div>
              <div>{schoolInfo.name || 'វិទ្យាល័យ'} ថ្ងៃទី៣០ ខែកក្កដា ឆ្នាំ២០២៦</div>
              <div style={{ fontFamily: "'Moul', 'Khmer OS Muol Light', serif", marginTop: '10px' }}>ប្រធានមណ្ឌល</div>
            </div>
          </div>
        </div>
      )}
    </div>
  ));

  if (isPreview) {
    return (
      <div className="print-preview-overlay">
        <div className="print-preview-toolbar">
          <button 
            onClick={onClosePreview} 
            className="flex items-center gap-2 px-4 py-2 rounded font-medium hover:bg-gray-700 transition-colors"
            style={{ color: 'white', background: '#4b5563' }}
          >
            ត្រឡប់ក្រោយ
          </button>
          <div style={{ color: 'white', fontWeight: 'bold' }}>មើលទម្រង់បោះពុម្ព (Print Preview)</div>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-6 py-2 rounded font-bold hover:bg-blue-600 transition-colors"
            style={{ color: 'white', background: '#3b82f6' }}
          >
            បោះពុម្ព
          </button>
        </div>
        <div className="print-preview-content">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="print-only-hidden">
      {content}
    </div>
  );
}
