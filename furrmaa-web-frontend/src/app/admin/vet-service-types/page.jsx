'use client';

import { useState, useEffect } from 'react';
import { adminGetVetServiceTypes, adminDeleteVetServiceType, adminCreateVetServiceType, adminUpdateVetServiceType } from '@/lib/api';

const SOURCE_OPTIONS = [
  { value: 'veterinarian', label: 'Veterinarian' },
  { value: 'service_provider', label: 'Service Provider (Pet Shops, Hospitals, etc.)' },
  { value: 'cremation', label: 'Pet Cremation' },
];

export default function AdminVetServiceTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', source: 'service_provider', order: '0' });

  const fetchTypes = () => {
    adminGetVetServiceTypes()
      .then(setTypes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const resetForm = () => {
    setForm({ name: '', slug: '', source: 'service_provider', order: '0' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert('Name is required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug?.trim() || form.name.trim(),
        source: form.source,
        order: parseInt(form.order, 10) || 0,
      };
      if (editingId) {
        await adminUpdateVetServiceType(editingId, body);
      } else {
        await adminCreateVetServiceType(body);
      }
      resetForm();
      fetchTypes();
    } catch (e) {
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t._id || t.id);
    setForm({
      name: t.name || '',
      slug: t.slug || t.name || '',
      source: t.source || 'service_provider',
      order: String(t.order ?? 0),
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await adminDeleteVetServiceType(id);
      setTypes((prev) => prev.filter((t) => (t._id || t.id) !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vet Service Types</h1>
        <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
          + Add Type
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Type' : 'Add Type'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Pet Shops" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Auto from name if empty" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
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
              <th className="text-left p-3 font-semibold text-gray-700">Name</th>
              <th className="text-left p-3 font-semibold text-gray-700">Slug</th>
              <th className="text-left p-3 font-semibold text-gray-700">Source</th>
              <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No types. Click Add Type to create one.</td></tr>
            ) : (
              types.map((t) => (
                <tr key={t._id || t.id} className="border-b border-gray-50">
                  <td className="p-3 font-medium text-gray-900">{t.name}</td>
                  <td className="p-3 text-gray-600">{t.slug || '–'}</td>
                  <td className="p-3 text-gray-600">{t.source || '–'}</td>
                  <td className="p-3 flex gap-2">
                    <button type="button" onClick={() => handleEdit(t)} className="text-[#1F2E46] hover:underline">Edit</button>
                    <button type="button" onClick={() => handleDelete(t._id || t.id, t.name)} className="text-red-600 hover:underline">Delete</button>
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
