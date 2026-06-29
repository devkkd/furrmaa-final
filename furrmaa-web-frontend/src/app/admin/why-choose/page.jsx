'use client';

import { useState, useEffect, useRef } from 'react';
import {
  adminGetWhyChoose,
  adminSaveWhyChooseTagline,
  adminCreateWhyChooseFeature,
  adminUpdateWhyChooseFeature,
  adminDeleteWhyChooseFeature,
  adminUploadImage,
} from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

const defaultTagline =
  'Furrmaa Is Built To Simplify Pet Parenting Without Compromising Care, Safety, Or Love.';

export default function AdminWhyChoosePage() {
  const fileRef = useRef(null);
  const [features, setFeatures] = useState([]);
  const [tagline, setTagline] = useState(defaultTagline);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingTagline, setSavingTagline] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '', displayOrder: '0', isActive: true });

  const load = () => {
    setLoading(true);
    adminGetWhyChoose()
      .then((d) => {
        setFeatures(Array.isArray(d.features) ? d.features : []);
        setTagline(d.tagline || defaultTagline);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', image: '', displayOrder: '0', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleImagePick = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const { url } = await adminUploadImage(file, 'furmaa/why-choose');
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSaveTagline = async () => {
    setSavingTagline(true);
    try {
      await adminSaveWhyChooseTagline(tagline);
      alert('Tagline saved');
    } catch (e) {
      alert(e.message || 'Failed to save tagline');
    } finally {
      setSavingTagline(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      alert('Title is required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: (form.description || '').trim(),
        image: (form.image || '').trim(),
        displayOrder: parseInt(form.displayOrder, 10) || 0,
        isActive: !!form.isActive,
      };
      if (editingId) {
        await adminUpdateWhyChooseFeature(editingId, body);
      } else {
        await adminCreateWhyChooseFeature(body);
      }
      resetForm();
      load();
    } catch (e) {
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f) => {
    setEditingId(f._id);
    setForm({
      title: f.title || '',
      description: f.description || '',
      image: f.image || '',
      displayOrder: String(f.displayOrder ?? 0),
      isActive: f.isActive !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feature?')) return;
    try {
      await adminDeleteWhyChooseFeature(id);
      setFeatures((prev) => prev.filter((f) => f._id !== id));
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Why Choose Furrmaa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage homepage section: &quot;Why Pet Parents Choose Furrmaa&quot; (website + app).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add Feature
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Section tagline</h2>
        <textarea
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
        />
        <button
          type="button"
          onClick={handleSaveTagline}
          disabled={savingTagline}
          className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-70"
        >
          {savingTagline ? 'Saving…' : 'Save tagline'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-lg">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit feature' : 'Add feature'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <textarea
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                rows={2}
                placeholder="e.g. Trusted Vet&#10;Network"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Use Enter for line break on card</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Short text shown under the title on homepage"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon image</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden"
                >
                  {form.image ? (
                    <AdminImage src={form.image} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-500">{uploading ? '…' : '+ Upload'}</span>
                  )}
                </button>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Or image URL"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active (show on website & app)
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="bg-[#1F2E46] text-white px-5 py-2 rounded-lg disabled:opacity-70">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-200 px-5 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {features.length === 0 ? (
        <p className="text-gray-500 bg-white border rounded-xl p-8 text-center">
          No features yet. Add icons + titles for the homepage section.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {features.map((f) => (
            <div key={f._id} className="bg-white border rounded-xl overflow-hidden">
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                <AdminImage src={f.image} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium whitespace-pre-line">{f.title}</p>
                {f.description ? (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3">{f.description}</p>
                ) : null}
                <p className="text-xs text-gray-400 mt-1">Order: {f.displayOrder ?? 0}</p>
                <p className="text-xs mt-1">{f.isActive === false ? 'Hidden' : 'Active'}</p>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => handleEdit(f)} className="flex-1 text-xs py-1.5 bg-gray-100 rounded-lg">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(f._id)} className="flex-1 text-xs py-1.5 bg-red-50 text-red-700 rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
