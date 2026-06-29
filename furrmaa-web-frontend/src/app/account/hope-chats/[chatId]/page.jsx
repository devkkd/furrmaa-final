'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchHopeChat, sendHopeChatMessage, fetchMe } from '@/lib/api';

export default function HopeChatDetailPage() {
  const params = useParams();
  const chatId = params?.chatId;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = () => {
    if (!chatId) return;
    fetchHopeChat(chatId)
      .then((c) => {
        setChat(c);
        setMessages(c.messages || []);
      })
      .catch(() => setChat(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMe().then((me) => setUserId(me?._id || me?.id)).catch(() => {});
    load();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !chatId) return;
    setSending(true);
    try {
      const updated = await sendHopeChatMessage(chatId, text);
      setMessages(updated.messages || []);
      setInput('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-500">Loading chat...</div>;
  if (!chat) return <div className="p-10"><p className="text-gray-500">Chat not found.</p><Link href="/account/hope-chats" className="text-[#1F2E46] font-bold">← Back</Link></div>;

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] shadow-sm min-h-[600px] flex flex-col">
      <div className="p-4 md:p-6 border-b border-gray-100">
        <Link href="/account/hope-chats" className="text-sm text-gray-500 mb-2 inline-block">← All chats</Link>
        <h1 className="text-xl font-extrabold text-gray-900">{chat.post?.petName || 'Hope Chat'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 min-h-[400px]">
        {messages.map((m) => {
          const isMe = (m.sender?._id || m.sender) === userId;
          return (
            <div key={m._id || m.timestamp} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-[#1F2E46] text-white' : 'bg-gray-100 text-gray-900'}`}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-4 py-2"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={sending} className="px-5 py-2 bg-[#1F2E46] text-white rounded-xl font-semibold text-sm">
          Send
        </button>
      </form>
    </div>
  );
}
