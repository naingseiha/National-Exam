'use client';

import { useState, useEffect, useCallback } from 'react';
import { useExamStore } from '@/store/examStore';
import { pushStudentsToFirebase, isFirebaseConfigured } from '@/lib/firebase';
import { EXAM_CONFIGS, EXAM_TYPE_LABELS, EXAM_TYPE_COLORS } from '@/config/examConfig';
import { getStudentSeqNo } from '@/lib/calculations';
import { ExamType } from '@/types';
import { ClipboardList, Save, CheckCircle, AlertCircle } from 'lucide-react';

const EXAM_TYPES: ExamType[] = ['grade9', 'grade12_science', 'grade12_social'];

export default function ScoresPage() {
  const {
    students,
    selectedExamType,
    setSelectedExamType,
    selectedRoom,
    setSelectedRoom,
    getRooms,
    getStudentsByRoom,
    saveScoresBatch,
    recalculateAll,
    examConfigs,
  } = useExamStore();

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [localScores, setLocalScores] = useState<Record<string, Record<string, string>>>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  const rooms = getRooms(selectedExamType);
  const activeRoom = selectedRoom && rooms.find((r) => r.name === selectedRoom)
    ? selectedRoom
    : rooms[0]?.name ?? null;

  const roomStudents = activeRoom
    ? getStudentsByRoom(selectedExamType, activeRoom)
    : [];

  const config = examConfigs?.[selectedExamType] || EXAM_CONFIGS[selectedExamType] || EXAM_CONFIGS.grade12_science;
  const subjects = config?.subjects || [];

  // Initialize local scores from store
  useEffect(() => {
    const init: Record<string, Record<string, string>> = {};
    roomStudents.forEach((s) => {
      init[s.id] = {};
      const scores = s.scores || {};
      subjects.forEach((sub) => {
        const val = scores[sub.id];
        init[s.id][sub.id] = val !== null && val !== undefined ? String(val) : '';
      });
    });
    setLocalScores(init);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom, selectedExamType, students.length]);

  const handleScoreChange = useCallback(
    (studentId: string, subjectId: string, value: string, maxScore: number) => {
      setLocalScores((prev) => ({
        ...prev,
        [studentId]: { ...(prev[studentId] || {}), [subjectId]: value },
      }));

      // Validate
      const num = parseFloat(value);
      const isValid = value === '' || (!isNaN(num) && num >= 0 && num <= maxScore);
      setErrors((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [subjectId]: isValid ? '' : `ពិន្ទុត្រូវ 0-${maxScore}`,
        },
      }));
    },
    []
  );

  const saveAllScores = async () => {
    setSaving(true);
    setSaveError(null);

    // Check for validation errors
    let hasError = false;
    Object.values(errors).forEach((studentErrors) => {
      Object.values(studentErrors).forEach((err) => {
        if (err) hasError = true;
      });
    });

    if (hasError) {
      setSaving(false);
      setSaveError('មានពិន្ទុមិនត្រឹមត្រូវ — សូមពិនិត្យម្ដងទៀត');
      return;
    }

    // Build batch update
    const batchUpdates: Record<string, Record<string, number | null>> = {};
    roomStudents.forEach((student) => {
      batchUpdates[student.id] = {};
      subjects.forEach((sub) => {
        const val = localScores[student.id]?.[sub.id];
        const parsed = val === '' || val === undefined ? null : parseFloat(val);
        batchUpdates[student.id][sub.id] = isNaN(parsed as number) ? null : parsed;
      });
    });

    // Apply to local store first (instant UI update)
    saveScoresBatch(batchUpdates);
    recalculateAll(); // Updates ranks in local store

    // Now push the final state to Firebase and wait for confirmation
    if (isFirebaseConfigured()) {
      // Get latest students from store after recalculate
      const latestStudents = useExamStore.getState().students;
      const success = await pushStudentsToFirebase(latestStudents);
      if (!success) {
        setSaveError('ជោគជ័យ (local) — Firebase sync failed! ពិន្ទុរក្សានៅ localStorage។');
        setSaving(false);
        setSavedMsg(true);
        setTimeout(() => { setSavedMsg(false); setSaveError(null); }, 5000);
        return;
      }
    }

    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const colors = EXAM_TYPE_COLORS[selectedExamType];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            បញ្ចូល<span className="gradient-text">ពិន្ទុ</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            បញ្ចូលពិន្ទុតាមមុខវិជ្ជានិងបន្ទប់
          </p>
        </div>
        <button
          onClick={saveAllScores}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px' }} />
              កំពុងរក្សាទុក...
            </>
          ) : (
            <>
              <Save size={16} />
              រក្សាទុក
            </>
          )}
        </button>
      </div>

      {savedMsg && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <CheckCircle size={18} style={{ color: '#10b981' }} />
          <p className="text-white font-medium">
            រក្សាទុកបានជោគជ័យ! ពិន្ទុទាំងអស់ត្រូវបានគណនាឡើងវិញ។
          </p>
        </div>
      )}

      {saveError && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <p className="text-white font-medium text-sm">{saveError}</p>
        </div>
      )}

      {/* Exam Type Selector */}
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

      {rooms.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardList size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xl font-semibold text-white mb-2">គ្មានសិស្សសម្រាប់ {EXAM_TYPE_LABELS[selectedExamType]}</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            សូមចូលទៅ <strong style={{ color: '#60a5fa' }}>គ្រប់គ្រងសិស្ស</strong> ដើម្បី import ឬ បន្ថែម
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start min-w-0 w-full">
          {/* Room selector sidebar */}
          <div className="w-full lg:w-48 flex-shrink-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              បន្ទប់
            </p>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {rooms.map((room) => {
                const isActive = activeRoom === room.name;
                const roomStudentsForRoom = students.filter(
                  (s) => s.examType === selectedExamType && s.room === room.name
                );
                const scored = roomStudentsForRoom.filter(
                  (s) => Object.values(s.scores || {}).some((v) => v !== null && v !== undefined)
                ).length;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.name)}
                    className="flex-shrink-0 lg:w-full text-left px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: isActive ? colors.bg : 'rgba(26,42,74,0.4)',
                      border: `1px solid ${isActive ? colors.border : 'rgba(42,63,111,0.3)'}`,
                      color: isActive ? colors.text : 'var(--text-secondary)',
                      minWidth: '120px',
                    }}
                  >
                    <p className="font-semibold text-sm">បន្ទប់ {room.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                      {scored}/{room.studentCount} នាក់
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Score entry table */}
          <div className="flex-1 w-full min-w-0 glass-card overflow-hidden">
            <div
              className="p-4 border-b flex items-center justify-between gap-4 flex-wrap"
              style={{ borderColor: 'rgba(42,63,111,0.4)' }}
            >
              <div>
                <h3 className="font-bold text-white">
                  {activeRoom ? `បន្ទប់ ${activeRoom}` : 'ជ្រើសបន្ទប់'}
                </h3>
                {activeRoom && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {roomStudents.length} នាក់ — {subjects.length} មុខវិជ្ជា
                  </p>
                )}
              </div>
              {/* Subject coefficients legend */}
              <div className="hidden lg:flex gap-3 flex-wrap">
                {subjects.map((s) => (
                  <div key={s.id} className="flex flex-col items-center">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                    >
                      x{s.coefficient}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {s.nameEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {activeRoom && roomStudents.length > 0 ? (
              <div
                className="w-full overflow-x-auto max-w-full"
                style={{
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <table className="exam-table w-full" style={{ minWidth: `${320 + subjects.length * 110}px` }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: '45px' }}>ល.រ</th>
                      <th style={{ textAlign: 'left', paddingLeft: '12px', minWidth: '150px' }}>ឈ្មោះ</th>
                      <th style={{ width: '50px' }}>ភេទ</th>
                      {subjects.map((sub) => (
                        <th key={sub.id} style={{ minWidth: '95px' }}>
                          <div>{sub.name}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                            /{sub.maxScore} (x{sub.coefficient})
                          </div>
                        </th>
                      ))}
                      <th style={{ width: '80px' }}>ពិន្ទុ</th>
                      <th style={{ width: '70px' }}>មធ្យម</th>
                      <th style={{ width: '80px' }}>លទ្ធផល</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomStudents.map((student) => {
                      const isFail = student.status === 'fail';
                      return (
                        <tr key={student.id} className={isFail ? 'failed' : ''}>
                          <td style={{ color: 'var(--text-muted)' }}>{getStudentSeqNo(student, students)}</td>
                          <td style={{ textAlign: 'left', paddingLeft: '12px' }}>
                            <span className="font-medium text-sm">{student.name}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: student.gender === 'female' ? '#f9a8d4' : '#93c5fd' }}>
                            {student.gender === 'female' ? 'ស្រី' : 'ប'}
                          </td>
                          {subjects.map((sub) => {
                            const val = localScores[student.id]?.[sub.id] ?? '';
                            const err = errors[student.id]?.[sub.id];
                            return (
                              <td key={sub.id} style={{ padding: '6px 8px' }}>
                                <div className="flex flex-col items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={sub.maxScore}
                                    value={val}
                                    onChange={(e) =>
                                      handleScoreChange(student.id, sub.id, e.target.value, sub.maxScore)
                                    }
                                    className={`score-input ${err ? 'invalid' : ''}`}
                                    style={{ width: '68px' }}
                                    placeholder="-"
                                  />
                                  {err && (
                                    <span style={{ fontSize: '0.65rem', color: '#f87171' }}>{err}</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="font-mono font-bold" style={{ color: '#60a5fa' }}>
                            {student.totalScore ?? '-'}
                          </td>
                          <td className="font-mono" style={{ color: isFail ? '#f87171' : '#34d399' }}>
                            {student.average ?? '-'}
                          </td>
                          <td>
                            {student.status === 'pass' && <span className="badge-pass">ជាប់</span>}
                            {student.status === 'fail' && <span className="badge-fail">ធ្លាក់</span>}
                            {student.status === 'pending' && (
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
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
                <ClipboardList size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>
                  {activeRoom ? 'គ្មានសិស្សក្នុងបន្ទប់នេះ' : 'ជ្រើសរើសបន្ទប់ម្ខាង'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
