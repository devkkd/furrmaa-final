'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminGetOrders } from '@/lib/api';
import { AdminImage } from '../components/AdminImage';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading orders...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">Order</th>
              <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
              <th className="text-left p-3 font-semibold text-gray-700">Status</th>
              <th className="text-left p-3 font-semibold text-gray-700">Date</th>
              <th className="text-left p-3 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No orders yet.</td></tr>
            ) : (
              orders.map((o) => {
                const firstImg = o.items?.[0]?.product?.images?.[0] || o.items?.[0]?.product?.image;
                return (
                  <tr key={o._id} className="border-b border-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {firstImg ? (
                            <AdminImage src={firstImg} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                          )}
                        </div>
                        <span className="font-mono text-gray-600 text-sm">{o._id?.slice(-8)}</span>
                      </div>
                    </td>
                    <td className="p-3">₹{(o.totalAmount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {o.orderStatus || 'pending'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '–'}</td>
                    <td className="p-3">
                      <Link href={`/admin/orders/${o._id}`} className="text-[#1F2E46] font-medium hover:underline">View</Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
