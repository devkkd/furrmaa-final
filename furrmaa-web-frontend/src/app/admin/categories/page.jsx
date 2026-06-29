'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminUploadImage,
} from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

const TABS = [
  { id: 'shop', label: 'Shop (Products)', section: 'all', petType: 'both' },
  { id: 'everyday-dog', label: 'Everyday — Dog', section: 'everyday', petType: 'dog' },
  { id: 'everyday-cat', label: 'Everyday — Cat', section: 'everyday', petType: 'cat' },
  { id: 'wellness-dog', label: 'Wellness — Dog', section: 'wellness', petType: 'dog' },
  { id: 'wellness-cat', label: 'Wellness — Cat', section: 'wellness', petType: 'cat' },
];

function matchesTab(category, tab) {
  const section = category.section || 'all';
  const scope = category.petScope || (Array.isArray(category.petType) ? category.petType[0] : category.petType) || 'both';
  return section === tab.section && scope === tab.petType;
}

export default function AdminCategoriesPage() {
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', image: '', displayOrder: '' });

  const tab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const visibleCategories = useMemo(
    () => categories.filter((c) => matchesTab(c, tab)),
    [categories, tab]
  );

  const load = () => {
    setLoading(true);
    adminGetCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: '', image: '', displayOrder: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleImagePick = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const { url } = await adminUploadImage(file, 'furmaa/categories');
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const name = form.name?.trim();
    if (!name) {
      alert('Category name is required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name,
        image: (form.image || '').trim(),
        section: tab.section,
        petType: tab.petType,
      };
      if (form.displayOrder !== '' && Number.isFinite(Number(form.displayOrder))) {
        body.displayOrder = Number(form.displayOrder);
      }
      if (editingId) {
        await adminUpdateCategory(editingId, body);
      } else {
        await adminCreateCategory(body);
      }
      resetForm();
      load();
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id || c.id);
    setForm({
      name: c.name || '',
      image: c.image || '',
      displayOrder: c.displayOrder != null ? String(c.displayOrder) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (c) => {
    const id = c._id || c.id;
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await adminDeleteCategory(id);
      setCategories((prev) => prev.filter((x) => (x._id || x.id) !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading) return <p className="text-gray-500">Loading categories...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage shop categories and home sections separately for Dog and Cat.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Add to {tab.label}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveTab(t.id);
              resetForm();
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              activeTab === t.id
                ? 'bg-[#1F2E46] text-white border-[#1F2E46]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        Showing <strong>{tab.label}</strong>. Dog and Cat home tiles are managed separately.
        Shop tab is for product categories when adding items.
      </p>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {editingId ? 'Edit Category' : 'Add Category'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">{tab.label}</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Food, Treats, Kidney Care"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="1, 2, 3…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden hover:border-[#1F2E46]"
                >
                  {form.image ? (
                    <AdminImage src={form.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-500 text-xs px-2 text-center">
                      {uploading ? 'Uploading…' : '+ Upload'}
                    </span>
                  )}
                </button>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Or paste image URL"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#1F2E46] text-white font-medium px-5 py-2 rounded-lg disabled:opacity-70"
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 font-medium px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {visibleCategories.length === 0 ? (
        <p className="text-gray-500 bg-white border border-gray-100 rounded-xl p-8 text-center">
          No categories in {tab.label} yet. Click &quot;Add to {tab.label}&quot; above.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visibleCategories.map((c) => (
            <div
              key={c._id || c.slug}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="aspect-square bg-gray-100">
                <AdminImage src={c.image} alt={c.name || ''} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{c.slug}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        <Link href="/admin/products" className="text-[#1F2E46] font-medium hover:underline">
          Go to Products
        </Link>{' '}
        to assign shop categories when adding items.
      </p>
    </div>
  );
}
