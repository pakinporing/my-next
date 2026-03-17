'use client';

import { useState, useCallback } from 'react';
import {
  Student,
  AttendanceRecord,
  GpsState,
  Position,
  GpsConfig
} from './types';
import { getCurrentSession, getDistanceMeters } from './utils';
import { SCHOOL_LOCATION, ALLOWED_RADIUS_METERS } from './constants';

interface CheckinPageProps {
  student: Student;
  onLogout: () => void;
  onCheckin: (record: AttendanceRecord) => void;
}

export default function CheckinPage({
  student,
  onLogout,
  onCheckin
}: CheckinPageProps) {
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [position, setPosition] = useState<Position | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [checkedIn, setCheckedIn] = useState<AttendanceRecord | null>(null);
  const session = getCurrentSession();

  const requestGPS = useCallback((): void => {
    setGpsState('loading');
    if (!navigator.geolocation) {
      setGpsState('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        const dist = getDistanceMeters(
          latitude,
          longitude,
          SCHOOL_LOCATION.lat,
          SCHOOL_LOCATION.lng
        );
        setDistance(Math.round(dist));
        setGpsState(dist <= ALLOWED_RADIUS_METERS ? 'success' : 'out_of_zone');
      },
      () => setGpsState('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleCheckin = (): void => {
    const now = new Date();
    const record: AttendanceRecord = {
      studentId: student.id,
      name: student.name,
      class: student.class,
      session,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    };
    onCheckin(record);
    setCheckedIn(record);
  };

  const gpsConfigMap: Record<GpsState, GpsConfig> = {
    idle: {
      icon: '📍',
      label: 'ยังไม่ได้ขอ GPS',
      dot: 'bg-slate-500',
      ring: 'border-slate-700',
      bg: 'bg-slate-900'
    },
    loading: {
      icon: '🔄',
      label: 'กำลังหาตำแหน่ง...',
      dot: 'bg-amber-400',
      ring: 'border-amber-700',
      bg: 'bg-amber-950/40'
    },
    success: {
      icon: '✅',
      label: `อยู่ในโซน (${distance}m)`,
      dot: 'bg-green-400',
      ring: 'border-green-700',
      bg: 'bg-green-950/40'
    },
    out_of_zone: {
      icon: '🚫',
      label: `นอกโซน (${distance}m จากโรงเรียน)`,
      dot: 'bg-red-500',
      ring: 'border-red-700',
      bg: 'bg-red-950/40'
    },
    error: {
      icon: '⚠️',
      label: 'ไม่สามารถใช้ GPS ได้',
      dot: 'bg-amber-400',
      ring: 'border-amber-700',
      bg: 'bg-amber-950/40'
    }
  };
  const gps = gpsConfigMap[gpsState];

  const barPercent = distance
    ? Math.min(100, (distance / ALLOWED_RADIUS_METERS) * 100)
    : 0;
  const barColor =
    gpsState === 'success'
      ? 'bg-green-400'
      : gpsState === 'out_of_zone'
        ? 'bg-red-500'
        : 'bg-slate-600';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex justify-between items-center">
        <div>
          <p className="text-white font-bold">{student.name}</p>
          <p className="text-slate-400 text-sm">
            {student.class} · รหัส {student.id}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-slate-400 text-sm border border-slate-700 rounded-lg px-4 py-1.5 hover:bg-slate-700 transition-colors"
        >
          ออก
        </button>
      </div>

      <div className="max-w-md mx-auto px-5 py-6 space-y-4">
        {/* Session card */}
        <div className="bg-gradient-to-r from-sky-900/50 to-slate-800 rounded-2xl border border-slate-700 p-5 flex items-center gap-4">
          <span className="text-4xl">{session === 'เช้า' ? '🌅' : '🌤'}</span>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
              ช่วงเวลาปัจจุบัน
            </p>
            <p className="text-white text-2xl font-extrabold">ช่วง{session}</p>
            <p className="text-slate-400 text-sm">
              {new Date().toLocaleDateString('th-TH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* GPS Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-bold">สถานะ GPS</span>
            {(gpsState === 'loading' || gpsState === 'success') && (
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${gps.dot}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${gps.dot}`}
                />
              </span>
            )}
          </div>

          <div
            className={`${gps.bg} border ${gps.ring} rounded-xl p-5 text-center mb-4`}
          >
            <div className="text-4xl mb-2">{gps.icon}</div>
            <p className="text-white font-bold text-sm">{gps.label}</p>
            {position && (
              <p className="text-slate-500 text-xs mt-1 font-mono">
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Distance bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${barPercent}%` }}
              />
            </div>
            <span className="text-slate-500 text-xs whitespace-nowrap">
              รัศมี {ALLOWED_RADIUS_METERS}m
            </span>
          </div>

          <button
            onClick={requestGPS}
            disabled={gpsState === 'loading'}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gpsState === 'loading'
              ? 'กำลังระบุตำแหน่ง...'
              : '🔍 ตรวจสอบตำแหน่ง GPS'}
          </button>
        </div>

        {/* Check-in Button */}
        {!checkedIn ? (
          <button
            onClick={handleCheckin}
            disabled={gpsState !== 'success'}
            className={`w-full py-5 rounded-2xl text-lg font-extrabold transition-all
              ${
                gpsState === 'success'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:from-green-400 hover:to-emerald-500'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
          >
            {gpsState === 'success'
              ? '✍️ ลงชื่อเข้าเรียน'
              : '🔒 ต้องอยู่ในโซนก่อน'}
          </button>
        ) : (
          <div className="bg-green-950/50 border-2 border-green-500 rounded-2xl p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-green-400 text-xl font-extrabold">
              ลงชื่อสำเร็จ!
            </p>
            <p className="text-slate-400 text-sm mt-2">
              ช่วง{checkedIn.session} · {checkedIn.time} น.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
