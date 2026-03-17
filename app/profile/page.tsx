'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

type ApiErrorPayload = {
  message?: string | string[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8888';

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (Array.isArray(payload.message)) return payload.message.join(', ');
    if (payload.message) return payload.message;
  } catch {
    return 'Unexpected error occurred';
  }

  return 'Request failed';
}

function initialsFromName(firstName: string, lastName: string) {
  const first = firstName?.[0] ?? '';
  const last = lastName?.[0] ?? '';
  const result = `${first}${last}`.toUpperCase();
  return result || 'U';
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const apiToken = session?.apiToken;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiToken) return;
    const controller = new AbortController();
    const loadProfile = async () => {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${apiToken}`
          },
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }
        const payload = (await response.json()) as { data?: Profile };
        setProfile(payload.data ?? null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      }
    };
    void loadProfile();
    return () => controller.abort();
  }, [apiToken]);

  const uploadAvatar = async () => {
    if (!apiToken || !avatarFile) return;
    setUploadError(null);
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiToken}`
        },
        body: formData
      });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const payload = (await response.json()) as { data?: string };
      const avatarUrl = payload.data ?? null;
      setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
      if (avatarUrl) {
        await update({ user: { image: avatarUrl } });
      }
      setAvatarFile(null);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload avatar'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCover = async () => {
    if (!apiToken || !coverFile) return;
    setUploadError(null);
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('cover', coverFile);
      const response = await fetch(`${API_BASE_URL}/users/me/cover`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiToken}`
        },
        body: formData
      });
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const payload = (await response.json()) as { data?: string };
      const coverUrl = payload.data ?? null;
      setProfile((prev) => (prev ? { ...prev, coverUrl } : prev));
      setCoverFile(null);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload cover'
      );
    } finally {
      setUploadingCover(false);
    }
  };

  if (!apiToken) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#e0f2fe,#fef9c3)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.16)]">
          <h1 className="text-2xl font-black text-slate-900">
            Profile Unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in to view your profile.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff_0%,_#fef3c7_45%,_#fee2e2_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
        <div
          className="relative h-48 bg-[linear-gradient(120deg,#0f172a,#1d4ed8,#0f172a)]"
          style={
            profile?.coverUrl
              ? {
                  backgroundImage: `url(${profile.coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }
              : undefined
          }
        >
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_top,_#fef9c3,_transparent_60%)]" />
          <div className="absolute bottom-4 left-6 flex items-center gap-4">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Profile avatar"
                width={80}
                height={80}
                unoptimized
                className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-[0_8px_24px_rgba(15,23,42,0.2)]"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-white/90 text-lg font-black text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.2)]">
                {profile
                  ? initialsFromName(profile.firstName, profile.lastName)
                  : 'U'}
              </div>
            )}
            <div className="text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">
                Personal Profile
              </p>
              <h1 className="text-2xl font-black">
                {profile
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Loading...'}
              </h1>
            </div>
          </div>
        </div>

        <div className="px-8 pb-10 pt-20">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : profile ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Profile Media
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Avatar
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setAvatarFile(event.target.files?.[0] ?? null)
                      }
                      className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                    />
                    <button
                      onClick={uploadAvatar}
                      disabled={!avatarFile || uploadingAvatar}
                      className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                    </button>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Cover
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setCoverFile(event.target.files?.[0] ?? null)
                      }
                      className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                    />
                    <button
                      onClick={uploadCover}
                      disabled={!coverFile || uploadingCover}
                      className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {uploadingCover ? 'Uploading...' : 'Upload Cover'}
                    </button>
                  </div>
                </div>
                {uploadError ? (
                  <p className="mt-3 text-sm text-rose-600">{uploadError}</p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {profile.email}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Basic Info
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Gender: <span className="font-semibold">{profile.gender}</span>
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Date of birth:{' '}
                  <span className="font-semibold">
                    {new Date(profile.dob).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Account
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  User ID: <span className="font-mono text-xs">{profile.id}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Logged in with access token from backend.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Loading profile...</p>
          )}
        </div>
      </div>
    </main>
  );
}
