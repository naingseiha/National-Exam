'use client';

import { useState, useMemo } from 'react';
import { useExamStore } from '@/store/examStore';
import { calculateStats, getStudentSeqNo } from '@/lib/calculations';
import { EXAM_CONFIGS, EXAM_TYPE_LABELS, EXAM_TYPE_COLORS } from '@/config/examConfig';
import { ExamType } from '@/types';
import { FileText, Search } from 'lucide-react';

const EXAM_TYPES: ExamType[] = ['grade9', 'grade12_science', 'grade12_social'];

type StatusFilter = 'all' | 'pass' | 'fail' | 'pending';

export default function ResultsPage() {
  const {
    students,
    selectedExamType,
    setSelectedExamType,
    selectedRoom,
    setSelectedRoom,
    getRooms,
    examConfigs,
  } = useExamStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const rooms = getRooms(selectedExamType);
  const activeRoom = selectedRoom && rooms.find((r) => r.name === selectedRoom)
    ? selectedRoom
    : 'all';

  const config = examConfigs?.[selectedExamType] || EXAM_CONFIGS[selectedExamType] || EXAM_CONFIGS.grade12_science;
  const subjects = config?.subjects || [];
  const colors = EXAM_TYPE_COLORS[selectedExamType] || EXAM_TYPE_COLORS.grade12_science;

  const displayStudents = useMemo(() => {
    let filtered = students.filter((s) => s.examType === selectedExamType);
    if (activeRoom !== 'all') filtered = filtered.filter((s) => s.room === activeRoom);
    if (statusFilter !== 'all') filtered = filtered.filter((s) => s.status === statusFilter);
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.examNumber.includes(searchQuery)
      );
    }
    return filtered.sort((a, b) => {
      const numA = parseInt((a.examNumber || '').replace(/\D/g, '')) || 0;
      const numB = parseInt((b.examNumber || '').replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [students, selectedExamType, activeRoom, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const base = students.filter(
      (s) => s.examType === selectedExamType && (activeRoom === 'all' || s.room === activeRoom)
    );
    return calculateStats(base);
  }, [students, selectedExamType, activeRoom]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            បញ្ជី<span className="gradient-text">លទ្ធផល</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            លទ្ធផលប្រឡង — ខ្សែក្រហមសម្រាប់សិស្សធ្លាក់
          </p>
        </div>
      </div>

      {/* Exam Type */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {EXAM_TYPES.map((type) => {
          const c = EXAM_TYPE_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => { setSelectedExamType(type); setSelectedRoom(null); }}
              className="px-4 py-2 rounded-xl font-medium text-sm transition-all"
              style={{
                background: selectedExamType === type ? c.bg : 'rgba(26,42,74,0.5)',
                border: `1px solid ${selectedExamType === type ? c.border : 'rgba(42,63,111,0.4)'}`,
                color: selectedExamType === type ? c.text : 'var(--text-secondary)',
              }}
            >
              {EXAM_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'ចំនួនសរុប', value: stats.total, color: '#3b82f6' },
          { label: 'ជាប់', value: stats.passed, color: '#10b981' },
          { label: 'ធ្លាក់', value: stats.failed, color: '#ef4444' },
          { label: 'អត្រាជាប់', value: `${stats.passRate}%`, color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Room filter */}
          <select
            value={activeRoom}
            onChange={(e) => setSelectedRoom(e.target.value === 'all' ? null : e.target.value)}
            className="score-input"
            style={{ textAlign: 'left', minWidth: '160px' }}
          >
            <option value="all">ទាំងអស់</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>បន្ទប់ {r.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex gap-2">
            {([['all', 'ទាំងអស់'], ['pass', 'ជាប់'], ['fail', 'ធ្លាក់'], ['pending', 'មិនទាន់']] as [StatusFilter, string][]).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background:
                    statusFilter === value
                      ? value === 'pass' ? 'rgba(16,185,129,0.2)' : value === 'fail' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'
                      : 'rgba(42,63,111,0.3)',
                  color:
                    statusFilter === value
                      ? value === 'pass' ? '#34d399' : value === 'fail' ? '#f87171' : '#60a5fa'
                      : 'var(--text-secondary)',
                  border: `1px solid ${
                    statusFilter === value
                      ? value === 'pass' ? 'rgba(16,185,129,0.4)' : value === 'fail' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'
                      : 'rgba(42,63,111,0.3)'
                  }`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរក..."
              className="score-input pl-9"
              style={{ width: '100%', textAlign: 'left' }}
            />
          </div>
        </div>
      </div>

      {/* Results table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(42,63,111,0.4)' }}>
          <FileText size={18} style={{ color: colors.text }} />
          <span className="font-semibold text-white">
            {displayStudents.length} នាក់
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            — {EXAM_TYPE_LABELS[selectedExamType]} {activeRoom !== 'all' ? `| បន្ទប់ ${activeRoom}` : ''}
          </span>
        </div>

        {displayStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>ល.រ</th>
                  <th style={{ textAlign: 'left', paddingLeft: '16px' }}>ឈ្មោះ</th>
                  <th>ភេទ</th>
                  <th>បន្ទប់</th>
                  {subjects.map((sub) => (
                    <th key={sub.id}>
                      <div>{sub.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>/{sub.maxScore}</div>
                    </th>
                  ))}
                  <th>ពិន្ទុ</th>
                  <th>មធ្យម</th>
                  <th>លទ្ធផល</th>
                  <th>ចំណាត់ថ្នាក់</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student) => {
                  const isFail = student.status === 'fail';
                  return (
                    <tr
                      key={student.id}
                      className={isFail ? 'failed' : ''}
                      style={{
                        background: isFail ? 'rgba(239,68,68,0.04)' : undefined,
                      }}
                    >
                      <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{getStudentSeqNo(student, students)}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                        <span
                          className="font-semibold"
                          style={{
                            color: isFail ? '#fca5a5' : 'white',
                            textDecoration: isFail ? 'line-through' : 'none',
                            textDecorationColor: '#ef4444',
                          }}
                        >
                          {student.name}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: student.gender === 'female' ? '#f9a8d4' : '#93c5fd' }}>
                        {student.gender === 'female' ? 'ស្រី' : 'ប'}
                      </td>
                      <td>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {student.room}
                        </span>
                      </td>
                      {subjects.map((sub) => {
                        const scores = student.scores || {};
                        const score = scores[sub.id];
                        const isPoor = score !== null && score !== undefined && score < sub.maxScore * 0.25;
                        return (
                          <td
                            key={sub.id}
                            className="font-mono"
                            style={{
                              color: score === null || score === undefined
                                ? 'var(--text-muted)'
                                : isPoor ? '#fca5a5' : 'var(--text-primary)',
                            }}
                          >
                            {score !== null && score !== undefined ? score : '-'}
                          </td>
                        );
                      })}
                      <td className="font-mono font-bold" style={{ color: isFail ? '#fca5a5' : '#60a5fa' }}>
                        {student.totalScore ?? '-'}
                      </td>
                      <td
                        className="font-mono font-bold"
                        style={{ color: isFail ? '#f87171' : '#34d399' }}
                      >
                        {student.average ?? '-'}
                      </td>
                      <td>
                        {student.status === 'pass' && <span className="badge-pass">ជាប់</span>}
                        {student.status === 'fail' && <span className="badge-fail">ធ្លាក់</span>}
                        {student.status === 'pending' && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td>
                        {student.rank ? (
                          <span
                            className="font-bold"
                            style={{ color: student.rank <= 3 ? '#f59e0b' : 'var(--text-secondary)' }}
                          >
                            {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : `#${student.rank}`}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-white font-medium mb-1">គ្មានទិន្នន័យ</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              ជ្រើសសំណួររបស់អ្នក ឬ បន្ថែមទិន្នន័យ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
