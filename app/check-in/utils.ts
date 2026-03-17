import { Session, AttendanceRecord } from './types';

export function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getCurrentSession(): Session {
  return new Date().getHours() < 12 ? 'เช้า' : 'บ่าย';
}

export function exportCSV(data: AttendanceRecord[]): void {
  const headers = ['รหัส', 'ชื่อ', 'ห้อง', 'ช่วง', 'วันที่', 'เวลา'];
  const rows = data.map((r) => [
    r.studentId,
    r.name,
    r.class,
    r.session,
    r.date,
    r.time
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'attendance.csv';
  a.click();
  URL.revokeObjectURL(url);
}
