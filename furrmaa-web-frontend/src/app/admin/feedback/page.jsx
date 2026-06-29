'use client';

import { useState, useEffect } from 'react';
import {
  adminGetFeedback,
  adminRespondFeedback,
  adminCreateFeedback,
  adminDeleteFeedback,
  adminSetFeedbackFeatured,
} from '@/lib/api';

const emptyForm = {
  name: '',
  role: 'Pet Parent',
  subject: '',
  message: '',
  rating: 5,
  featured: true,
};

export default function AdminFeedbackPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    adminGetFeedback()
      .then((arr) => setList(Array.isArray(arr) ? arr : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      alert('Name and message are required.');
      return;
    }
    setCreating(true);
    try {
      await adminCreateFeedback({
        name: form.name.trim(),
        role: form.role.trim() || 'Pet Parent',
        subject: form.subject.trim() || 'Great Furrmaa experience',
        message: form.message.trim(),
        rating: Number(form.rating) || 5,
        featured: form.featured,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e) {
      alert(e.message || 'Failed to add feedback');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback permanently?')) return;
    setDeletingId(id);
    try {
      await adminDeleteFeedback(id);
      setList((prev) => prev.filter((f) => f._id !== id));
    } catch (e) {
      alert(e.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleFeatured = async (f) => {
    try {
      const updated = await adminSetFeedbackFeatured(f._id, !f.featured);
      setList((prev) => prev.map((item) => (item._id === f._id ? { ...item, ...updated } : item)));
    } catch (e) {
      alert(e.message || 'Failed to update');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const items = Array.isArray(list) ? list : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add testimonials for the homepage. User submissions appear below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
        >
          {showForm ? 'Close form' : '+ Add Website Feedback'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add Homepage Testimonial</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Pet Parent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Great Furrmaa experience"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y"
                placeholder="What the customer said about Furrmaa..."
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} stars</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Show on website homepage
              </label>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-[#1F2E46] text-white font-medium px-5 py-2 rounded-lg disabled:opacity-70"
            >
              {creating ? 'Saving…' : 'Publish Feedback'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">User / Rating</th>
              <th className="text-left p-3 font-semibold text-gray-700">Message</th>
              <th className="text-left p-3 font-semibold text-gray-700">Homepage</th>
              <th className="text-left p-3 font-semibold text-gray-700">Response</th>
              <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No feedback yet. Add one above.</td></tr>
            ) : (
              items.map((f) => (
                <tr key={f._id} className="border-b border-gray-50 align-top">
                  <td className="p-3 text-gray-700">
                    <p className="font-medium">{f.name || f.user?.name || '–'}</p>
                    <p className="text-xs text-gray-500">{f.role || f.userType || '–'}</p>
                    <p className="text-xs mt-1">{f.rating ? `${f.rating}★` : '–'} · {f.type || 'other'}</p>
                  </td>
                  <td className="p-3 text-gray-600 max-w-md">
                    {f.subject && <p className="font-medium text-gray-800 text-xs mb-1">{f.subject}</p>}
                    <p>{f.message || '–'}</p>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(f)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        f.featured
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {f.featured ? 'On homepage' : 'Hidden'}
                    </button>
                  </td>
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
                        {savingId === f._id ? '…' : 'Send'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(f._id)}
                      disabled={deletingId === f._id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingId === f._id ? 'Deleting…' : 'Delete'}
                    </button>
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
