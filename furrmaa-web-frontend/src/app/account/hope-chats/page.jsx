'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchHopeChats } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

export default function HopeChatsPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHopeChats()
      .then(setChats)
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Hope Chats</h1>
        <Link href="/hope" className="text-sm text-[#1F2E46] font-semibold">Browse Hope →</Link>
      </div>

      {loading ? <LogoLoader /> : chats.length === 0 ? (
        <p className="text-gray-500">No chats yet. Message someone from a <Link href="/hope" className="text-[#1F2E46] font-semibold">Hope post</Link>.</p>
      ) : (
        <div className="space-y-3">
          {chats.map((c) => (
            <Link key={c._id} href={`/account/hope-chats/${c._id}`} className="block border border-gray-100 rounded-2xl p-4 hover:border-gray-200">
              <h3 className="font-bold text-gray-900">{c.post?.petName || 'Hope Post'}</h3>
              <p className="text-sm text-gray-500 truncate">{c.lastMessage?.content || 'No messages yet'}</p>
              {c.lastMessage?.timestamp && (
                <p className="text-xs text-gray-400 mt-1">{new Date(c.lastMessage.timestamp).toLocaleString('en-IN')}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
