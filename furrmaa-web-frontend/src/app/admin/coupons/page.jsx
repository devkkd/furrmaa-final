'use client';

import { useEffect, useState } from 'react';
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '@/lib/api';

const empty = { code: '', description: '', discountPercent: 10, minOrderAmount: 0, maxDiscount: '', isActive: true };

export default function AdminCouponsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetCoupons().then(setList).catch((e) => alert(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountPercent: Number(form.discountPercent) || 10,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      };
      if (editingId) await adminUpdateCoupon(editingId, body);
      else await adminCreateCoupon(body);
      setShowForm(false);
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button type="button" onClick={() => { setEditingId(null); setForm(empty); setShowForm(true); }} className="px-4 py-2 bg-[#1F2E46] text-white rounded-lg text-sm">+ Add</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c._id} className="bg-white border rounded-lg p-4 flex justify-between">
              <div>
                <p className="font-bold">{c.code}</p>
                <p className="text-sm text-gray-500">{c.discountPercent}% off · min ₹{c.minOrderAmount} · {c.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingId(c._id); setForm({ ...empty, ...c, maxDiscount: c.maxDiscount ?? '' }); setShowForm(true); }} className="text-sm px-3 py-1 border rounded">Edit</button>
                <button type="button" onClick={async () => { if (confirm('Delete?')) { await adminDeleteCoupon(c._id); load(); } }} className="text-sm px-3 py-1 border border-red-200 text-red-600 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-bold">{editingId ? 'Edit' : 'Add'} Coupon</h2>
            <input className="w-full border rounded-lg px-3 py-2 uppercase" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="Min order ₹" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="Max discount ₹ (optional)" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
            <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-[#1F2E46] text-white rounded-lg">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
