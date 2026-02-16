'use client';

// import { login } from '@/libs/action';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import z from 'zod';
import { signIn, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    const res = await signIn('credentials', { ...data, redirect: false });

    if (res?.error) {
      setError('password', { message: 'Invalid credentials (from setError)' });
      return;
    }

    redirect('/');
    // const res = await login(data);
    // console.log('resrrrssss', res);
    // if (!res?.success) {
    //   setError('password', { message: 'Invalid credentials' });
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Sign in to your account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('SUBMIT WORK');
            console.log('SUBMIT WORK');
          }}
          className="space-y-5"
        > */}
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${
                errors.email
                  ? 'border-red-500 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-blue-300'
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
              ${
                errors.password
                  ? 'border-red-500 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-blue-300'
              }`}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold
              hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">© 2026 My App</p>
      </div>
    </div>
  );
}
