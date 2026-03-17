export interface Student {
  id: string;
  name: string;
  class: string;
  role?: never;
}

export interface AdminUser {
  id: string;
  name: string;
  role: 'admin';
  class?: never;
}

export type User = Student | AdminUser;

export interface AttendanceRecord {
  id?: number;
  studentId: string;
  name: string;
  class: string;
  session: Session;
  date: string;
  time: string;
}

export type Session = 'เช้า' | 'บ่าย';
export type GpsState = 'idle' | 'loading' | 'success' | 'out_of_zone' | 'error';

export interface Position {
  lat: number;
  lng: number;
}

export interface GpsConfig {
  icon: string;
  label: string;
  dot: string;
  ring: string;
  bg: string;
}
