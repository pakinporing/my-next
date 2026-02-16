'use server';

import { LoginInput } from '@/app/login/page';
import { signIn } from '@/libs/auth';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';
import { signOut } from '@/libs/auth';
import { revalidatePath } from 'next/cache';

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
