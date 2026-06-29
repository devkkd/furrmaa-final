'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { submitEmergency, fetchMyPets } from '@/lib/api';
import { getToken } from '@/lib/api';
import { COMPANY_PHONE_DISPLAY } from '@/constants/contact';

const TYPES = [
  { id: 'medical', name: 'Medical Emergency', icon: '🏥' },
  { id: 'lost', name: 'Lost Pet', icon: '🔍' },
  { id: 'accident', name: 'Accident', icon: '🚨' },
  { id: 'other', name: 'Other', icon: '⚠️' },
];

export default function EmergencyPage() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [type, setType] = useState('');
  const [pet, setPet] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login?redirect=%2Femergency');
      return;
    }
    fetchMyPets().then(setPets).catch(() => setPets([]));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !pet || !description.trim()) return alert('Type, pet and description are required');
    setLoading(true);
    try {
      await submitEmergency({
        pet,
        type,
        description: description.trim(),
        location: location.trim() ? { address: location.trim() } : undefined,
        status: 'active',
        priority: type === 'medical' ? 'high' : 'medium',
      });
      alert('Emergency reported. Our team will contact you shortly.');
      setType('');
      setDescription('');
      setLocation('');
    } catch (err) {
      alert(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-10">
      <Container>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Pet Emergency</h1>
        <p className="text-gray-600 mb-2">Report an emergency and our team will respond.</p>
        <p className="text-sm text-red-600 font-semibold mb-8">For immediate help call: {COMPANY_PHONE_DISPLAY}</p>

        <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Emergency Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`border rounded-xl p-4 text-left ${type === t.id ? 'border-[#1F2E46] bg-[#1F2E46]/5' : 'border-gray-200'}`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="text-sm font-semibold mt-1">{t.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Select Pet *</label>
            {pets.length === 0 ? (
              <p className="text-sm text-amber-700">Add a pet in your account first.</p>
            ) : (
              <select className="w-full border rounded-xl px-4 py-2" value={pet} onChange={(e) => setPet(e.target.value)} required>
                <option value="">Choose pet</option>
                {pets.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea className="w-full border rounded-xl px-4 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the emergency..." required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location (optional)</label>
            <input className="w-full border rounded-xl px-4 py-2" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Your location" />
          </div>

          <button type="submit" disabled={loading || pets.length === 0} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold disabled:opacity-50">
            {loading ? 'Submitting...' : 'Report Emergency'}
          </button>
        </form>
      </Container>
    </div>
  );
}
