'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyPets, fetchMedicalHistory, addMedicalRecord } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

export default function PetHealthPage() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ condition: '', treatment: '', date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyPets()
      .then((p) => {
        setPets(p);
        if (p[0]) setSelectedPet(p[0]._id);
      })
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPet) { setHistory([]); return; }
    fetchMedicalHistory(selectedPet)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [selectedPet]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedPet || !form.condition.trim()) return alert('Condition is required');
    setSaving(true);
    try {
      await addMedicalRecord(selectedPet, {
        condition: form.condition.trim(),
        treatment: form.treatment.trim() || undefined,
        date: form.date || new Date().toISOString(),
      });
      setForm({ condition: '', treatment: '', date: '' });
      const h = await fetchMedicalHistory(selectedPet);
      setHistory(h);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pet = pets.find((p) => p._id === selectedPet);

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Pet Health</h1>

      {loading ? <LogoLoader /> : pets.length === 0 ? (
        <p className="text-gray-500">Add a pet in <Link href="/account/pets" className="text-[#1F2E46] font-semibold">My Pets</Link> first.</p>
      ) : (
        <>
          <select className="w-full max-w-sm border rounded-xl px-4 py-2 mb-6" value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)}>
            {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>

          {pet?.vaccinations?.length > 0 && (
            <div className="mb-8">
              <h2 className="font-bold text-gray-900 mb-3">Vaccinations</h2>
              <div className="space-y-2">
                {pet.vaccinations.map((v, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3 text-sm">
                    <span className="font-semibold">{v.name}</span>
                    {v.date && <span className="text-gray-500"> · {new Date(v.date).toLocaleDateString('en-IN')}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleAdd} className="border border-gray-100 rounded-2xl p-5 mb-8 space-y-3">
            <h2 className="font-bold">Add Medical Record</h2>
            <input className="w-full border rounded-xl px-4 py-2" placeholder="Condition *" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} required />
            <input className="w-full border rounded-xl px-4 py-2" placeholder="Treatment" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
            <input type="date" className="w-full border rounded-xl px-4 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#1F2E46] text-white rounded-xl text-sm font-semibold">{saving ? 'Saving...' : 'Add Record'}</button>
          </form>

          <h2 className="font-bold text-gray-900 mb-3">Medical History</h2>
          {history.length === 0 ? <p className="text-gray-500 text-sm">No records yet.</p> : (
            <div className="space-y-3">
              {history.map((r, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <p className="font-semibold">{r.condition}</p>
                  {r.treatment && <p className="text-sm text-gray-600">{r.treatment}</p>}
                  {r.date && <p className="text-xs text-gray-400 mt-1">{new Date(r.date).toLocaleDateString('en-IN')}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
