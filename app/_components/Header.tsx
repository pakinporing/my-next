// components/Header.tsx
'use client';

import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import { logout } from '@/libs/action';
import { useState } from 'react';

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'payment-timer', href: '/test/payment-timer' },
  { label: 'scroll', href: '/test/scroll' },
  { label: 'debounced-search', href: '/test/debounced-search' },
  { label: 'random-student', href: '/test/random-student' }
  // { label: 'learn/friend/create', href: '/learn/friend/create' }
];

export default function Header() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const { data: session, update } = useSession();

  return (
    <header className="w-full bg-gray-900 text-white shadow">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg">
          pakinporing
        </Link>

        {/* Nav */}
        <nav className="flex gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-blue-400 ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-gray-200'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div>
            {session ? (
              // <button
              //   onClick={async () => {
              //     await signOut({ redirect: false });
              //     redirect('/');
              //   }}
              //   className="bg-red-600 text-white px-3 py-1 rounded"
              // >
              //   Logout
              // </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={async () => {
                  setLoading(true);
                  await signOut({ redirect: false });
                  redirect('/');
                }}
                disabled={loading}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
