'use client';

import { useState } from 'react';
import { useExamStore } from '@/store/examStore';
import { exportToExcel, exportAllToExcel } from '@/lib/excelUtils';
import { exportToPDF, exportAllToPDF } from '@/lib/pdfUtils';
import { EXAM_TYPE_LABELS, EXAM_TYPE_COLORS } from '@/config/examConfig';
import { ExamType } from '@/types';
import { Download, FileSpreadsheet, FileText, Layers, File } from 'lucide-react';

const EXAM_TYPES: ExamType[] = ['grade9', 'grade12_science', 'grade12_social'];

export default function ExportPage() {
  const {
    students,
    selectedExamType,
    setSelectedExamType,
    getRooms,
    schoolInfo,
  } = useExamStore();

  const [exporting, setExporting] = useState<string | null>(null);

  const rooms = getRooms(selectedExamType);
  const examStudents = students.filter((s) => s.examType === selectedExamType);
  const colors = EXAM_TYPE_COLORS[selectedExamType];

  const handleExportRoomExcel = async (room: string) => {
    setExporting(`excel_${room}`);
    const roomStudents = examStudents.filter((s) => s.room === room);
    exportToExcel(roomStudents, selectedExamType, room, schoolInfo);
    setExporting(null);
  };

  const handleExportAllExcel = async () => {
    setExporting('excel_all');
    exportAllToExcel(examStudents, selectedExamType, schoolInfo);
    setExporting(null);
  };

  const handleExportRoomPDF = async (room: string) => {
    setExporting(`pdf_${room}`);
    const roomStudents = examStudents.filter((s) => s.room === room);
    await exportToPDF(roomStudents, selectedExamType, room, schoolInfo);
    setExporting(null);
  };

  const handleExportAllPDF = async () => {
    setExporting('pdf_all');
    await exportAllToPDF(examStudents, selectedExamType, schoolInfo);
    setExporting(null);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          នាំ<span className="gradient-text">ចេញ</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Export លទ្ធផលប្រឡងទៅ Excel ឬ PDF
        </p>
      </div>

      {/* Exam Type */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {EXAM_TYPES.map((type) => {
          const c = EXAM_TYPE_COLORS[type];
          const count = students.filter((s) => s.examType === type).length;
          return (
            <button
              key={type}
              onClick={() => setSelectedExamType(type)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{
                background: selectedExamType === type ? c.bg : 'rgba(26,42,74,0.5)',
                border: `1px solid ${selectedExamType === type ? c.border : 'rgba(42,63,111,0.4)'}`,
                color: selectedExamType === type ? c.text : 'var(--text-secondary)',
              }}
            >
              {EXAM_TYPE_LABELS[type]}
              <span
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {examStudents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Download size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xl font-semibold text-white mb-2">
            គ្មានសិស្សសម្រាប់ {EXAM_TYPE_LABELS[selectedExamType]}
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Import ឬ បន្ថែមសិស្ស និងបញ្ចូលពិន្ទុ ស្របនឹង Export
          </p>
        </div>
      ) : (
        <>
          {/* Export All Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Export All Excel */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <FileSpreadsheet size={28} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Export ទាំងអស់ → Excel</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {rooms.length} បន្ទប់ · {examStudents.length} នាក់ · format ស្អាត
                  </p>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                 នាំចេញបន្ទប់ទាំងអស់ក្នុង Worksheet ចុះឈ្មោះ ជាមួយ header ក្រសួង
              </p>
              <button
                onClick={handleExportAllExcel}
                disabled={!!exporting}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  opacity: exporting ? 0.7 : 1,
                }}
              >
                {exporting === 'excel_all' ? (
                  <><div className="spinner" style={{ width: '18px', height: '18px' }} /> កំពុង export...</>
                ) : (
                  <><Download size={16} /> Export Excel (ទាំងអស់)</>
                )}
              </button>
            </div>

            {/* Export All PDF */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <FileText size={28} style={{ color: '#f87171' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Export ទាំងអស់ → PDF</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {rooms.length} បន្ទប់ · {examStudents.length} នាក់ · A4 Landscape
                  </p>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                PDF ស្អាតជាមួយ header ក្រសួង + ខ្សែក្រហម
                <span style={{ color: '#f87171' }}> (ធ្លាក់)</span>
              </p>
              <button
                onClick={handleExportAllPDF}
                disabled={!!exporting}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                  opacity: exporting ? 0.7 : 1,
                }}
              >
                {exporting === 'pdf_all' ? (
                  <><div className="spinner" style={{ width: '18px', height: '18px' }} /> កំពុង export...</>
                ) : (
                  <><Download size={16} /> Export PDF (ទាំងអស់)</>
                )}
              </button>
            </div>
          </div>

          {/* Per-Room Export */}
          <div className="glass-card overflow-hidden">
            <div
              className="p-4 border-b flex items-center gap-3"
              style={{ borderColor: 'rgba(42,63,111,0.4)' }}
            >
              <Layers size={18} style={{ color: colors.text }} />
              <h3 className="font-bold text-white">Export តាមបន្ទប់ — {EXAM_TYPE_LABELS[selectedExamType]}</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {rooms.map((room) => {
                  const roomStudents = examStudents.filter((s) => s.room === room.name);
                  const passed = roomStudents.filter((s) => s.status === 'pass').length;
                  const failed = roomStudents.filter((s) => s.status === 'fail').length;
                  return (
                    <div
                      key={room.id}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: 'rgba(26,42,74,0.5)', border: '1px solid rgba(42,63,111,0.3)' }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">បន្ទប់ {room.name}</span>
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ background: colors.bg, color: colors.text }}
                          >
                            {room.studentCount} នាក់
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span style={{ color: '#34d399' }}>ជាប់: {passed}</span>
                          <span style={{ color: '#f87171' }}>ធ្លាក់: {failed}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExportRoomExcel(room.name)}
                          disabled={!!exporting}
                          title="Export Excel"
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: 'rgba(16,185,129,0.15)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            color: '#34d399',
                          }}
                        >
                          {exporting === `excel_${room.name}` ? (
                            <div className="spinner" style={{ width: '14px', height: '14px' }} />
                          ) : (
                            <FileSpreadsheet size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => handleExportRoomPDF(room.name)}
                          disabled={!!exporting}
                          title="Export PDF"
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171',
                          }}
                        >
                          {exporting === `pdf_${room.name}` ? (
                            <div className="spinner" style={{ width: '14px', height: '14px' }} />
                          ) : (
                            <File size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
