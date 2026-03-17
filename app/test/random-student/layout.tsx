import { auth } from '@/libs/auth';
import { redirect } from 'next/navigation';

export default async function RandomStudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
