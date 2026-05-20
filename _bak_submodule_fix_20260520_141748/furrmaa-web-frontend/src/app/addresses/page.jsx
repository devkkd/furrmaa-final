'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import { fetchAddresses, createAddress } from '@/lib/api';

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

const initialForm = {
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  landmark: '',
  type: 'home',
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAddresses();
      setAddresses(list);
    } catch (_) {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectAddress = (id) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedAddressId', id);
    }
    router.push('/cart');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError('Please log in to add an address.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createAddress({
        name: form.name.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        landmark: form.landmark.trim() || undefined,
        type: form.type,
        isDefault: form.isDefault,
      });
      setForm(initialForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message || 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-12 bg-white min-h-screen">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Addresses</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setShowForm(true); setError(null); }}
              className="bg-[#1F2E46] text-white font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition"
            >
              + Add New Address
            </button>
            <Link
              href="/cart"
              className="text-[#1F2E46] font-semibold hover:underline"
            >
              Back to Cart
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Address</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F2E46] focus:border-[#1F2E46]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F2E46] focus:border-[#1F2E46]"
                  placeholder="10-digit mobile"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street / Area *</label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F2E46] focus:border-[#1F2E46]"
                  placeholder="House no., building, street, area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F2E46] focus:border-[#1F2E46]"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F2E46] focus:border-[#1F2E46]"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F2E46] focus:border-[#1F2E46]"
                  placeholder="Pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F2E46] focus:border-[#1F2E46]"
                  placeholder="Near park, shop, etc."
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#1F2E46] rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </label>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#1F2E46] text-white font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(initialForm); setError(null); }}
                  className="bg-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-600 mb-4">No addresses saved. Add one to deliver orders.</p>
            <p className="text-sm text-gray-500 mb-6">
              Click <strong>Add New Address</strong> above to add your first delivery address.
            </p>
            <Link href="/cart" className="text-[#1F2E46] font-medium hover:underline">Back to Cart</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-4 border border-gray-200 rounded-xl hover:border-[#1F2E46] transition"
              >
                <p className="font-semibold text-gray-900">{addr.name}, {addr.phone}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                </p>
                <button
                  type="button"
                  onClick={() => selectAddress(addr._id)}
                  className="mt-3 text-sm font-medium text-[#1F2E46] hover:underline"
                >
                  Use this address
                </button>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
