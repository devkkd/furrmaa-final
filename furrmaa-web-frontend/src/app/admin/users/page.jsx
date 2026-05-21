'use client';

import { useState, useEffect } from 'react';
import { adminGetUsers, adminUpdateUser, adminDeactivateUser } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    adminGetUsers()
      .then((d) => setUsers(d.users || d || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const list = Array.isArray(users) ? users : [];

  const handleRoleChange = async (userId, role) => {
    setSavingId(userId);
    try {
      const user = await adminUpdateUser(userId, { role });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...(user || {}), role } : u)));
    } catch (e) {
      alert(e.message || 'Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user?')) return;
    setSavingId(userId);
    try {
      await adminDeactivateUser(userId);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: false } : u)));
    } catch (e) {
      alert(e.message || 'Failed to deactivate user');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">Name</th>
              <th className="text-left p-3 font-semibold text-gray-700">Email / Phone</th>
              <th className="text-left p-3 font-semibold text-gray-700">Role</th>
              <th className="text-left p-3 font-semibold text-gray-700">Status / Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No users.</td></tr>
            ) : (
              list.map((u) => (
                <tr key={u._id} className="border-b border-gray-50">
                  <td className="p-3 font-medium text-gray-900">{u.name || '–'}</td>
                  <td className="p-3 text-gray-600">{u.email || u.phone || '–'}</td>
                  <td className="p-3 text-gray-600">
                    <select
                      value={u.role || 'user'}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={savingId === u._id}
                      className="border border-gray-200 rounded px-2 py-1 text-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${u.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {u.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                      {u.isActive !== false && (
                        <button
                          onClick={() => handleDeactivate(u._id)}
                          disabled={savingId === u._id}
                          className="text-xs px-2 py-1 border border-red-200 text-red-700 rounded"
                        >
                          Deactivate
                        </button>
                      )}
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
