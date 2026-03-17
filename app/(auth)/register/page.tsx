'use client';

import { requestRegister } from '@/libs/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import PendingWaveDots from '@/app/_components/PendingWaveDots';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Use only English letters and numbers'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'])
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      dob: '',
      gender: 'OTHER'
    },
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (input: RegisterInput) => {
    setApiError(null);
    try {
      await requestRegister(input);
      setDone(true);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Request failed');
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe4e6_0%,_#fef9c3_38%,_#e0f2fe_100%)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur">
          <div className="mb-8">
            <p className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Join Fakebuck
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Fill out your details to register.
            </p>
          </div>

          {done ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-800">
                Account created successfully.
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                You can sign in with your new account now.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    First name
                  </label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                      errors.firstName
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'border-slate-200 focus:ring-2 focus:ring-amber-300'
                    }`}
                  />
                  {errors.firstName ? (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.firstName.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                      errors.lastName
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'border-slate-200 focus:ring-2 focus:ring-amber-300'
                    }`}
                  />
                  {errors.lastName ? (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.lastName.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                    errors.email
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-2 focus:ring-amber-300'
                  }`}
                />
                {errors.email ? (
                  <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                    errors.password
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-2 focus:ring-amber-300'
                  }`}
                />
                {errors.password ? (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    {...register('dob')}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                      errors.dob
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'border-slate-200 focus:ring-2 focus:ring-amber-300'
                    }`}
                  />
                  {errors.dob ? (
                    <p className="mt-1 text-sm text-rose-600">{errors.dob.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                      errors.gender
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                        : 'border-slate-200 focus:ring-2 focus:ring-amber-300'
                    }`}
                  >
                    <option value="OTHER">Other</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  {errors.gender ? (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.gender.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {apiError ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {apiError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <PendingWaveDots label="Creating account" />
                ) : (
                  'Create account'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-amber-700">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
