'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { requestForgotPassword } from '@/libs/api/password';
import { useState } from 'react';
import PendingWaveDots from '@/app/_components/PendingWaveDots';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email')
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordInput>({
    defaultValues: { email: '' },
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (input: ForgotPasswordInput) => {
    setApiError(null);
    try {
      await requestForgotPassword(input.email);
      setDone(true);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Request failed');
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#fdf4ff_35%,_#e0f2fe_100%)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_20px_80px_rgba(12,74,110,0.18)] backdrop-blur">
          <div className="mb-8">
            <p className="mb-2 inline-block rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
              Account Recovery
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your account email and we will send a reset link if the
              account exists.
            </p>
          </div>

          {done ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-800">
                Request submitted successfully.
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Check your inbox for the password reset link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                    errors.email
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-2 focus:ring-cyan-300'
                  }`}
                />
                {errors.email ? (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.email.message}
                  </p>
                ) : null}
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
                  <PendingWaveDots label="Sending" />
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-cyan-700">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
