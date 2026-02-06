// components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'payment-timer', href: '/test/payment-timer' },
  { label: 'scroll', href: '/test/scroll' },
  { label: 'debounced-search', href: '/test/debounced-search' }
];

export default function Header() {
  const pathname = usePathname();

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
        </nav>
      </div>
    </header>
  );
}
