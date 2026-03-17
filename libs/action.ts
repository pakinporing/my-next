'use server';

import { LoginInput } from '@/app/login/page';
import { signIn } from '@/libs/auth';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';
import { signOut, auth } from '@/libs/auth';
import { revalidatePath } from 'next/cache';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8888';

export const login = async (data: LoginInput) => {
  // second params: Record<string, unknown> & { redirect: boolean, redirectTo: string }
  // default value: { redirect: true, redirectTo: current pathname }
  console.log(data);
  try {
    // await signIn('credentials', { ...data, redirectTo: '/' }); // auth.js called authorized(data)
    // redirect('/')
    await signIn('credentials', { ...data, redirect: false });
  } catch (err) {
    // if (isRedirectError(err)) throw err;
    return { success: false };
  }
  redirect('/');
};

export const logout = async () => {
  await signOut({ redirect: false });

  redirect('/login');
};

export const testApi = async () => {
  const session = await auth();
  const accessToken = session?.user?.accessToken;

  console.log('session testApi ===>', session);

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      await signOut({ redirect: false });
      // redirect('/');
    }
    throw new Error('API request failed');
  }

  const data = await response.json();
  console.log('dataaa', response);
};
