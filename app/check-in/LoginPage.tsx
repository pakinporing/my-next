'use client';

import { useState } from 'react';
import { User } from './types';
import { MOCK_STUDENTS } from './constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    if (!studentId.trim()) return setError('กรุณากรอกรหัสนักเรียน');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const found = MOCK_STUDENTS[studentId.trim()];
    if (!found) {
      setError('ไม่พบรหัสนักเรียนในระบบ');
      setLoading(false);
      return;
    }
    onLogin({ id: studentId.trim(), ...found });
  };

  const handleAdminLogin = (): void => {
    onLogin({ id: 'admin', name: 'ครูใหญ่', role: 'admin' });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-sky-500/30">
            📋
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            เช็คชื่อออนไลน์
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            ระบบลงชื่อเข้าเรียนด้วย GPS
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">
            รหัสนักเรียน
          </label>
          <input
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="เช่น 64001"
            className={`w-full px-4 py-3 rounded-xl bg-slate-950 text-white text-lg font-mono tracking-widest border-2 outline-none transition-colors
              ${error ? 'border-red-500' : 'border-slate-700 focus:border-sky-500'}`}
          />
          {error && <p className="text-red-400 text-xs mt-2">⚠ {error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-bold text-base text-white transition-all
              bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>

          <div className="mt-4 bg-slate-900 rounded-lg px-4 py-3">
            <p className="text-slate-500 text-xs">
              🔑 <span className="text-slate-400 font-semibold">Demo:</span>{' '}
              ลองพิมพ์ 64001 – 64005
            </p>
          </div>
        </div>

        <p className="text-center mt-5 text-slate-500 text-sm">
          ครู/แอดมิน?{' '}
          <span
            onClick={handleAdminLogin}
            className="text-sky-400 cursor-pointer font-semibold hover:text-sky-300"
          >
            เข้าหน้าแอดมิน →
          </span>
        </p>
      </div>
    </div>
  );
}
