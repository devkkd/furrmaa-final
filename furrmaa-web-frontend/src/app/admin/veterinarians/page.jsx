'use client';

import { useState, useEffect, useRef } from 'react';
import {
  adminGetVeterinarians,
  adminDeleteVeterinarian,
  adminCreateVeterinarian,
  adminUpdateVeterinarian,
  adminUploadImage,
  adminGetVetServiceTypes,
} from '@/lib/api';
import { AdminImage } from '../components/AdminImage';
import LocationAutocomplete from '@/components/LocationAutocomplete';

const FALLBACK_TYPES = [
  'Veterinarians',
  'Pet Shops',
  'Hospitals',
  'Pet Hotels / Hostels',
  'NGOs',
  'Shelters',
  'Rescue Centers',
  'Pet Cremation',
];

function parseCityState(label) {
  const parts = String(label || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const skip = /municipal|corporation|district|division|tehsil|taluka|india/i;
  const cityPart = parts.find((p) => !skip.test(p)) || parts[0] || '';
  const cityWord = cityPart.split(/\s+/).find((w) => w.length >= 3 && !skip.test(w)) || cityPart;
  const state =
    parts.find((p) =>
      /pradesh|rajasthan|gujarat|maharashtra|delhi|bengal|karnataka|tamil|punjab|haryana|bihar|odisha|kerala|goa|assam|uttarakhand|telangana|andhra|madhya|chhattisgarh|jharkhand|himachal/i.test(
        p
      )
    ) || '';
  return { city: cityWord, state };
}

function buildAddress(locationLabel, placeMeta, coords) {
  const label = String(locationLabel || '').trim();
  if (!label) return undefined;
  const fromPlace = placeMeta || {};
  const parsed = parseCityState(label);
  const city = (fromPlace.city || parsed.city || '').trim();
  const state = (fromPlace.state || parsed.state || '').trim();
  const lat = coords?.lat ?? fromPlace.lat ?? null;
  const lng = coords?.lng ?? fromPlace.lng ?? null;
  return {
    street: label,
    city: city || label.split(',')[0]?.trim() || label,
    state: state || undefined,
    ...(lat != null && lng != null ? { latitude: lat, longitude: lng } : {}),
  };
}

function formatAddress(addr) {
  if (!addr) return '–';
  if (typeof addr === 'string') return addr;
  return [addr.street, addr.city, addr.state].filter(Boolean).join(', ') || '–';
}

export default function AdminVeterinariansPage() {
  const photoInputRef = useRef(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [typeOptions, setTypeOptions] = useState(FALLBACK_TYPES);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    profileImage: '',
    serviceType: 'Veterinarians',
  });
  const [locationCoords, setLocationCoords] = useState({ lat: null, lng: null });
  const [placeMeta, setPlaceMeta] = useState({ city: '', state: '' });

  const fetchList = () => {
    adminGetVeterinarians()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
    adminGetVetServiceTypes()
      .then((types) => {
        const names = (types || []).map((t) => t.name).filter(Boolean);
        if (names.length) {
          const merged = [...new Set([...FALLBACK_TYPES, ...names])];
          setTypeOptions(merged);
        }
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setForm({ name: '', phone: '', location: '', profileImage: '', serviceType: 'Veterinarians' });
    setLocationCoords({ lat: null, lng: null });
    setPlaceMeta({ city: '', state: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert('Name is required.');
      return;
    }
    if (!form.location?.trim()) {
      alert('Location is required so customers can find this service nearby.');
      return;
    }
    if (!form.serviceType?.trim()) {
      alert('Category / Service Type is required.');
      return;
    }
    setSaving(true);
    try {
      const email = `vet_${(form.phone?.trim() || Date.now()).toString().replace(/\D/g, '')}@farmaa.local`;
      const address = buildAddress(form.location, placeMeta, locationCoords);
      await adminCreateVeterinarian({
        name: form.name.trim(),
        email,
        phone: form.phone?.trim() || undefined,
        address,
        profileImage: form.profileImage?.trim() || undefined,
        serviceType: form.serviceType.trim(),
      });
      resetForm();
      fetchList();
    } catch (err) {
      alert(err.message || 'Failed to add veterinarian');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (v) => {
    setEditingId(v._id);
    const loc = v.address?.street || [v.address?.city, v.address?.state].filter(Boolean).join(', ') || '';
    setForm({
      name: v.name || '',
      phone: v.phone || '',
      location: loc,
      profileImage: v.profileImage || '',
      serviceType: v.serviceType || 'Veterinarians',
    });
    setLocationCoords({
      lat: v.address?.latitude ?? null,
      lng: v.address?.longitude ?? null,
    });
    setPlaceMeta({
      city: v.address?.city || '',
      state: v.address?.state || '',
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    if (!form.location?.trim()) {
      alert('Location is required so customers can find this service nearby.');
      return;
    }
    if (!form.serviceType?.trim()) {
      alert('Category / Service Type is required.');
      return;
    }
    setSaving(true);
    try {
      const address = buildAddress(form.location, placeMeta, locationCoords);
      await adminUpdateVeterinarian(editingId, {
        name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
        address,
        profileImage: form.profileImage?.trim() || undefined,
        serviceType: form.serviceType.trim(),
      });
      resetForm();
      fetchList();
    } catch (err) {
      alert(err.message || 'Failed to update veterinarian');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}"?`)) return;
    try {
      await adminDeleteVeterinarian(id);
      setList((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.message);
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
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
        >
          {showForm ? 'Cancel' : '+ Add Veterinarian'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Veterinarian' : 'Add Veterinarian'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Location + Category required — Near By page customers ko isi city / category ke hisaab se dikhega.
          </p>
          <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Dr. Rahul Sharma"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <LocationAutocomplete
                value={form.location}
                onChange={(location) => {
                  setForm({ ...form, location });
                  setLocationCoords({ lat: null, lng: null });
                  setPlaceMeta(parseCityState(location));
                }}
                onPlaceSelect={(p) => {
                  setForm({ ...form, location: p.label });
                  setPlaceMeta({ city: p.city || '', state: p.state || '' });
                  if (p.lat != null && p.lng != null) {
                    setLocationCoords({ lat: p.lat, lng: p.lng });
                  }
                }}
                placeholder="Search clinic city / address (e.g. Jaipur)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                types={['establishment', 'geocode']}
              />
              {(placeMeta.city || locationCoords.lat != null) && (
                <p className="text-xs text-emerald-700 mt-1">
                  Saved city: <strong>{placeMeta.city || '—'}</strong>
                  {placeMeta.state ? `, ${placeMeta.state}` : ''}
                  {locationCoords.lat != null ? ` · coords ok` : ''}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.serviceType}
                onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                required
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
              <input
                type="url"
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Or paste image URL"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-70"
            >
              {saving ? 'Saving…' : editingId ? 'Update Veterinarian' : 'Add Veterinarian'}
            </button>
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
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{formatAddress(v.address)}</p>
                  <p className="text-xs font-medium text-blue-700 mt-1">{v.serviceType || 'No category'}</p>
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
