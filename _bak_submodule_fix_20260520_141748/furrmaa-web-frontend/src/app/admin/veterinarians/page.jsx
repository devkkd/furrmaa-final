'use client';

import { useState, useEffect, useRef } from 'react';
import { adminGetVeterinarians, adminDeleteVeterinarian, adminCreateVeterinarian, adminUpdateVeterinarian, adminUploadImage } from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

export default function AdminVeterinariansPage() {
  const photoInputRef = useRef(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '', profileImage: '', serviceType: '' });

  const fetchList = () => {
    adminGetVeterinarians()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert('Name is required.');
      return;
    }
    setSaving(true);
    try {
      const email = `vet_${(form.phone?.trim() || Date.now()).replace(/\D/g, '')}@farmaa.local`;
      const address = form.location?.trim() ? { street: form.location.trim(), city: form.location.trim() } : undefined;
      await adminCreateVeterinarian({
        name: form.name.trim(),
        email,
        phone: form.phone?.trim() || undefined,
        address,
        profileImage: form.profileImage?.trim() || undefined,
        serviceType: form.serviceType?.trim() || undefined,
      });
      setForm({ name: '', phone: '', location: '', profileImage: '', serviceType: '' });
      setShowForm(false);
      setEditingId(null);
      fetchList();
    } catch (e) {
      alert(e.message || 'Failed to add veterinarian');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (v) => {
    setEditingId(v._id);
    setForm({
      name: v.name || '',
      phone: v.phone || '',
      location: v.address?.street || v.address?.city || '',
      profileImage: v.profileImage || '',
      serviceType: v.serviceType || '',
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const address = form.location?.trim() ? { street: form.location.trim(), city: form.location.trim() } : undefined;
      await adminUpdateVeterinarian(editingId, {
        name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
        address,
        profileImage: form.profileImage?.trim() || undefined,
        serviceType: form.serviceType?.trim() || undefined,
      });
      setForm({ name: '', phone: '', location: '', profileImage: '', serviceType: '' });
      setShowForm(false);
      setEditingId(null);
      fetchList();
    } catch (e) {
      alert(e.message || 'Failed to update veterinarian');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}"?`)) return;
    try {
      await adminDeleteVeterinarian(id);
      setList((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingPhoto(true);
    try {
      const { url } = await adminUploadImage(file, 'furmaa/vets');
      setForm((f) => ({ ...f, profileImage: url }));
    } catch (err) {
      alert(err.message || 'Upload failed. You can paste image URL below.');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Veterinarians</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
          {showForm ? 'Cancel' : '+ Add Veterinarian'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Veterinarian' : 'Add Veterinarian'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Dr. Rahul Sharma" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. 9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. MG Road, Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden hover:border-[#1F2E46] hover:bg-gray-100 disabled:opacity-60 transition"
              >
                {form.profileImage ? (
                  <AdminImage src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-center text-sm font-medium px-2">
                    {uploadingPhoto ? 'Uploading…' : '+ Add Photo'}
                  </span>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1">Click to upload photo (or paste URL below)</p>
              <input
                type="url"
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Or paste image URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <input type="text" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Pet Shops, Hospitals" />
            </div>
            <button type="submit" disabled={saving} className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-70">{saving ? 'Saving…' : editingId ? 'Update Veterinarian' : 'Add Veterinarian'}</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">No veterinarians.</p>
        ) : (
          list.map((v) => (
            <div key={v._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center text-2xl">
                  {v.profileImage ? (
                    <AdminImage src={v.profileImage} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>🏥</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{v.name}</p>
                  <p className="text-sm text-gray-500">{v.phone || v.email || '–'}</p>
                  <p className="text-sm text-gray-600">{v.specialization || '–'}</p>
                  <p className="text-xs text-gray-500">{v.serviceType || '–'}</p>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => startEdit(v)}
                  className="w-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg mb-2"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v._id, v.name)}
                  className="w-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
