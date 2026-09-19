'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyCremationRequests } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

export default function CremationRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCremationRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Cremation Requests</h1>
        <Link href="/cremation" className="px-4 py-2 rounded-xl bg-[#1F2E46] text-white text-sm font-semibold">New Request</Link>
      </div>

      {loading ? <LogoLoader /> : requests.length === 0 ? (
        <p className="text-gray-500">No cremation requests yet. <Link href="/cremation" className="text-[#1F2E46] font-semibold">Browse centers</Link></p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="border border-gray-100 rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-bold">{r.petInformation?.petName || r.petName || 'Pet'}</h3>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 capitalize">{r.status || 'pending'}</span>
              </div>
              <p className="text-sm text-gray-500">{r.center?.name || 'Center'} · {r.center?.city || ''}</p>
              <p className="text-sm text-gray-500">{r.ownerInformation?.fullName || r.fullName} · {r.ownerInformation?.mobileNumber || r.mobileNumber}</p>
              <p className="text-xs text-gray-400 mt-2">{r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
