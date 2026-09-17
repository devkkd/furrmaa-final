'use client';

import { useState, useEffect, useRef } from 'react';
import {
  adminGetHopePosts,
  adminCreateHopePost,
  adminUpdateHopePostStatus,
  adminDeleteHopePost,
  adminUploadImage,
} from '@/lib/api';
import { AdminImage } from '../components/AdminImage';
import LocationAutocomplete from '@/components/LocationAutocomplete';

const MAIN_TYPES = [
  { key: 'lostFound', label: 'Lost & Found' },
  { key: 'adoption', label: 'Adoption' },
];

const PET_SUBS = [
  { key: 'all', label: 'All' },
  { key: 'dog', label: 'Dog' },
  { key: 'cat', label: 'Cat' },
];

export default function AdminHopePostsPage() {
  const photoRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [filterMain, setFilterMain] = useState('all'); // all | lostFound | adoption
  const [filterPet, setFilterPet] = useState('all'); // all | dog | cat

  const [form, setForm] = useState({
    postType: 'lostFound',
    petType: 'dog',
    petName: '',
    petAgeText: '',
    locationText: '',
    description: '',
    image: '',
  });

  const fetchList = () => {
    setLoading(true);
    const params = {};
    if (filterMain !== 'all') params.postType = filterMain;
    if (filterPet !== 'all') params.petType = filterPet;
    adminGetHopePosts(params)
      .then((list) => setPosts(Array.isArray(list) ? list : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [filterMain, filterPet]);

  const resetForm = () => {
    setForm({
      postType: 'lostFound',
      petType: 'dog',
      petName: '',
      petAgeText: '',
      locationText: '',
      description: '',
      image: '',
    });
    setShowForm(false);
  };

  const handlePhoto = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const { url } = await adminUploadImage(file, 'furmaa/hope');
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (photoRef.current) photoRef.current.value = '';
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.petName.trim() || !form.locationText.trim()) {
      alert('Pet name and location are required.');
      return;
    }
    setSaving(true);
    try {
      await adminCreateHopePost({
        postType: form.postType,
        petType: form.petType,
        petName: form.petName.trim(),
        petAgeText: form.petAgeText.trim() || undefined,
        locationText: form.locationText.trim(),
        description: form.description.trim() || undefined,
        images: form.image ? [form.image] : undefined,
      });
      resetForm();
      fetchList();
    } catch (err) {
      alert(err.message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await adminUpdateHopePostStatus(id, status);
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await adminDeleteHopePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading && posts.length === 0) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const list = Array.isArray(posts) ? posts : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Hope Posts</h1>
        <button
          type="button"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
        >
          {showForm ? 'Cancel' : '+ Add Hope Post'}
        </button>
      </div>

      {/* Filters — same hierarchy as customer */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterMain('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filterMain === 'all' ? 'bg-[#1F2E46] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All types
          </button>
          {MAIN_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilterMain(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filterMain === t.key ? 'bg-[#1F2E46] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {PET_SUBS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilterPet(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium ${
                filterPet === t.key ? 'bg-[#1F2E46] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Add Hope Post</h2>
          <p className="text-xs text-gray-500 mb-4">
            Pehle type choose karo (Lost & Found / Adoption), phir pet (Dog / Cat).
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1. Post type *</label>
              <div className="flex gap-2 flex-wrap">
                {MAIN_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setForm({ ...form, postType: t.key })}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      form.postType === t.key
                        ? 'bg-[#1F2E46] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2. Pet type *</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'dog', label: 'Dog' },
                  { key: 'cat', label: 'Cat' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setForm({ ...form, petType: t.key })}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      form.petType === t.key
                        ? 'bg-[#1F2E46] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet name *</label>
              <input
                type="text"
                value={form.petName}
                onChange={(e) => setForm({ ...form, petName: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Bruno"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="text"
                value={form.petAgeText}
                onChange={(e) => setForm({ ...form, petAgeText: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 2 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <LocationAutocomplete
                value={form.locationText}
                onChange={(locationText) => setForm({ ...form, locationText })}
                onPlaceSelect={(p) => setForm({ ...form, locationText: p.label })}
                placeholder="City / area"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                placeholder="Short details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                disabled={uploading}
                className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden"
              >
                {form.image ? (
                  <AdminImage src={form.image} alt="Pet" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">{uploading ? 'Uploading…' : '+ Photo'}</span>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-70"
            >
              {saving ? 'Saving…' : 'Publish Hope Post'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">No hope posts.</p>
        ) : (
          list.map((p) => {
            const imageUri = p.images?.[0];
            const emoji = p.petType === 'cat' ? '🐱' : '🐕';
            const typeLabel = p.postType === 'adoption' ? 'Adoption' : 'Lost & Found';
            return (
              <div key={p._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-3xl">
                    {imageUri ? (
                      <AdminImage src={imageUri} alt={p.petName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{p.petName || 'Pet'}</p>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#1F2E46]/10 text-[#1F2E46]">
                        {typeLabel}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {p.petType || '–'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{p.locationText || '–'}</p>
                    <p className="text-xs text-gray-500">{p.user?.name || 'Unknown'}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                        p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {p.status || 'open'}
                    </span>
                  </div>
                </div>
                {p.description && (
                  <div className="px-4 pb-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                  </div>
                )}
                <div className="px-4 py-3 flex gap-2 border-t border-gray-100">
                  {p.status !== 'closed' && (
                    <button
                      type="button"
                      onClick={() => handleStatus(p._id, 'closed')}
                      className="text-sm font-medium text-amber-600 hover:underline"
                    >
                      Close
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
