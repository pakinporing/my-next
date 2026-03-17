import { Student, Position, AttendanceRecord } from './types';

export const MOCK_STUDENTS: Record<string, Omit<Student, 'id'>> = {
  '64001': { name: 'สมชาย ใจดี', class: 'ม.4/1' },
  '64002': { name: 'มานี รักเรียน', class: 'ม.4/1' },
  '64003': { name: 'วิชัย เก่งมาก', class: 'ม.4/2' },
  '64004': { name: 'สุดา สวยงาม', class: 'ม.4/2' },
  '64005': { name: 'ประยุทธ์ ขยันดี', class: 'ม.5/1' }
};

export const SCHOOL_LOCATION: Position = { lat: 13.75794, lng: 100.58484 };
export const ALLOWED_RADIUS_METERS = 200;

export const MOCK_HISTORY: AttendanceRecord[] = [
  {
    id: 1,
    studentId: '64001',
    name: 'สมชาย ใจดี',
    class: 'ม.4/1',
    session: 'เช้า',
    date: '2025-02-26',
    time: '07:45'
  },
  {
    id: 2,
    studentId: '64001',
    name: 'สมชาย ใจดี',
    class: 'ม.4/1',
    session: 'บ่าย',
    date: '2025-02-26',
    time: '12:30'
  },
  {
    id: 3,
    studentId: '64002',
    name: 'มานี รักเรียน',
    class: 'ม.4/1',
    session: 'เช้า',
    date: '2025-02-26',
    time: '07:52'
  },
  {
    id: 4,
    studentId: '64003',
    name: 'วิชัย เก่งมาก',
    class: 'ม.4/2',
    session: 'เช้า',
    date: '2025-02-26',
    time: '08:01'
  },
  {
    id: 5,
    studentId: '64004',
    name: 'สุดา สวยงาม',
    class: 'ม.4/2',
    session: 'เช้า',
    date: '2025-02-27',
    time: '07:38'
  }
];
