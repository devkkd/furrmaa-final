'use client';

import { useState, useEffect } from 'react';
import { adminGetHopePosts, adminUpdateHopePostStatus, adminDeleteHopePost } from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

export default function AdminHopePostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetHopePosts()
      .then((list) => setPosts(Array.isArray(list) ? list : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const list = Array.isArray(posts) ? posts : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hope Posts (Lost & Found / Adoption)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">No hope posts.</p>
        ) : (
          list.map((p) => {
            const imageUri = p.images?.[0];
            const emoji = (p.petType === 'cat' ? '🐱' : '🐕');
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
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#1F2E46]/10 text-[#1F2E46] mt-1">{typeLabel}</span>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{p.locationText || '–'}</p>
                    <p className="text-xs text-gray-500">{p.user?.name || 'Unknown'}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {p.status || 'open'}
                    </span>
                    {p.reportsCount > 0 && <span className="ml-2 text-xs text-amber-600">⚠️ {p.reportsCount} reports</span>}
                  </div>
                </div>
                {p.description && (
                  <div className="px-4 pb-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                  </div>
                )}
                <div className="px-4 py-3 flex gap-2 border-t border-gray-100">
                  {p.status !== 'closed' && (
                    <button type="button" onClick={() => handleStatus(p._id, 'closed')} className="text-sm font-medium text-amber-600 hover:underline">
                      Close
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(p._id)} className="text-sm font-medium text-red-600 hover:underline">
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
