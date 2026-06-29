'use client';

import { useEffect, useState } from 'react';
import {
  adminGetCremationCenters,
  adminCreateCremationCenter,
  adminUpdateCremationCenter,
  adminDeleteCremationCenter,
} from '@/lib/api';

const empty = { name: '', address: '', city: '', state: '', phone: '', description: '', isActive: true };

export default function AdminCremationCentersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetCremationCenters().then(setList).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name || '', address: c.address || '', city: c.city || '', state: c.state || '',
      phone: c.phone || '', description: c.description || '', isActive: c.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await adminUpdateCremationCenter(editingId, form);
      else await adminCreateCremationCenter(form);
      setShowForm(false);
      setEditingId(null);
      setForm(empty);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete center?')) return;
    try {
      await adminDeleteCremationCenter(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cremation Centers</h1>
        <button type="button" onClick={() => { setEditingId(null); setForm(empty); setShowForm(true); }} className="px-4 py-2 bg-[#1F2E46] text-white rounded-lg text-sm">+ Add</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c._id} className="bg-white border rounded-lg p-4 flex justify-between gap-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-500">{c.address}, {c.city}, {c.state}</p>
                <p className="text-xs text-gray-400">{c.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(c)} className="text-sm px-3 py-1 border rounded">Edit</button>
                <button type="button" onClick={() => handleDelete(c._id)} className="text-sm px-3 py-1 border border-red-200 text-red-600 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3">
            <h2 className="font-bold text-lg">{editingId ? 'Edit' : 'Add'} Center</h2>
            {['name', 'address', 'city', 'state', 'phone'].map((f) => (
              <input key={f} className="w-full border rounded-lg px-3 py-2" placeholder={f} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f !== 'phone'} />
            ))}
            <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#1F2E46] text-white rounded-lg">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
