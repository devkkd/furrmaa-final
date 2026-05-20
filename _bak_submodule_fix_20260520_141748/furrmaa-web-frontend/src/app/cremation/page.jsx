'use client';

import React, { useEffect, useState } from 'react';
import Container from '@/components/Container';
import { HiOutlineLocationMarker, HiOutlineSearch, HiPhone } from 'react-icons/hi';
import { RiDirectionLine } from 'react-icons/ri';
import { LuArrowUpDown } from 'react-icons/lu';
import Link from 'next/link';
import { fetchCremationCenters } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';

const CremationServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [manualLocation, setManualLocation] = useState('');
    const { location, loading: locLoading, error: locError, fetchCurrentLocation, setLocation } = useGeolocation('Pratap Nagar, Jaipur');

    useEffect(() => {
        fetchCurrentLocation();
    }, [fetchCurrentLocation]);

    const handleUseMyLocation = async () => {
        const addr = await fetchCurrentLocation();
        if (addr) setShowLocationModal(false);
    };
    const handleUseManualLocation = () => {
        const val = manualLocation.trim();
        if (val) {
            setLocation(val);
            setShowLocationModal(false);
            setManualLocation('');
        }
    };

    useEffect(() => {
        setLoading(true);
        const cityFromLocation = location?.split(',')?.[0]?.trim();
        fetchCremationCenters({
            city: cityFromLocation || undefined,
            search: search.trim() || undefined,
        })
            .then((centers) => {
                const mapped = (centers || []).map((c) => ({
                    _id: c._id,
                    name: c.name,
                    address: c.address,
                    city: c.city,
                    state: c.state,
                    phone: c.phone,
                    image: c.image || '/images/Events/events.png',
                    distance: c.distance || `${c.city}, ${c.state}`,
                }));
                const sorted = [...mapped].sort((a, b) => {
                    if (sortBy === 'city') return String(a.city || '').localeCompare(String(b.city || ''));
                    return String(a.name || '').localeCompare(String(b.name || ''));
                });
                setServices(sorted);
            })
            .catch(() => setServices([]))
            .finally(() => setLoading(false));
    }, [location, search, sortBy]);

    return (
        <section className="bg-white py-6 px-4 md:px-0 md:py-10 min-h-screen">
            <Container>
                {/* Header Section: Title and Controls */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between mb-6 md:mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Cremation
                    </h1>

                    {/* Controls Group */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64 md:w-80">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type="text"
                                placeholder="Search Cremation"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm transition-all"
                            />
                        </div>

                        {/* Controls Row for Mobile */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Sort Toggle */}
                            <div className="flex items-center justify-center gap-2 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white hover:bg-gray-50 transition flex-1 sm:flex-none font-medium">
                                <LuArrowUpDown className="text-gray-400" />
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent focus:outline-none">
                                    <option value="name">Sort: Name</option>
                                    <option value="city">Sort: City</option>
                                </select>
                            </div>

                            {/* Location Pill */}
                            <div className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-1.5 bg-white shadow-sm flex-1 sm:flex-none justify-between sm:justify-start">
                                <div className="flex items-center gap-1">
                                    <HiOutlineLocationMarker className="text-gray-400 text-lg shrink-0" />
                                    <span className="text-xs text-gray-600 font-bold truncate max-w-[100px] sm:max-w-[120px]">
                                        {locLoading ? 'Getting location...' : (location || 'Select location')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowLocationModal(true)}
                                    disabled={locLoading}
                                    className="bg-[#a3e635] text-white text-[10px] font-extrabold px-3 py-1 rounded-lg uppercase hover:opacity-90 transition shadow-sm shrink-0 disabled:opacity-60"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>
                    {showLocationModal && (
                        <>
                            <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowLocationModal(false)} />
                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Set your location</h3>
                                {locError && (
                                    <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">{locError}</p>
                                )}
                                <button
                                    onClick={handleUseMyLocation}
                                    disabled={locLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#a3e635] text-black font-semibold rounded-xl mb-3 disabled:opacity-60"
                                >
                                    {locLoading ? 'Getting...' : 'Use my current location'}
                                </button>
                                <p className="text-xs text-gray-500 mb-2">Or enter manually</p>
                                <input
                                    type="text"
                                    placeholder="e.g. Jaipur, Rajasthan"
                                    value={manualLocation}
                                    onChange={(e) => setManualLocation(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUseManualLocation}
                                        disabled={!manualLocation.trim()}
                                        className="flex-1 py-2.5 bg-gray-900 text-white font-semibold rounded-xl disabled:opacity-50"
                                    >
                                        Use this location
                                    </button>
                                    <button
                                        onClick={() => setShowLocationModal(false)}
                                        className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Services Grid: 1 column on mobile, 2 columns on tablets/desktops */}
                {loading ? (
                    <div className="py-10 text-center text-gray-500">Loading cremation centers...</div>
                ) : services.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">No cremation centers found for selected location.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {services.map((service) => (
                        <div
                            key={service._id}
                            // Changed: 'flex-row' for all screens (image always left), adjusted gap and padding for mobile
                            className="flex flex-row gap-3 p-3 md:gap-5 md:p-5 bg-white border border-gray-100 rounded-[20px] md:rounded-[28px] transition-all hover:shadow-md group"
                        >
                            {/* Image Section: Fixed small size on mobile, larger on desktop */}
                            <div className="w-24 h-24 sm:w-36 md:w-40 md:h-40 shrink-0 rounded-[16px] md:rounded-[20px] overflow-hidden bg-gray-100 shadow-sm">
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Details Section */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div className="mb-2 md:mb-4">
                                    <h3 className="text-base md:text-lg font-extrabold text-gray-900 leading-tight mb-1 truncate">
                                        {service.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-gray-400 text-[10px] md:text-xs mb-1 md:mb-2 font-bold uppercase tracking-wider">
                                        <HiOutlineLocationMarker className="text-xs md:text-sm shrink-0" />
                                        <span className="truncate">{service.distance}</span>
                                    </div>
                                    <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">
                                        {service.address}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-auto">
                                    <a href={service.phone ? `tel:${service.phone}` : undefined} className="flex items-center justify-center gap-1 md:gap-2 bg-[#8b5cf6] text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold hover:bg-[#7c3aed] transition-colors shadow-sm">
                                        <HiPhone className="text-xs md:text-sm" />
                                        <span className="hidden sm:inline">Call</span>
                                    </a>

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${service.name}, ${service.address || ''}, ${service.city || ''}`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs font-bold hover:text-gray-900 transition-colors"
                                    >
                                        <RiDirectionLine className="text-sm md:text-lg" />
                                        <span className="hidden sm:inline">Direction</span>
                                    </a>

                                    <Link href={`/cremation/reqCremation/${service._id}`} className='ml-auto'>
                                        <button className="bg-[#1e293b] text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[10px] lg:text-xs font-bold hover:bg-black transition-colors shadow-sm whitespace-nowrap">
                                            Request <span className="hidden sm:inline">for Cremation</span> ➔
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </Container>
        </section>
    );
};

export default CremationServices;