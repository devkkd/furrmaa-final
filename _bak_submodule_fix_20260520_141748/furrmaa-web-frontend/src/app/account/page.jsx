"use client"
import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import Container from '@/components/Container';
import { HiOutlineLogout, HiOutlineTrash, HiOutlineUserCircle } from 'react-icons/hi';
import { useAuthStore } from '@/store/authStore';
import { setToken, updateProfile, deleteAccount, uploadImage } from '@/lib/api';
import { useRouter } from 'next/navigation';

/* --- Modal Components --- */

// Log Out Popup
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-[360px] rounded-[32px] p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-center mb-6">
                    <div className="bg-[#1a2b48] p-4 rounded-full text-white">
                        <HiOutlineLogout className="text-3xl" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Log Out</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    Are you sure you want to <br /> log out of this device?
                </p>
                <div className="space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-[#1a2b48] text-white font-bold py-3.5 rounded-full hover:bg-[#111e33] transition-colors shadow-md"
                    >
                        Log Out
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full text-gray-900 font-bold py-2 hover:text-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Delete Account Popup
const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-[380px] rounded-[32px] p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-center mb-6">
                    <div className="bg-[#ff5a5a] p-4 rounded-full text-white shadow-lg shadow-red-200">
                        <HiOutlineTrash className="text-3xl" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-balance leading-tight">
                    Delete Account Permanently
                </h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    This action cannot be undone. All your data and pet information will be permanently deleted. Do you want to continue?
                </p>
                <div className="space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-[#ff5a5a] text-white font-bold py-3.5 rounded-full hover:bg-red-600 transition-colors shadow-md shadow-red-100"
                    >
                        Delete Account
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full text-gray-900 font-bold py-2 hover:text-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- Main Page Component --- */

const AccountSettings = () => {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const setUser = useAuthStore((s) => s.setUser);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const photoInputRef = useRef(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setName(user.name ?? '');
            setEmail(user.email ?? '');
            setPhone(user.phone ?? '');
        }
    }, [user]);

    const handleLogout = () => {
        setToken(null);
        logout();
        setShowLogoutModal(false);
        router.replace('/login');
    };

    const handleSaveChanges = async () => {
        if (!name.trim()) {
            setSaveMessage({ type: 'error', text: 'Name is required' });
            return;
        }
        if (!email.trim()) {
            setSaveMessage({ type: 'error', text: 'Email is required' });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setSaveMessage({ type: 'error', text: 'Please enter a valid email address' });
            return;
        }
        setSaving(true);
        setSaveMessage(null);
        try {
            const updated = await updateProfile({
                name: name.trim(),
                email: email.trim(),
                phone: phone.replace(/\D/g, '').slice(-10) || undefined,
            });
            if (updated) {
                setUser(updated);
                setSaveMessage({ type: 'success', text: 'Profile updated successfully' });
            }
        } catch (e) {
            setSaveMessage({ type: 'error', text: e.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAccount();
            setToken(null);
            logout();
            setShowDeleteModal(false);
            router.replace('/login');
        } catch (e) {
            alert(e.message || 'Failed to delete account. Please try again.');
            setShowDeleteModal(false);
        }
    };

    const handleUploadPhoto = async (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const imageUrl = await uploadImage(file, 'furmaa/users');
            const updated = await updateProfile({ profileImage: imageUrl });
            if (updated) {
                setUser(updated);
                setSaveMessage({ type: 'success', text: 'Profile picture updated' });
            }
        } catch (err) {
            setSaveMessage({ type: 'error', text: err.message || 'Failed to upload profile picture' });
        } finally {
            setUploadingPhoto(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    return (
        <section className="bg-white h-full">
            <Container>
                {/* Main Settings Card */}
                <div className="bg-white border border-gray-100 md:rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-6 md:p-12">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-10">My Account</h1>

                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Left: Profile Picture Section */}
                            <div className="w-full lg:w-1/4 flex flex-col items-center border-r border-gray-100 pr-0 lg:pr-12">
                                <div className="relative group cursor-pointer">
                                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
                                        ) : (
                                            <HiOutlineUserCircle className="text-6xl text-gray-400" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 rounded-full transition-all" />
                                </div>
                                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
                                <button onClick={() => photoInputRef.current?.click()} className="mt-4 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors">
                                    {uploadingPhoto ? 'Uploading...' : 'Upload Profile Picture'}
                                </button>
                            </div>

                            {/* Right: Form Fields Section */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-5 py-3.5 border border-gray-200 rounded-xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[15px]"
                                    />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Enter Your Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-3.5 border border-gray-200 rounded-xl bg-gray-50/30 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[15px]"
                                    />
                                </div>

                                {/* Mobile Number with Change CTA  */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Mobile Number</label>

                                    <div className="relative">
                                        <input
                                            type="tel"
                                            placeholder="99999 99999"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full px-5 pr-36 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-gray-300 text-[15px]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => document.querySelector('input[type="tel"]')?.focus()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white text-[11px] font-semibold px-4 py-2 rounded-full"
                                        >
                                            Change Number
                                        </button>
                                    </div>
                                </div>

                                {/* Registration Type Info */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center h-full pt-6 md:pt-8 px-1">
                                        <span className="text-sm font-bold text-gray-700">Account Registration Type</span>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</p>
                                            <p className="text-sm font-bold text-gray-500">{phone || user?.phone || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Changes - app jaisa */}
                        <div className="px-6 md:px-12 pt-6 pb-2">
                            {saveMessage && (
                                <p className={`text-sm mb-3 ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {saveMessage.text}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="w-full max-w-[280px] bg-[#1a2b48] text-white font-bold py-3.5 rounded-full hover:bg-[#111e33] disabled:opacity-70 transition"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="border-t border-gray-50 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30">
                        {/* Log Out Action */}
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group text-left"
                        >
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <HiOutlineLogout className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Log out</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Log out this account on this device</p>
                            </div>
                        </button>

                        {/* Delete Account Action */}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group text-left"
                        >
                            <div className="p-3 bg-red-50 rounded-xl text-red-500 transition-colors">
                                <HiOutlineTrash className="text-2xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-500">Delete Account</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Delete Your Account Permanently</p>
                            </div>
                        </button>
                    </div>
                </div>
            </Container>

            {/* Render Popups */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
            />
        </section>
    );
};

export default AccountSettings;