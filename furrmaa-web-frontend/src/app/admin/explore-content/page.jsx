'use client';

import { useEffect, useState } from 'react';
import {
  adminGetExploreContent,
  adminCreateExploreContent,
  adminUpdateExploreContent,
  adminDeleteExploreContent,
} from '@/lib/api';

const empty = { title: '', description: '', type: 'video', category: 'general', content: '', featured: false, isActive: true, order: 0, petType: 'all' };

export default function AdminExploreContentPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetExploreContent().then(setList).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, order: Number(form.order) || 0 };
      if (editingId) await adminUpdateExploreContent(editingId, body);
      else await adminCreateExploreContent(body);
      setShowForm(false);
      setEditingId(null);
      setForm(empty);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Explore / Trending Content</h1>
        <button type="button" onClick={() => { setEditingId(null); setForm(empty); setShowForm(true); }} className="px-4 py-2 bg-[#1F2E46] text-white rounded-lg text-sm">+ Add</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {list.map((item) => (
            <div key={item._id} className="bg-white border rounded-lg p-4 flex justify-between">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-500">{item.type} · {item.category} {item.featured ? '· Featured' : ''}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingId(item._id); setForm({ ...empty, ...item, order: item.order ?? 0 }); setShowForm(true); }} className="text-sm px-3 py-1 border rounded">Edit</button>
                <button type="button" onClick={async () => { if (confirm('Delete?')) { await adminDeleteExploreContent(item._id); load(); } }} className="text-sm px-3 py-1 border border-red-200 text-red-600 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 my-8">
            <h2 className="font-bold">{editingId ? 'Edit' : 'Add'} Content</h2>
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Video URL" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['article', 'video', 'tip', 'guide', 'news', 'event'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="w-full border rounded-lg px-3 py-2" value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value })}>
              <option value="all">All pets</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
            <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on homepage</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-[#1F2E46] text-white rounded-lg">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
