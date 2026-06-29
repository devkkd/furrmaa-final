'use client';

import { useEffect, useState } from 'react';
import { adminGetCremationRequests, adminUpdateCremationRequestStatus } from '@/lib/api';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function AdminCremationRequestsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    adminGetCremationRequests().then(setList).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await adminUpdateCremationRequestStatus(id, status);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cremation Requests</h1>
      {loading ? <p>Loading...</p> : list.length === 0 ? <p className="text-gray-500">No requests.</p> : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r._id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between gap-4 mb-2">
                <p className="font-semibold">{r.petInformation?.petName || r.petName || 'Pet'}</p>
                <span className="text-xs capitalize bg-gray-100 px-2 py-1 rounded">{r.status}</span>
              </div>
              <p className="text-sm text-gray-600">{r.user?.name} · {r.user?.phone}</p>
              <p className="text-sm text-gray-500">{r.center?.name} · {r.center?.city}</p>
              <p className="text-xs text-gray-400 mt-1">{r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : ''}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {STATUSES.map((s) => (
                  <button key={s} type="button" disabled={updating === r._id} onClick={() => updateStatus(r._id, s)} className="text-xs px-2 py-1 border rounded capitalize">{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
