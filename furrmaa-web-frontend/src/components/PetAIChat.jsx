'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { aiCreateSession, aiSendMessage, getToken } from '@/lib/api';

const SUGGESTED_TOPICS = [
  'Pet Health Guidance?',
  'Find Nearby Vet Clinics?',
  'Pet Nutrition Advice?',
  'Behavior & Training Tips?',
  'Grooming & Hygiene?',
  'Lost & Found Support?',
  'Pet Adoption Guidance?',
];

export default function PetAIChat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login?redirect=%2Fpet-ai%2Fchat');
      return;
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendText = async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || sending) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      let sid = sessionId;
      if (!sid) {
        const created = await aiCreateSession(trimmed.substring(0, 50));
        sid = created?.chat?.sessionId;
        setSessionId(sid);
      }

      const res = await aiSendMessage(sid, trimmed);
      const reply = res?.message?.content || 'No response.';
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: reply },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: e.message || 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-sm">
        Loading Pet AI...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Furrmaa Pet AI</h1>
          <p className="text-xs text-gray-500">Powered by ChatGPT via Furrmaa</p>
        </div>
        <Link href="/" className="text-sm text-[#1F2E46] font-medium hover:underline">
          ← Home
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/80 p-4 space-y-3 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="font-semibold text-gray-900 mb-1">How can I help your pet today?</p>
            <p className="text-sm text-gray-500 mb-6">Pick a topic or type your question</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => sendText(topic)}
                  className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-800"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-auto bg-[#1F2E46] text-white'
                : 'mr-auto bg-white border border-gray-100 text-gray-800'
            }`}
          >
            {m.content}
          </div>
        ))}

        {sending && (
          <p className="text-sm text-gray-400 animate-pulse">Pet AI is typing...</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 items-end border border-gray-200 rounded-2xl bg-white p-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendText(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your pet..."
          rows={2}
          className="flex-1 resize-none text-sm px-3 py-2 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="shrink-0 bg-[#1F2E46] text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <p className="text-[11px] text-gray-400 text-center mt-3">
        AI can make mistakes. For emergencies, contact a veterinarian.
      </p>
    </div>
  );
}
