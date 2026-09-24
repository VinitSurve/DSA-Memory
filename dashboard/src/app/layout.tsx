import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, List, CalendarSync, Settings } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DSA Memory',
  description: 'Your personal DSA learning and tracking dashboard.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex h-screen overflow-hidden`}>
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 shadow-lg z-10">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
              DSA Memory
            </h1>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link href="/problems" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
              <List size={20} />
              Problems
            </Link>
            <Link href="/reviews" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
              <CalendarSync size={20} />
              Reviews
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors w-full text-left">
              <Settings size={20} />
              Settings
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}
