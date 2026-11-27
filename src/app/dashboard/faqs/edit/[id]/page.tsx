'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaqForm, FaqItem } from '@/components/forms/FaqForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditFaqPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<FaqItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((data) => {
        const found = (data.items || []).find((i: FaqItem) => i.id === id);
        if (found) {
          setItem(found);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading FAQ item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md bg-white p-8 rounded-2xl border border-slate-100 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Question Not Found</h2>
          <p className="text-xs text-slate-500">The FAQ item you are looking for does not exist or has been removed.</p>
          <Link
            href="/dashboard/faqs"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0E1726] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to FAQs</span>
          </Link>
        </div>
      </div>
    );
  }

  return <FaqForm initialData={item} isEdit={true} />;
}
