'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { requestResetPassword } from '@/libs/api/password';
import { useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import PendingWaveDots from '@/app/_components/PendingWaveDots';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Use only English letters and numbers'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordInput>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (input: ResetPasswordInput) => {
    setApiError(null);
    try {
      await requestResetPassword(token, input.password);
      await signOut({ redirect: false });
      setDone(true);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Request failed');
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe4e6_0%,_#ecfeff_42%,_#eff6ff_100%)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur">
          <div className="mb-8">
            <p className="mb-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
              Security
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Create a new password for your account.
            </p>
          </div>

          {!token ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-800">
                Missing reset token.
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Please open this page from the reset link in your email.
              </p>
            </div>
          ) : done ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-800">
                Password updated successfully.
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                You can now sign in with your new password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  New password
                </label>
                <input
                  type="password"
                  placeholder="At least 6 letters/numbers"
                  {...register('password')}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                    errors.password
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-2 focus:ring-sky-300'
                  }`}
                />
                {errors.password ? (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Confirm new password
                </label>
                <input
                  type="password"
                  placeholder="Repeat your new password"
                  {...register('confirmPassword')}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition ${
                    errors.confirmPassword
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-300'
                      : 'border-slate-200 focus:ring-2 focus:ring-sky-300'
                  }`}
                />
                {errors.confirmPassword ? (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.confirmPassword.message}
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
                  <PendingWaveDots label="Updating" />
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-sky-700">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
