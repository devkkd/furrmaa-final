'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminGetDashboard } from '@/lib/api';
import { AdminImage } from './components/AdminImage';

const actionLinks = [
  { href: '/admin/products', icon: '📦', title: 'Manage Products', subtitle: 'Add, edit, or delete products' },
  { href: '/admin/orders', icon: '📋', title: 'Manage Orders', subtitle: 'View and update order status' },
  { href: '/admin/training-videos', icon: '🎓', title: 'Training Videos', subtitle: 'Add, edit, or delete training videos' },
  { href: '/admin/posts', icon: '📱', title: 'Manage Feed Posts', subtitle: 'View, edit, or delete social feed posts' },
  { href: '/admin/veterinarians', icon: '🏥', title: 'Manage Veterinarians', subtitle: 'Add, edit, or deactivate veterinarians' },
  { href: '/admin/vet-service-types', icon: '📋', title: 'Vet Service Types', subtitle: 'Pet Shops, Hospitals, NGOs, etc.' },
  { href: '/admin/hope-posts', icon: '🐾', title: 'Manage Hope Posts', subtitle: 'Lost & Found, Adoption – edit or close' },
  { href: '/admin/pet-events', icon: '📅', title: 'Manage Pet Events', subtitle: 'Add, edit, or delete pet events' },
  { href: '/admin/users', icon: '👥', title: 'Manage Users', subtitle: 'View, edit, or deactivate users' },
  { href: '/admin/faq', icon: '❓', title: 'Manage FAQs', subtitle: 'Add, edit, or delete FAQs' },
  { href: '/admin/feedback', icon: '👍', title: 'Manage Feedback', subtitle: 'View and respond to feedback' },
  { href: '/admin/support', icon: '💬', title: 'Support Chats', subtitle: 'Manage customer support chats' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGetDashboard()
      .then((d) => setStats(d.stats || null))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Link href="/admin/login" className="inline-block mt-4 text-[#1F2E46] font-medium">Re-login</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard value={stats?.totalUsers ?? 0} label="Total Users" />
        <StatCard value={stats?.totalProducts ?? 0} label="Total Products" />
        <StatCard value={stats?.totalOrders ?? 0} label="Total Orders" />
        <StatCard value={stats?.pendingOrders ?? 0} label="Pending Orders" />
        <StatCard value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} label="Total Revenue" />
      </div>

      {/* Quick Actions – same as app */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#1F2E46] hover:shadow-md transition"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-[#1F2E46] hover:underline">View All</Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Order</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.slice(0, 5).map((order) => {
                  const firstImg = order.items?.[0]?.product?.images?.[0] || order.items?.[0]?.product?.image;
                  return (
                    <tr key={order._id} className="border-b border-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {firstImg ? (
                              <AdminImage src={firstImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                            )}
                          </div>
                          <span className="font-mono text-gray-600 text-sm">{order._id?.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="p-3">₹{(order.totalAmount ?? 0).toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {order.orderStatus || 'pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link href={`/admin/orders/${order._id}`} className="text-[#1F2E46] font-medium hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
