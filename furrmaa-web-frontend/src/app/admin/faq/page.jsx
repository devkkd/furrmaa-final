'use client';

import { useState, useEffect } from 'react';
import { adminGetFaqs, adminDeleteFaq, adminCreateFaq, adminUpdateFaq } from '@/lib/api';

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', order: '0', isActive: true });

  const fetchFaqs = () => {
    adminGetFaqs()
      .then((d) => setFaqs(d.faqs || d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const resetForm = () => {
    setForm({ question: '', answer: '', category: 'general', order: '0', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.question?.trim() || !form.answer?.trim()) {
      alert('Question and answer are required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category || 'general',
        order: parseInt(form.order, 10) || 0,
        isActive: !!form.isActive,
      };
      if (editingId) {
        await adminUpdateFaq(editingId, body);
      } else {
        await adminCreateFaq(body);
      }
      resetForm();
      fetchFaqs();
    } catch (e) {
      alert(e.message || 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f) => {
    setEditingId(f._id);
    setForm({
      question: f.question || '',
      answer: f.answer || '',
      category: f.category || 'general',
      order: String(f.order ?? 0),
      isActive: f.isActive !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await adminDeleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage FAQs</h1>
        <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
          + Add FAQ
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
              <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Question" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
              <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="Answer" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. general" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="faqActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label htmlFor="faqActive" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-70">{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">Question</th>
              <th className="text-left p-3 font-semibold text-gray-700">Answer</th>
              <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-500">No FAQs. Click Add FAQ to create one.</td></tr>
            ) : (
              faqs.map((f) => (
                <tr key={f._id} className="border-b border-gray-50">
                  <td className="p-3 font-medium text-gray-900 max-w-xs">{f.question || '–'}</td>
                  <td className="p-3 text-gray-600 max-w-md truncate">{f.answer || '–'}</td>
                  <td className="p-3 flex gap-2">
                    <button type="button" onClick={() => handleEdit(f)} className="text-[#1F2E46] hover:underline">Edit</button>
                    <button type="button" onClick={() => handleDelete(f._id)} className="text-red-600 hover:underline">Delete</button>
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
