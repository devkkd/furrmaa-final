'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyBookings, createBooking, fetchMyPets, fetchServiceProviders } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

const SERVICE_TYPES = ['grooming', 'training', 'walking', 'sitting', 'boarding', 'veterinary', 'other'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    serviceProvider: '', serviceType: 'grooming', pet: '', date: '', time: '10:00', amount: '0', notes: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchMyBookings(),
      fetchMyPets().catch(() => []),
      fetchServiceProviders().catch(() => []),
    ])
      .then(([b, p, pr]) => { setBookings(b); setPets(p); setProviders(pr); })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.serviceProvider || !form.pet || !form.date || !form.time) {
      return alert('Provider, pet, date and time are required');
    }
    setSaving(true);
    try {
      await createBooking({
        serviceProvider: form.serviceProvider,
        serviceType: form.serviceType,
        pet: form.pet,
        date: new Date(`${form.date}T${form.time}`),
        time: form.time,
        amount: Number(form.amount) || 0,
        notes: form.notes.trim() || undefined,
        status: 'pending',
      });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
        <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-[#1F2E46] text-white text-sm font-semibold">+ Book Service</button>
      </div>

      <p className="text-sm text-gray-500 mb-6">Or browse services on <Link href="/vet" className="text-[#1F2E46] font-semibold">Near By Vet</Link></p>

      {loading ? <LogoLoader /> : bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="border border-gray-100 rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold capitalize">{b.serviceType?.replace('_', ' ')}</h3>
                  <p className="text-sm text-gray-500">{b.serviceProvider?.name || 'Provider'} · {b.pet?.name || 'Pet'}</p>
                  <p className="text-sm text-gray-500">{b.date ? new Date(b.date).toLocaleDateString('en-IN') : ''} at {b.time}</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 capitalize">{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleBook} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-3 my-8">
            <h2 className="text-xl font-bold">Book a Service</h2>
            {pets.length === 0 && <p className="text-sm text-amber-700">Add a pet first in <Link href="/account/pets" className="underline">My Pets</Link></p>}
            <select className="w-full border rounded-xl px-4 py-2" value={form.serviceProvider} onChange={(e) => setForm({ ...form, serviceProvider: e.target.value })} required>
              <option value="">Select provider *</option>
              {providers.map((p) => <option key={p._id} value={p._id}>{p.name || p.businessName}</option>)}
            </select>
            <select className="w-full border rounded-xl px-4 py-2" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="w-full border rounded-xl px-4 py-2" value={form.pet} onChange={(e) => setForm({ ...form, pet: e.target.value })} required>
              <option value="">Select pet *</option>
              {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="border rounded-xl px-4 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input type="time" className="border rounded-xl px-4 py-2" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
            <input type="number" className="w-full border rounded-xl px-4 py-2" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <textarea className="w-full border rounded-xl px-4 py-2" placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-xl">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#1F2E46] text-white rounded-xl font-semibold">Book</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
