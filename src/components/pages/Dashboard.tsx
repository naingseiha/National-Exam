'use client';

import { useMemo, useState, useEffect } from 'react';
import { useExamStore } from '@/store/examStore';
import { calculateStats } from '@/lib/calculations';
import { EXAM_TYPE_LABELS, EXAM_TYPE_COLORS } from '@/config/examConfig';
import { ExamType } from '@/types';
import {
  Users, CheckCircle, XCircle, TrendingUp,
  GraduationCap, BookOpen, Award,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const EXAM_TYPES: ExamType[] = ['grade9', 'grade12_science', 'grade12_social'];

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const { students, selectedExamType, setSelectedExamType, getRooms } = useExamStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const overallStats = useMemo(() => calculateStats(students), [students]);

  const examTypeStats = useMemo(() =>
    EXAM_TYPES.map((type) => {
      const typeStudents = students.filter((s) => s.examType === type);
      return { type, ...calculateStats(typeStudents) };
    }),
    [students]
  );

  const selectedStats = useMemo(() => {
    const typeStudents = students.filter((s) => s.examType === selectedExamType);
    return calculateStats(typeStudents);
  }, [students, selectedExamType]);

  const rooms = getRooms(selectedExamType);

  const pieData = [
    { name: 'ជាប់', value: selectedStats.passed, color: '#10b981' },
    { name: 'ធ្លាក់', value: selectedStats.failed, color: '#ef4444' },
    { name: 'អវត្ដមាន', value: selectedStats.absent, color: '#6b7280' },
  ].filter((d) => d.value > 0);

  const roomBarData = rooms.slice(0, 15).map((room) => {
    const roomStudents = students.filter(
      (s) => s.examType === selectedExamType && s.room === room.name
    );
    const passed = roomStudents.filter((s) => s.status === 'pass').length;
    const failed = roomStudents.filter((s) => s.status === 'fail').length;
    return { name: `ប${room.name}`, ជាប់: passed, ធ្លាក់: failed };
  });

  if (!isMounted) {
    return <div className="glass-card p-12 text-center" style={{ color: 'var(--text-primary)' }}>កំពុងផ្ទុកទិន្នន័យ...</div>;
  }

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          ផ្ទាំង<span className="gradient-text">គ្រប់គ្រង</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          ទិដ្ឋភាពរួមនៃការប្រឡងថ្នាក់ជាតិ ឆ្នាំ ២០២៦
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'សិស្សទាំងអស់',
            value: overallStats.total,
            icon: Users,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.1)',
          },
          {
            label: 'ជាប់',
            value: overallStats.passed,
            icon: CheckCircle,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)',
          },
          {
            label: 'ធ្លាក់',
            value: overallStats.failed,
            icon: XCircle,
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.1)',
          },
          {
            label: 'អត្រាជាប់',
            value: `${overallStats.passRate}%`,
            icon: TrendingUp,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-card p-5 stat-card hover-glow cursor-default"
              style={{ transition: 'transform 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: stat.bg }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span
                  className="text-3xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Exam Type Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {examTypeStats.map(({ type, total, passed, failed, passRate }) => {
          const colors = EXAM_TYPE_COLORS[type];
          const isSelected = selectedExamType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedExamType(type)}
              className="glass-card p-5 text-left transition-all duration-200 w-full"
              style={{
                border: isSelected
                  ? `2px solid ${colors.border}`
                  : 'var(--glass-border)',
                background: isSelected ? colors.bg : undefined,
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <GraduationCap size={18} style={{ color: colors.text }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{EXAM_TYPE_LABELS[type]}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {total} នាក់
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{passed}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ជាប់</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{failed}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ធ្លាក់</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold" style={{ color: colors.text }}>{passRate}%</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>អត្រាជាប់</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--border-color)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${passRate}%`, background: colors.text }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts */}
      {selectedStats.total > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              ចំណែក {EXAM_TYPE_LABELS[selectedExamType]}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              ជាប់ vs ធ្លាក់
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: 'var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Legend formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart by Room */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>ជាប់/ធ្លាក់តាមបន្ទប់</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {EXAM_TYPE_LABELS[selectedExamType]}
            </p>
            <div className="h-56">
              {roomBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomBarData} barSize={14}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: 'var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Legend formatter={(v) => <span style={{ color: '#94a3b8' }}>{v}</span>} />
                    <Bar dataKey="ជាប់" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ធ្លាក់" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p style={{ color: 'var(--text-muted)' }}>មិនមានទិន្នន័យ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="glass-card p-12 text-center mb-8"
          style={{ borderStyle: 'dashed' }}
        >
          <BookOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>មិនទាន់មានទិន្នន័យ</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            សូមចូលទៅ <strong style={{ color: '#60a5fa' }}>គ្រប់គ្រងសិស្ស</strong> ដើម្បី import ឬ បន្ថែមសិស្ស
          </p>
        </div>
      )}

      {/* Room Summary Table */}
      {rooms.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award size={20} style={{ color: '#f59e0b' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              សង្ខេបតាមបន្ទប់ — {EXAM_TYPE_LABELS[selectedExamType]}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>បន្ទប់</th>
                  <th>ចំនួន</th>
                  <th>ជាប់</th>
                  <th>ធ្លាក់</th>
                  <th>អត្រាជាប់</th>
                  <th>ពិន្ទុខ្ពស់</th>
                  <th>ពិន្ទុទាប</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const rs = students.filter(
                    (s) => s.examType === selectedExamType && s.room === room.name
                  );
                  const stats = calculateStats(rs);
                  return (
                    <tr key={room.id}>
                      <td className="font-semibold" style={{ color: '#60a5fa' }}>
                        បន្ទប់ {room.name}
                      </td>
                      <td>{stats.total}</td>
                      <td style={{ color: '#34d399' }}>{stats.passed}</td>
                      <td style={{ color: '#f87171' }}>{stats.failed}</td>
                      <td>
                        <span className={stats.passRate >= 80 ? 'badge-pass' : 'badge-fail'}>
                          {stats.passRate}%
                        </span>
                      </td>
                      <td>{stats.highestScore > 0 ? stats.highestScore : '-'}</td>
                      <td>{stats.lowestScore > 0 ? stats.lowestScore : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
