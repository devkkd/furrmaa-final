"use client"
import React, { useState, useEffect } from 'react';
import Container from '@/components/Container';
import { IoMdRadioButtonOn, IoMdRadioButtonOff } from 'react-icons/io';
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '@/lib/api';

const MyAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        landmark: '',
        type: 'home',
        isDefault: false,
    });

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchAddresses()
            .then((data) => {
                if (!cancelled) {
                    setAddresses(data);
                    const defaultAddr = data.find(a => a.isDefault);
                    if (defaultAddr) setSelectedId(defaultAddr._id || defaultAddr.id);
                }
            })
            .catch(() => {
                if (!cancelled) setAddresses([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const openAddForm = () => {
        setEditingAddressId(null);
        setForm({
            name: '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            landmark: '',
            type: 'home',
            isDefault: false,
        });
        setError('');
        setShowForm(true);
    };

    const openEditForm = (addr) => {
        setEditingAddressId(addr._id || addr.id);
        setForm({
            name: addr.name || '',
            phone: addr.phone || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            zipCode: addr.zipCode || '',
            landmark: addr.landmark || '',
            type: addr.type || 'home',
            isDefault: !!addr.isDefault,
        });
        setError('');
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: form.name.trim(),
                phone: form.phone.trim(),
                street: form.street.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                zipCode: form.zipCode.trim(),
                landmark: form.landmark.trim() || undefined,
                type: form.type,
                isDefault: form.isDefault,
            };
            if (editingAddressId) {
                await updateAddress(editingAddressId, payload);
            } else {
                await createAddress(payload);
            }
            const refreshed = await fetchAddresses();
            setAddresses(refreshed);
            const defaultAddr = refreshed.find((a) => a.isDefault);
            if (defaultAddr) setSelectedId(defaultAddr._id || defaultAddr.id);
            setShowForm(false);
            setEditingAddressId(null);
        } catch (err) {
            setError(err.message || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await deleteAddress(addressId);
            setAddresses(addresses.filter(a => (a._id || a.id) !== addressId));
        } catch (err) {
            alert(err.message || 'Failed to delete address');
        }
    };

    return (
        <section className="bg-white md:py-10 min-h-screen">
            <Container>
                {/* Main Card Wrapper */}
                <div className="bg-white md:border border-gray-100 md:rounded-[32px] p-5 md:p-12 md:shadow-sm min-h-[600px]">
                    
                    {/* Header with Add Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            My Address
                        </h1>
                        <button onClick={openAddForm} className="bg-[#a3e635] text-gray-800 text-sm font-bold px-8 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition shadow-sm">
                            Add Address
                        </button>
                    </div>

                    {showForm && (
                        <div className="mb-8 p-5 border border-gray-200 rounded-2xl bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {editingAddressId ? 'Edit Address' : 'Add Address'}
                            </h3>
                            <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Full Name" required className="px-4 py-3 border border-gray-200 rounded-xl bg-white" />
                                <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="Phone" required className="px-4 py-3 border border-gray-200 rounded-xl bg-white" />
                                <input name="street" value={form.street} onChange={handleFormChange} placeholder="Street / Area" required className="md:col-span-2 px-4 py-3 border border-gray-200 rounded-xl bg-white" />
                                <input name="city" value={form.city} onChange={handleFormChange} placeholder="City" required className="px-4 py-3 border border-gray-200 rounded-xl bg-white" />
                                <input name="state" value={form.state} onChange={handleFormChange} placeholder="State" required className="px-4 py-3 border border-gray-200 rounded-xl bg-white" />
                                <input name="zipCode" value={form.zipCode} onChange={handleFormChange} placeholder="Pincode" required className="px-4 py-3 border border-gray-200 rounded-xl bg-white" />
                                <input name="landmark" value={form.landmark} onChange={handleFormChange} placeholder="Landmark (optional)" className="px-4 py-3 border border-gray-200 rounded-xl bg-white" />
                                <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleFormChange} />
                                    Set as default
                                </label>
                                {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
                                <div className="md:col-span-2 flex gap-3">
                                    <button type="submit" disabled={saving} className="bg-[#1F2E46] text-white px-5 py-2.5 rounded-lg font-semibold disabled:opacity-60">
                                        {saving ? 'Saving...' : 'Save Address'}
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Address Grid */}
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">Loading addresses...</div>
                    ) : addresses.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <p>No addresses found. Add your first address to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addresses.map((addr) => {
                                const addrId = addr._id || addr.id;
                                const isSelected = selectedId === addrId;
                            
                            return (
                                <div 
                                    key={addrId}
                                    className={`flex flex-col border rounded-2xl overflow-hidden transition-all bg-white
                                        ${isSelected ? 'border-gray-200' : 'border-gray-100'}`}
                                >
                                    {/* Address Details Body */}
                                    <div className="p-6 flex gap-4">
                                        <button 
                                            onClick={() => setSelectedId(addrId)}
                                            className="mt-1 shrink-0"
                                        >
                                            {isSelected ? (
                                                <IoMdRadioButtonOn className="text-2xl text-[#1e293b]" />
                                            ) : (
                                                <IoMdRadioButtonOff className="text-2xl text-gray-300" />
                                            )}
                                        </button>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900">{addr.name}</h3>
                                                {addr.isDefault && (
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-wider">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium">{addr.phone}</p>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {addr.street} <br />
                                                {addr.city}, {addr.state} {addr.zipCode}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons Footer */}
                                    <div className="flex border-t border-gray-100">
                                        <button onClick={() => openEditForm(addr)} className="flex-1 py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-widest transition border-r border-gray-100">
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(addrId)}
                                            className="flex-1 py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-widest transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default MyAddress;