'use client';

import { useEffect, useState } from 'react';
import { adminGetBookings, adminUpdateBookingStatus } from '@/lib/api';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function AdminBookingsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetBookings().then(setList).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminUpdateBookingStatus(id, { status });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>
      {loading ? <p>Loading...</p> : list.length === 0 ? <p className="text-gray-500">No bookings.</p> : (
        <div className="space-y-3">
          {list.map((b) => (
            <div key={b._id} className="bg-white border rounded-lg p-4">
              <p className="font-semibold capitalize">{b.serviceType} · {b.status}</p>
              <p className="text-sm text-gray-600">{b.user?.name} · {b.serviceProvider?.name}</p>
              <p className="text-sm text-gray-500">{b.pet?.name} · {b.date ? new Date(b.date).toLocaleDateString('en-IN') : ''} {b.time}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => updateStatus(b._id, s)} className="text-xs px-2 py-1 border rounded capitalize">{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
