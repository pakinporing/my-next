'use client';

import { useState } from 'react';
import { AttendanceRecord, Session } from './types';
import { MOCK_HISTORY } from './constants';
import { exportCSV } from './utils';

interface AdminPageProps {
  onLogout: () => void;
  records: AttendanceRecord[];
}

export default function AdminPage({ onLogout, records }: AdminPageProps) {
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSession, setFilterSession] = useState<Session | ''>('');

  const allRecords: AttendanceRecord[] = [...MOCK_HISTORY, ...records];
  const filtered = allRecords.filter((r) => {
    if (filterDate && r.date !== filterDate) return false;
    if (filterClass && r.class !== filterClass) return false;
    if (filterSession && r.session !== filterSession) return false;
    return true;
  });

  const classes = [...new Set(allRecords.map((r) => r.class))].sort();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = allRecords.filter((r) => r.date === todayStr).length;

  const inputClass =
    'bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 transition-colors';

  const stats = [
    {
      label: 'เช็คชื่อวันนี้',
      value: todayCount,
      icon: '✅',
      color: 'text-green-400'
    },
    {
      label: 'ทั้งหมด',
      value: allRecords.length,
      icon: '📋',
      color: 'text-sky-400'
    },
    {
      label: 'จำนวนห้อง',
      value: classes.length,
      icon: '🏫',
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div>
          <p className="text-white font-extrabold text-lg">📊 แอดมิน</p>
          <p className="text-slate-400 text-sm">ระบบเช็คชื่อออนไลน์</p>
        </div>
        <button
          onClick={onLogout}
          className="text-slate-400 text-sm border border-slate-700 rounded-lg px-4 py-1.5 hover:bg-slate-700 transition-colors"
        >
          ออก
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-3xl font-extrabold ${s.color}`}>
                {s.value}
              </div>
              <div className="text-slate-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-32">
            <label className="text-slate-500 text-xs font-semibold uppercase">
              วันที่
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-28">
            <label className="text-slate-500 text-xs font-semibold uppercase">
              ห้อง
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className={inputClass}
            >
              <option value="">ทั้งหมด</option>
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-28">
            <label className="text-slate-500 text-xs font-semibold uppercase">
              ช่วง
            </label>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value as Session | '')}
              className={inputClass}
            >
              <option value="">ทั้งหมด</option>
              <option value="เช้า">เช้า</option>
              <option value="บ่าย">บ่าย</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilterDate('');
                setFilterClass('');
                setFilterSession('');
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
              ล้าง
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wide">
                  {['รหัส', 'ชื่อ', 'ห้อง', 'ช่วง', 'วันที่', 'เวลา'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-500"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id ?? i}
                      className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono">
                        {r.studentId}
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{r.class}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold
                          ${
                            r.session === 'เช้า'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {r.session}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{r.date}</td>
                      <td className="px-4 py-3 text-white font-semibold">
                        {r.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-700 text-slate-500 text-xs">
            แสดง {filtered.length} รายการ
          </div>
        </div>
      </div>
    </div>
  );
}
