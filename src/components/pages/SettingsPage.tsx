'use client';

import { useState } from 'react';
import { useExamStore } from '@/store/examStore';
import { EXAM_TYPE_LABELS, EXAM_TYPE_COLORS } from '@/config/examConfig';
import { ExamType, Subject, SchoolInfo } from '@/types';
import {
  Settings, School, BookOpen, Save, CheckCircle, Database,
} from 'lucide-react';

const EXAM_TYPES: ExamType[] = ['grade9', 'grade12_science', 'grade12_social'];

export default function SettingsPage() {
  const { schoolInfo, setSchoolInfo, examConfigs, updateExamConfig, firebaseStatus } = useExamStore();

  const [localSchool, setLocalSchool] = useState(schoolInfo);
  const [selectedType, setSelectedType] = useState<ExamType>('grade12_science');
  const [savedMsg, setSavedMsg] = useState(false);
  const [localPassMark, setLocalPassMark] = useState<Record<ExamType, string>>({
    grade9: String(examConfigs.grade9.passConditions.minAverage),
    grade12_science: String(examConfigs.grade12_science.passConditions.minAverage),
    grade12_social: String(examConfigs.grade12_social.passConditions.minAverage),
  });

  const config = examConfigs[selectedType];
  const colors = EXAM_TYPE_COLORS[selectedType];

  const saveSchoolInfo = () => {
    setSchoolInfo(localSchool);
    showSaved();
  };

  const showSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const updateSubject = (subjectId: string, updates: Partial<Subject>) => {
    const newSubjects = config.subjects.map((s) =>
      s.id === subjectId ? { ...s, ...updates } : s
    );
    updateExamConfig(selectedType, { subjects: newSubjects });
  };

  const updatePassMark = (type: ExamType, val: string) => {
    setLocalPassMark((prev) => ({ ...prev, [type]: val }));
    const num = parseFloat(val);
    if (!isNaN(num)) {
      updateExamConfig(type, {
        passConditions: { ...examConfigs[type].passConditions, minAverage: num },
      });
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          ការ<span className="gradient-text">កំណត់</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          ការកំណត់ប្រព័ន្ធ — ព័ត៌មានសាលា, មុខវិជ្ជា, ពិន្ទុ
        </p>
      </div>

      {savedMsg && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <CheckCircle size={18} style={{ color: '#10b981' }} />
          <p className="text-white font-medium">រក្សាទុកបានជោគជ័យ!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: School Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                <School size={18} style={{ color: '#60a5fa' }} />
              </div>
              <h3 className="font-bold text-white">ព័ត៌មានមណ្ឌល</h3>
            </div>

            <div className="space-y-4">
              {[
                { label: 'ឈ្មោះមណ្ឌល *', field: 'name', placeholder: 'មណ្ឌលប្រឡង...' },
                { label: 'ឆ្នាំ', field: 'examYear', placeholder: '2026' },
                { label: 'សម័យប្រឡង', field: 'examSession', placeholder: 'សម័យប្រឡង ២០២៦' },
                { label: 'ខេត្ត/ក្រុង', field: 'province', placeholder: 'ភ្នំពេញ' },
                { label: 'មណ្ឌលប្រឡង', field: 'examCenter', placeholder: 'មណ្ឌល...' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={localSchool[field as keyof SchoolInfo] || ''}
                    onChange={(e) => setLocalSchool({ ...localSchool, [field]: e.target.value })}
                    className="score-input w-full"
                    style={{ width: '100%', textAlign: 'left' }}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <button
                onClick={saveSchoolInfo}
                className="w-full py-2.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                }}
              >
                <Save size={15} />
                រក្សាទុក
              </button>
            </div>
          </div>

          {/* Pass Marks */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
              >
                <Settings size={18} style={{ color: '#f59e0b' }} />
              </div>
              <h3 className="font-bold text-white">ពិន្ទុប្រើជាប់</h3>
            </div>
            <div className="space-y-4">
              {EXAM_TYPES.map((type) => {
                const c = EXAM_TYPE_COLORS[type];
                return (
                  <div key={type}>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {EXAM_TYPE_LABELS[type]}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={localPassMark[type]}
                        onChange={(e) => updatePassMark(type, e.target.value)}
                        className="score-input"
                        style={{ width: '80px' }}
                      />
                      <span className="text-sm" style={{ color: c.text }}>
                        / 100 (មធ្យម)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Firebase Realtime Sync Status Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <Database size={18} style={{ color: '#f87171' }} />
                </div>
                <h3 className="font-bold text-white">Firebase Sync</h3>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background:
                    firebaseStatus === 'connected'
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(245,158,11,0.2)',
                  color:
                    firebaseStatus === 'connected' ? '#34d399' : '#f59e0b',
                  border: `1px solid ${
                    firebaseStatus === 'connected'
                      ? 'rgba(16,185,129,0.3)'
                      : 'rgba(245,158,11,0.3)'
                  }`,
                }}
              >
                {firebaseStatus === 'connected'
                  ? '🟢 ភ្ជាប់ជោគជ័យ'
                  : '🟡 Local (មិនទាន់ភ្ជាប់)'}
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              ដើម្បី Sync ទិន្នន័យលើឧបករណ៍ច្រើន (Multi-device Realtime Sync) សូមកំណត់ Firebase Environment Variables លើ Vercel:
            </p>
            <div
              className="p-3 rounded-lg text-xs font-mono space-y-1"
              style={{ background: 'rgba(15,23,41,0.8)', color: '#93c5fd' }}
            >
              <p>NEXT_PUBLIC_FIREBASE_DATABASE_URL</p>
              <p>NEXT_PUBLIC_FIREBASE_API_KEY</p>
              <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID</p>
            </div>
          </div>
        </div>

        {/* Right: Subject Config */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            {/* Exam type tabs */}
            <div
              className="flex border-b"
              style={{ borderColor: 'rgba(42,63,111,0.4)' }}
            >
              {EXAM_TYPES.map((type) => {
                const c = EXAM_TYPE_COLORS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="flex-1 py-3 px-4 text-sm font-medium transition-all"
                    style={{
                      background: selectedType === type ? c.bg : 'transparent',
                      color: selectedType === type ? c.text : 'var(--text-secondary)',
                      borderBottom: selectedType === type ? `2px solid ${c.text}` : '2px solid transparent',
                    }}
                  >
                    {type === 'grade9' ? 'ថ្នាក់ ៩' : type === 'grade12_science' ? 'ថ្នាក់ ១២ (វិទ្យា)' : 'ថ្នាក់ ១២ (សង្គម)'}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen size={18} style={{ color: colors.text }} />
                <h3 className="font-bold text-white">
                  មុខវិជ្ជា — {EXAM_TYPE_LABELS[selectedType]}
                </h3>
              </div>

              <div className="space-y-3">
                {config.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(26,42,74,0.5)', border: '1px solid rgba(42,63,111,0.3)' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
                          className="score-input flex-1"
                          style={{ width: '180px', textAlign: 'left', fontSize: '0.9rem' }}
                        />
                        <input
                          type="text"
                          value={subject.nameEn}
                          onChange={(e) => updateSubject(subject.id, { nameEn: e.target.value })}
                          className="score-input"
                          style={{ width: '120px', textAlign: 'left', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                            ពិន្ទុខ្ពស់
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={subject.maxScore}
                            onChange={(e) =>
                              updateSubject(subject.id, { maxScore: parseInt(e.target.value) || subject.maxScore })
                            }
                            className="score-input"
                            style={{ width: '70px' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                            មេគុណ
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={subject.coefficient}
                            onChange={(e) =>
                              updateSubject(subject.id, {
                                coefficient: parseFloat(e.target.value) || subject.coefficient,
                              })
                            }
                            className="score-input"
                            style={{ width: '70px' }}
                          />
                        </div>
                        <div className="ml-auto">
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-bold"
                            style={{ background: colors.bg, color: colors.text }}
                          >
                            x{subject.coefficient} · /{subject.maxScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                * ការកែប្រែដោយស្វ័យប្រវត្តិ (auto-save) — ពិន្ទុត្រូវបានគណនាឡើងវិញ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
