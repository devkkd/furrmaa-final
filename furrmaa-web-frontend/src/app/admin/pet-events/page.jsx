'use client';

import { useState, useEffect } from 'react';
import { adminGetPetEvents, adminCreatePetEvent, adminUpdatePetEvent, adminDeletePetEvent } from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

const TABS = ['list', 'add', 'edit', 'delete'];

export default function AdminPetEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    dateText: '',
    venue: '',
    city: '',
    posterUrl: '',
    image2Url: '',
    description: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = () => {
    adminGetPetEvents()
      .then((d) => setEvents(d.events || d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      dateText: '',
      venue: '',
      city: '',
      posterUrl: '',
      image2Url: '',
      description: '',
      isActive: true,
    });
    setEditingId(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.dateText?.trim() || !form.venue?.trim() || !form.city?.trim()) {
      alert('Title, Date, Venue and City are required.');
      return;
    }
    setSaving(true);
    try {
      const images = [form.posterUrl?.trim(), form.image2Url?.trim()].filter(Boolean);
      await adminCreatePetEvent({
        title: form.title.trim(),
        dateText: form.dateText.trim(),
        venue: form.venue.trim(),
        city: form.city.trim(),
        posterUrl: images[0] || undefined,
        images: images.length ? images : undefined,
        description: form.description?.trim() || undefined,
        isActive: !!form.isActive,
      });
      resetForm();
      setActiveTab('list');
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (ev) => {
    setEditingId(ev._id);
    setForm({
      title: ev.title || '',
      dateText: ev.dateText || ev.date || '',
      venue: ev.venue || '',
      city: ev.city || '',
      posterUrl: ev.posterUrl || ev.images?.[0] || '',
      image2Url: ev.images?.[1] || '',
      description: ev.description || '',
      isActive: ev.isActive !== false,
    });
    setActiveTab('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !form.title?.trim() || !form.dateText?.trim() || !form.venue?.trim() || !form.city?.trim()) {
      alert('Title, Date, Venue and City are required.');
      return;
    }
    setSaving(true);
    try {
      const images = [form.posterUrl?.trim(), form.image2Url?.trim()].filter(Boolean);
      await adminUpdatePetEvent(editingId, {
        title: form.title.trim(),
        dateText: form.dateText.trim(),
        venue: form.venue.trim(),
        city: form.city.trim(),
        posterUrl: images[0] || undefined,
        images: images.length ? images : undefined,
        description: form.description?.trim() || undefined,
        isActive: !!form.isActive,
      });
      resetForm();
      setActiveTab('list');
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title || 'event'}"?`)) return;
    try {
      await adminDeletePetEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const list = Array.isArray(events) ? events : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Pet Events</h1>

      {/* Tabs – same as app */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); if (tab !== 'add' && tab !== 'edit') resetForm(); }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab ? 'bg-[#1F2E46] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Add form */}
      {(activeTab === 'add' || (activeTab === 'edit' && editingId)) && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Event' : 'Add Event'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Event title" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="text" value={form.dateText} onChange={(e) => setForm({ ...form, dateText: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 15 March 2025" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Venue name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="City" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poster / Image 1 URL</label>
              <input type="url" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image 2 URL</label>
              <input type="url" value={form.image2Url} onChange={(e) => setForm({ ...form, image2Url: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="Event details..." rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active (show on app/web)</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-70">
                {saving ? 'Saving…' : editingId ? 'Update Event' : 'Add Event'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { resetForm(); setActiveTab('list'); }} className="bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-300">Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* List / Delete view */}
      {(activeTab === 'list' || activeTab === 'edit' || activeTab === 'delete') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">No events yet. Use Add tab to create one.</p>
          ) : (
            list.map((ev) => (
              <div key={ev._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-gray-100 relative">
                  {ev.posterUrl || ev.images?.[0] ? (
                    <AdminImage src={ev.posterUrl || ev.images?.[0]} alt={ev.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🐶🎉</div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${ev.isActive ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}`}>
                    {ev.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{ev.title || '–'}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{ev.dateText || ev.date || '–'}</p>
                  <p className="text-sm text-gray-500">📍 {ev.venue || '–'}, {ev.city || '–'}</p>
                  <div className="flex gap-2 mt-3">
                    {(activeTab === 'list' || activeTab === 'edit') && (
                      <button type="button" onClick={() => handleEditClick(ev)} className="text-sm font-medium text-[#1F2E46] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">Edit</button>
                    )}
                    {(activeTab === 'list' || activeTab === 'delete') && (
                      <button type="button" onClick={() => handleDelete(ev._id, ev.title)} className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
