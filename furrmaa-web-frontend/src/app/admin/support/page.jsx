'use client';

import { useState, useEffect } from 'react';
import { adminGetSupport, adminGetSupportById, adminSendSupportMessage, adminUpdateSupportStatus } from '@/lib/api';

export default function AdminSupportPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('open');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSupport()
      .then((d) => setChats(d.chats || d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const list = Array.isArray(chats) ? chats : [];

  const loadChat = async (id) => {
    try {
      const chat = await adminGetSupportById(id);
      setSelectedChat(chat || null);
      setStatus(chat?.status || 'open');
    } catch (e) {
      alert(e.message || 'Failed to load chat');
    }
  };

  const handleSend = async () => {
    if (!selectedChat?._id || !message.trim()) return;
    setSaving(true);
    try {
      const updated = await adminSendSupportMessage(selectedChat._id, { message: message.trim(), status });
      setSelectedChat(updated || selectedChat);
      setMessage('');
    } catch (e) {
      alert(e.message || 'Failed to send message');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (newStatus) => {
    if (!selectedChat?._id) return;
    setSaving(true);
    try {
      const updated = await adminUpdateSupportStatus(selectedChat._id, newStatus);
      setSelectedChat(updated || selectedChat);
      setStatus(newStatus);
      setChats((prev) => prev.map((c) => (c._id === selectedChat._id ? { ...c, status: newStatus } : c)));
    } catch (e) {
      alert(e.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Support Chats</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">User</th>
              <th className="text-left p-3 font-semibold text-gray-700">Status</th>
              <th className="text-left p-3 font-semibold text-gray-700">Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-500">No support chats.</td></tr>
            ) : (
              list.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 cursor-pointer hover:bg-gray-50" onClick={() => loadChat(c._id)}>
                  <td className="p-3 text-gray-700">{c.user?.name || c.userId || '–'}</td>
                  <td className="p-3 text-gray-600">{c.status || 'open'}</td>
                  <td className="p-3 text-gray-500">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '–'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        {!selectedChat ? (
          <p className="text-gray-500">Select a chat to view details.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{selectedChat.subject || 'Support Chat'}</h2>
              <select value={status} onChange={(e) => handleStatus(e.target.value)} disabled={saving} className="border border-gray-200 rounded px-2 py-1 text-sm">
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
                <option value="closed">closed</option>
              </select>
            </div>
            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded p-2 space-y-2">
              {(selectedChat.messages || []).map((m, i) => (
                <div key={i} className={`text-xs p-2 rounded ${m.sender === 'admin' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <p className="font-semibold">{m.sender}</p>
                  <p>{m.message}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type reply..." className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm" />
              <button onClick={handleSend} disabled={saving || !message.trim()} className="px-3 py-2 bg-[#1F2E46] text-white rounded text-sm disabled:opacity-60">
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
