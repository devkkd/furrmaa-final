'use client';

import { useState, useEffect } from 'react';
import { adminGetTrainingVideos, adminDeleteTrainingVideo, adminCreateTrainingVideo, adminUpdateTrainingVideo } from '@/lib/api';

const CATEGORY_OPTIONS = [
  { value: 'basic', label: 'Basic (Free)' },
  { value: 'intermediate', label: 'Intermediate (Premium)' },
  { value: 'advanced', label: 'Advanced (Premium)' },
];

export default function AdminTrainingVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', category: 'basic' });

  const fetchVideos = () => {
    adminGetTrainingVideos()
      .then((d) => setVideos(d.videos || d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.description?.trim() || !form.videoUrl?.trim()) {
      alert('Title, description and video URL are required.');
      return;
    }
    setSaving(true);
    try {
      await adminCreateTrainingVideo({
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        category: form.category,
        isFree: form.category === 'basic',
        isPremium: form.category !== 'basic',
      });
      setForm({ title: '', description: '', videoUrl: '', category: 'basic' });
      setShowForm(false);
      setEditingId(null);
      fetchVideos();
    } catch (e) {
      alert(e.message || 'Failed to add video');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (video) => {
    setEditingId(video._id);
    setForm({
      title: video.title || '',
      description: video.description || '',
      videoUrl: video.videoUrl || '',
      category: video.category || 'basic',
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      await adminUpdateTrainingVideo(editingId, {
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        category: form.category,
        isFree: form.category === 'basic',
        isPremium: form.category !== 'basic',
      });
      setForm({ title: '', description: '', videoUrl: '', category: 'basic' });
      setShowForm(false);
      setEditingId(null);
      fetchVideos();
    } catch (e) {
      alert(e.message || 'Failed to update video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title || 'video'}"?`)) return;
    try {
      await adminDeleteTrainingVideo(id);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const list = Array.isArray(videos) ? videos : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Training Videos</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
          {showForm ? 'Cancel' : '+ Add Video'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Training Video' : 'Add Training Video'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Video title" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" placeholder="Description" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
              <input type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="https://..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving} className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-70">{saving ? 'Saving…' : editingId ? 'Update Video' : 'Add Video'}</button>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">Title</th>
              <th className="text-left p-3 font-semibold text-gray-700">URL / Lesson</th>
              <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-500">No videos.</td></tr>
            ) : (
              list.map((v) => (
                <tr key={v._id} className="border-b border-gray-50">
                  <td className="p-3 font-medium text-gray-900">{v.title || '–'}</td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">{v.videoUrl || v.lessonId || '–'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => startEdit(v)} className="text-blue-600 hover:underline">Edit</button>
                      <button type="button" onClick={() => handleDelete(v._id, v.title)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
