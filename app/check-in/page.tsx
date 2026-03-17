'use client';

import { useState } from 'react';
import { User, AttendanceRecord, Student } from './types';
import LoginPage from './LoginPage';
import CheckinPage from './CheckinPage';
import AdminPage from './AdminPage';

export default function CheckinApp() {
  const [user, setUser] = useState<User | null>(null);
  const [newRecords, setNewRecords] = useState<AttendanceRecord[]>([]);

  const handleCheckin = (record: AttendanceRecord): void => {
    setNewRecords((prev) => [...prev, { ...record, id: Date.now() }]);
  };

  if (!user) return <LoginPage onLogin={setUser} />;
  if (user.role === 'admin')
    return <AdminPage onLogout={() => setUser(null)} records={newRecords} />;
  return (
    <CheckinPage
      student={user as Student}
      onLogout={() => setUser(null)}
      onCheckin={handleCheckin}
    />
  );
}
