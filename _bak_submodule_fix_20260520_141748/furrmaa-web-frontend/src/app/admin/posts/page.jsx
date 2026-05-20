'use client';

import { useState, useEffect } from 'react';
import { adminGetPosts, adminDeletePost, adminCreatePost, adminUpdatePost } from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ content: '', images: '', userId: '', petId: '' });

  const fetchPosts = () => {
    adminGetPosts()
      .then((list) => setPosts(Array.isArray(list) ? list : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!form.content?.trim()) {
      alert('Content is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { content: form.content.trim(), user: form.userId?.trim() || undefined, pet: form.petId?.trim() || undefined };
      if (form.images?.trim()) payload.images = form.images.split(',').map((u) => u.trim()).filter(Boolean);
      await adminCreatePost(payload);
      setForm({ content: '', images: '', userId: '', petId: '' });
      setShowAddForm(false);
      setEditingId(null);
      fetchPosts();
    } catch (e) {
      alert(e.message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setForm({
      content: post.content || '',
      images: (post.images || []).join(', '),
      userId: post.user?._id || '',
      petId: post.pet?._id || '',
    });
    setShowAddForm(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editingId || !form.content?.trim()) return;
    setSaving(true);
    try {
      const payload = { content: form.content.trim() };
      payload.images = form.images?.trim() ? form.images.split(',').map((u) => u.trim()).filter(Boolean) : [];
      await adminUpdatePost(editingId, payload);
      setForm({ content: '', images: '', userId: '', petId: '' });
      setEditingId(null);
      setShowAddForm(false);
      fetchPosts();
    } catch (e) {
      alert(e.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await adminDeletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Feed Posts</h1>
        <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="bg-[#1F2E46] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
          {showAddForm ? 'Cancel' : '+ Add Post'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Post' : 'Add Post'}</h2>
          <form onSubmit={editingId ? handleUpdatePost : handleAddPost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[100px]" placeholder="Post content" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma-separated)</label>
              <input type="text" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="https://..., https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID (optional)</label>
              <input type="text" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="User ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet ID (optional)</label>
              <input type="text" value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Pet ID" />
            </div>
            <button type="submit" disabled={saving} className="bg-[#1F2E46] text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-70">{saving ? 'Saving…' : editingId ? 'Update Post' : 'Create Post'}</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">No posts.</p>
        ) : (
          posts.map((p) => (
            <div key={p._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center text-xl">
                  {p.user?.profileImage ? (
                    <AdminImage src={p.user.profileImage} alt={p.user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{p.user?.name || 'User'}</p>
                  {p.pet?.name && <p className="text-xs text-gray-500">{p.pet.name}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
              <div className="px-4 pb-2">
                <p className="text-sm text-gray-700 line-clamp-3">{p.content || '–'}</p>
              </div>
              {p.images?.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video max-h-48">
                    <AdminImage src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  {p.images.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">+{p.images.length - 1} more</p>
                  )}
                </div>
              )}
              <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-sm text-gray-500">❤️ {p.likes?.length ?? 0} &nbsp; 💬 {p.comments?.length ?? 0}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => startEdit(p)} className="text-sm text-blue-600 hover:underline font-medium">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(p._id)} className="text-sm text-red-600 hover:underline font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
