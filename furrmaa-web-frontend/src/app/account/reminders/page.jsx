'use client';

import { useEffect, useState } from 'react';
import { fetchReminders, createReminder, updateReminder, deleteReminder, fetchMyPets } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

const TYPES = ['feeding', 'medication', 'grooming', 'vaccination', 'vet_visit', 'exercise', 'other'];
const emptyForm = { title: '', date: '', time: '09:00', type: 'feeding', description: '', pet: '', enabled: true };

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([fetchReminders(), fetchMyPets().catch(() => [])])
      .then(([r, p]) => { setReminders(r); setPets(p); })
      .catch(() => setReminders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) return alert('Title, date and time required');
    setSaving(true);
    try {
      await createReminder({
        title: form.title.trim(),
        date: form.date,
        time: form.time,
        type: form.type,
        description: form.description.trim() || undefined,
        pet: form.pet || undefined,
        enabled: form.enabled,
      });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (r) => {
    try {
      await updateReminder(r._id, { enabled: !r.enabled });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete reminder?')) return;
    try {
      await deleteReminder(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Reminders</h1>
        <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-[#1F2E46] text-white text-sm font-semibold">+ Add</button>
      </div>

      {loading ? <LogoLoader /> : reminders.length === 0 ? (
        <p className="text-gray-500">No reminders yet.</p>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <div key={r._id} className="border border-gray-100 rounded-2xl p-4 flex justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">{r.title}</h3>
                <p className="text-sm text-gray-500">{r.date} at {r.time} · {r.type?.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleEnabled(r)} className={`px-3 py-1 text-xs rounded-full ${r.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {r.enabled ? 'On' : 'Off'}
                </button>
                <button type="button" onClick={() => handleDelete(r._id)} className="text-red-500 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-xl font-bold">New Reminder</h2>
            <input className="w-full border rounded-xl px-4 py-2" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="border rounded-xl px-4 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input type="time" className="border rounded-xl px-4 py-2" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
            <select className="w-full border rounded-xl px-4 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            {pets.length > 0 && (
              <select className="w-full border rounded-xl px-4 py-2" value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })}>
                <option value="">No pet linked</option>
                {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            )}
            <textarea className="w-full border rounded-xl px-4 py-2" placeholder="Notes" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-xl">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#1F2E46] text-white rounded-xl font-semibold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
