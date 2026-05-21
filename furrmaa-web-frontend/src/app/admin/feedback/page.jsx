'use client';

import { useState, useEffect } from 'react';
import { adminGetFeedback, adminRespondFeedback } from '@/lib/api';

export default function AdminFeedbackPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    adminGetFeedback()
      .then((arr) => setList(Array.isArray(arr) ? arr : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const items = Array.isArray(list) ? list : [];

  const handleRespond = async (id) => {
    const text = (responses[id] || '').trim();
    if (!text) return;
    setSavingId(id);
    try {
      const res = await adminRespondFeedback(id, text);
      setList((prev) => prev.map((f) => (f._id === id ? (res.feedback || { ...f, adminResponse: text }) : f)));
      setResponses((prev) => ({ ...prev, [id]: '' }));
    } catch (e) {
      alert(e.message || 'Failed to send response');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Manage Feedback</h1>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">User / Rating</th>
              <th className="text-left p-3 font-semibold text-gray-700">Message</th>
              <th className="text-left p-3 font-semibold text-gray-700">Response</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-500">No feedback.</td></tr>
            ) : (
              items.map((f) => (
                <tr key={f._id} className="border-b border-gray-50">
                  <td className="p-3 text-gray-700">{f.user?.name || f.userId || '–'} / {f.rating ?? '–'}</td>
                  <td className="p-3 text-gray-600 max-w-md">{f.message || '–'}</td>
                  <td className="p-3 text-gray-600 max-w-xs">
                    <p className="text-xs text-gray-500 mb-2">{f.adminResponse ?? 'No response yet'}</p>
                    <div className="flex gap-2">
                      <input
                        value={responses[f._id] || ''}
                        onChange={(e) => setResponses((prev) => ({ ...prev, [f._id]: e.target.value }))}
                        placeholder="Write response"
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => handleRespond(f._id)}
                        disabled={savingId === f._id}
                        className="px-2 py-1 bg-[#1F2E46] text-white rounded text-xs disabled:opacity-60"
                      >
                        {savingId === f._id ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
