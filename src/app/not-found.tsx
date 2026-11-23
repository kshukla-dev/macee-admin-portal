'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-teal-400">404</h2>
        <p className="text-slate-400 text-sm">Page Not Found</p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
