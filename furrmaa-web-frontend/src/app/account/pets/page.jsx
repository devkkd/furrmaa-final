'use client';

import { useEffect, useState } from 'react';
import { fetchMyPets, createPet, updatePet, deletePet } from '@/lib/api';

const emptyForm = { name: '', type: 'dog', breed: '', age: '', gender: 'male' };

export default function MyPetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchMyPets()
      .then(setPets)
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (pet) => {
    setEditingId(pet._id);
    setForm({
      name: pet.name || '',
      type: pet.type || 'dog',
      breed: pet.breed || '',
      age: pet.age ?? '',
      gender: pet.gender || 'male',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Pet name is required');
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        type: form.type,
        breed: form.breed.trim() || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
      };
      if (editingId) await updatePet(editingId, body);
      else await createPet(body);
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message || 'Failed to save pet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pet?')) return;
    try {
      await deletePet(id);
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Pets</h1>
        <button type="button" onClick={openAdd} className="px-4 py-2 rounded-xl bg-[#1F2E46] text-white text-sm font-semibold">
          + Add Pet
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading pets...</p>
      ) : pets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No pets added yet.</p>
          <button type="button" onClick={openAdd} className="text-[#1F2E46] font-bold">Add your first pet →</button>
        </div>
      ) : (
        <div className="space-y-4">
          {pets.map((pet) => (
            <div key={pet._id} className="border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{pet.type}{pet.breed ? ` · ${pet.breed}` : ''}{pet.age != null ? ` · ${pet.age} yrs` : ''}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(pet)} className="px-3 py-1.5 text-sm border rounded-lg">Edit</button>
                <button type="button" onClick={() => handleDelete(pet._id)} className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Pet' : 'Add Pet'}</h2>
            <input className="w-full border rounded-xl px-4 py-2" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="w-full border rounded-xl px-4 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
            <input className="w-full border rounded-xl px-4 py-2" placeholder="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
            <input className="w-full border rounded-xl px-4 py-2" type="number" placeholder="Age (years)" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <select className="w-full border rounded-xl px-4 py-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-xl">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#1F2E46] text-white rounded-xl font-semibold">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
