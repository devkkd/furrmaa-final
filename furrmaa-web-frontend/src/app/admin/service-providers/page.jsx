'use client';

import { useEffect, useState } from 'react';
import { adminGetServiceProviders, adminUpdateServiceProvider } from '@/lib/api';

export default function AdminServiceProvidersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetServiceProviders().then(setList).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (p) => {
    try {
      await adminUpdateServiceProvider(p._id, { isActive: p.isActive === false });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Service Providers</h1>
      <p className="text-sm text-gray-500 mb-6">Shops, NGOs, shelters shown on Near By Vet page.</p>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p._id} className="bg-white border rounded-lg p-4 flex justify-between gap-4">
              <div>
                <p className="font-semibold">{p.name || p.businessName}</p>
                <p className="text-sm text-gray-500">{p.email} · {p.phone}</p>
                <p className="text-xs text-gray-400 capitalize">{p.serviceType || 'general'} · {p.isActive !== false ? 'Active' : 'Inactive'}</p>
              </div>
              <button type="button" onClick={() => toggleActive(p)} className="text-sm px-3 py-1 border rounded h-fit">
                {p.isActive !== false ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
