import { auth } from '@/libs/auth';
import { redirect } from 'next/navigation';

export default async function RandomStudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log('session server student', session);

  if (!session) {
    redirect('/login');
  }
  return <>{children}</>;
}
