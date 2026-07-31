'use client';

import { useState, useRef, useCallback } from 'react';
import { useExamStore } from '@/store/examStore';
import { parseExcelFile } from '@/lib/excelUtils';
import { EXAM_TYPE_LABELS, EXAM_TYPE_COLORS } from '@/config/examConfig';
import { ExamType } from '@/types';
import {
  UserPlus, Trash2, Search,
  Users, FileSpreadsheet, CheckCircle, AlertCircle, X,
} from 'lucide-react';

const EXAM_TYPES: ExamType[] = ['grade9', 'grade12_science', 'grade12_social'];

export default function StudentsPage() {
  const {
    students,
    selectedExamType,
    setSelectedExamType,
    importStudents,
    deleteStudent,
    addStudent,
    getRooms,
    clearStudents,
  } = useExamStore();

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; rooms: number; errors: string[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', examNumber: '', gender: 'male' as 'male' | 'female', room: '' });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rooms = getRooms(selectedExamType);
  const filtered = students
    .filter((s) => s.examType === selectedExamType)
    .filter((s) => (filterRoom === 'all' ? true : s.room === filterRoom))
    .filter(
      (s) =>
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.examNumber.includes(searchQuery)
    );

  const colors = EXAM_TYPE_COLORS[selectedExamType];

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const result = await parseExcelFile(file, selectedExamType);
    if (result.success) {
      importStudents(result.students);
      setImportResult({
        count: result.students.length,
        rooms: result.rooms.length,
        errors: result.errors,
      });
    } else {
      setImportResult({ count: 0, rooms: 0, errors: result.errors });
    }
    setImporting(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.xlsx') || file?.name.endsWith('.xls')) {
      handleFileUpload(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamType]);

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.room) return;
    addStudent({
      ...newStudent,
      examType: selectedExamType,
      scores: {},
      status: 'pending',
    });
    setNewStudent({ name: '', examNumber: '', gender: 'male', room: '' });
    setShowAddForm(false);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            គ្រប់គ្រង<span className="gradient-text">សិស្ស</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Import ឬ បន្ថែម/លុបសិស្ស
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(79,70,229,0.3))',
              border: '1px solid rgba(59,130,246,0.4)',
              color: '#60a5fa',
            }}
          >
            <UserPlus size={16} />
            បន្ថែមសិស្ស
          </button>
          {students.filter((s) => s.examType === selectedExamType).length > 0 && (
            <button
              onClick={() => {
                if (confirm('តើអ្នកចង់លុបសិស្សទាំងអស់?')) {
                  clearStudents(selectedExamType);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
              }}
            >
              <Trash2 size={16} />
              លុបទាំងអស់
            </button>
          )}
        </div>
      </div>

      {/* Exam Type Selector */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {EXAM_TYPES.map((type) => {
          const c = EXAM_TYPE_COLORS[type];
          const count = students.filter((s) => s.examType === type).length;
          return (
            <button
              key={type}
              onClick={() => { setSelectedExamType(type); setFilterRoom('all'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={{
                background: selectedExamType === type ? c.bg : 'rgba(26,42,74,0.5)',
                border: `1px solid ${selectedExamType === type ? c.border : 'rgba(42,63,111,0.4)'}`,
                color: selectedExamType === type ? c.text : 'var(--text-secondary)',
              }}
            >
              {EXAM_TYPE_LABELS[type]}
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: selectedExamType === type ? c.border : 'rgba(42,63,111,0.5)', color: selectedExamType === type ? c.text : 'var(--text-muted)' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">បន្ថែមសិស្សថ្មី</h3>
            <button onClick={() => setShowAddForm(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                ឈ្មោះ *
              </label>
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full score-input"
                style={{ width: '100%', textAlign: 'left' }}
                placeholder="ឈ្មោះសិស្ស"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                លេខប្រឡង
              </label>
              <input
                type="text"
                value={newStudent.examNumber}
                onChange={(e) => setNewStudent({ ...newStudent, examNumber: e.target.value })}
                className="w-full score-input"
                style={{ width: '100%', textAlign: 'left' }}
                placeholder="xxxxx"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                ភេទ
              </label>
              <select
                value={newStudent.gender}
                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'male' | 'female' })}
                className="w-full score-input"
                style={{ width: '100%', textAlign: 'left' }}
              >
                <option value="male">ប្រុស</option>
                <option value="female">ស្រី</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                បន្ទប់ *
              </label>
              <input
                type="text"
                value={newStudent.room}
                onChange={(e) => setNewStudent({ ...newStudent, room: e.target.value })}
                className="w-full score-input"
                style={{ width: '100%', textAlign: 'left' }}
                placeholder="01"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddStudent}
              className="px-6 py-2 rounded-xl font-medium text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
            >
              បន្ថែម
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 rounded-xl font-medium text-sm transition-all"
              style={{ background: 'rgba(42,63,111,0.3)', color: 'var(--text-secondary)' }}
            >
              បោះបង់
            </button>
          </div>
        </div>
      )}

      {/* Import Area */}
      <div
        className={`glass-card p-8 mb-6 border-dashed text-center cursor-pointer transition-all duration-200 ${dragOver ? 'scale-105' : ''}`}
        style={{
          borderColor: dragOver ? colors.border : 'rgba(42,63,111,0.5)',
          background: dragOver ? colors.bg : undefined,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
        {importing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" />
            <p className="text-white font-medium">កំពុង import...</p>
          </div>
        ) : (
          <>
            <FileSpreadsheet size={40} className="mx-auto mb-3" style={{ color: colors.text }} />
            <p className="text-white font-semibold mb-1">
              ទាញ & ទម្លាក់ឯកសារ Excel នៅទីនេះ
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ឬចុចដើម្បីជ្រើសរើស (.xlsx, .xls) — ត្រឹមត្រូវទៅនឹង {EXAM_TYPE_LABELS[selectedExamType]}
            </p>
          </>
        )}
      </div>

      {/* Import Result */}
      {importResult && (
        <div
          className="glass-card p-4 mb-6 flex items-center gap-4"
          style={{
            borderColor: importResult.errors.length === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
            background: importResult.errors.length === 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
          }}
        >
          {importResult.errors.length === 0 ? (
            <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
          )}
          <div>
            <p className="font-semibold text-white">
              {importResult.count > 0
                ? `Import ជោគជ័យ! បន្ថែម ${importResult.count} នាក់ ក្នុង ${importResult.rooms} បន្ទប់`
                : 'Import បរាជ័យ'}
            </p>
            {importResult.errors.map((err, i) => (
              <p key={i} className="text-sm" style={{ color: '#f87171' }}>{err}</p>
            ))}
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="ml-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ ឬ លេខប្រឡង..."
            className="score-input pl-9"
            style={{ width: '100%', textAlign: 'left' }}
          />
        </div>
        <div className="relative">
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="score-input pl-3 pr-8"
            style={{ textAlign: 'left', minWidth: '160px' }}
          >
            <option value="all">ទាំងអស់ ({students.filter(s => s.examType === selectedExamType).length} នាក់)</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>
                បន្ទប់ {r.name} ({r.studentCount} នាក់)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(42,63,111,0.4)' }}>
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: colors.text }} />
            <span className="font-semibold text-white">
              {filtered.length} នាក់
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="exam-table">
              <thead>
                <tr>
                  <th>ល.រ</th>
                  <th>លេខប្រឡង</th>
                  <th style={{ textAlign: 'left', paddingLeft: '16px' }}>ឈ្មោះ</th>
                  <th>ភេទ</th>
                  <th>បន្ទប់</th>
                  <th>ស្ថានភាព</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, index) => (
                  <tr key={student.id} className={student.status === 'fail' ? 'failed' : ''}>
                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td>
                      <span className="font-mono text-sm" style={{ color: '#93c5fd' }}>
                        {student.examNumber || '-'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                      <span className="font-medium text-white">{student.name}</span>
                    </td>
                    <td>
                      <span style={{ color: student.gender === 'female' ? '#f9a8d4' : '#93c5fd', fontSize: '0.8rem' }}>
                        {student.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        បន្ទប់ {student.room}
                      </span>
                    </td>
                    <td>
                      {student.status === 'pass' && <span className="badge-pass">ជាប់</span>}
                      {student.status === 'fail' && <span className="badge-fail">ធ្លាក់</span>}
                      {student.status === 'pending' && (
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>
                          មិនទាន់
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          if (confirm(`លុប ${student.name}?`)) deleteStudent(student.id);
                        }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <Users size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-white font-medium mb-1">គ្មានសិស្ស</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Import ឯកសារ Excel ឬ បន្ថែមសិស្សសម្រាប់ {EXAM_TYPE_LABELS[selectedExamType]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
