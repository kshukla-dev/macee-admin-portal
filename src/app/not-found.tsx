'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] text-white p-4">
      <div className="text-center space-y-2">
        <p className="text-xs text-slate-400">Redirecting to login...</p>
      </div>
    </div>
  );
}
