"use client";

import React, { useState, useMemo } from 'react';
import Container from '@/components/Container';
import { HiOutlineLocationMarker, HiOutlineSearch, HiPhone } from 'react-icons/hi';
import { RiDirectionLine } from 'react-icons/ri';
import { LuArrowUpDown } from 'react-icons/lu';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';
import { useVetServices } from '@/hooks/useVetServices';
import { useGeolocation } from '@/hooks/useGeolocation';

const ITEMS_PER_PAGE = 10;

const Vet = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('nearest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [manualLocation, setManualLocation] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { location, loading: locLoading, error: locError, fetchCurrentLocation, setLocation } = useGeolocation('');

    React.useEffect(() => { fetchCurrentLocation(); }, [fetchCurrentLocation]);

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

    const city = location?.split(',')[0]?.trim();
    const { services, loading, categories } = useVetServices({
        category: selectedCategory,
        city: city || undefined,
    });

    const filteredServices = useMemo(() => {
        let list = [...services];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    (s.address && s.address.toLowerCase().includes(q)) ||
                    (s.category && s.category.toLowerCase().includes(q))
            );
        }
        if (sortBy === 'farthest') list.reverse();
        return list;
    }, [services, searchQuery, sortBy]);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery, sortBy]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentServices = filteredServices.slice(startIndex, endIndex);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= maxVisible; i++) {
                    pages.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }
        return pages;
    };

    const openCall = (phone) => {
        if (!phone) return;
        const num = String(phone).replace(/\s/g, '').trim();
        if (num) window.location.href = `tel:${num}`;
    };

    const openDirection = (address) => {
        const addr = encodeURIComponent(address || '');
        window.open(`https://www.google.com/maps/search/?api=1&query=${addr}`, '_blank');
    };

    return (
        <section className="bg-white py-6 md:py-8">
            <Container>
                <div className="px-6">
                    <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between mb-6 md:mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 shrink-0">Vet Services</h1>

                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            <div className="relative flex-grow w-full md:w-auto md:max-w-md">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    placeholder="Search Vet Services"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <button
                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                        className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-white hover:bg-gray-50 transition w-full"
                                    >
                                        <span>Sort By</span>
                                        <LuArrowUpDown className="text-gray-400" />
                                    </button>
                                    {showSortDropdown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowSortDropdown(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 py-2 bg-white border rounded-xl shadow-lg z-20 min-w-[160px]">
                                                <button
                                                    onClick={() => {
                                                        setSortBy('nearest');
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'nearest' ? 'bg-gray-100 font-medium' : ''}`}
                                                >
                                                    Nearest First
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSortBy('farthest');
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'farthest' ? 'bg-gray-100 font-medium' : ''}`}
                                                >
                                                    Farthest First
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-white shadow-sm flex-1 md:flex-none justify-between md:justify-start">
                                    <div className="flex items-center gap-1 overflow-hidden">
                                        <HiOutlineLocationMarker className="text-gray-400 text-lg shrink-0" />
                                        <span className="text-xs text-gray-600 font-medium truncate max-w-[100px] md:max-w-[150px]">
                                            {locLoading ? 'Getting location...' : (location || 'Select location')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setShowLocationModal(true)}
                                        disabled={locLoading}
                                        className="bg-[#95E562] text-black text-[10px] font-bold px-3 py-1 rounded-lg uppercase hover:opacity-90 shrink-0 disabled:opacity-60"
                                    >
                                        Change
                                    </button>
                                </div>
                                {locError && <p className="text-xs text-red-500 mt-1">{locError}</p>}

                                {showLocationModal && (
                                    <>
                                        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowLocationModal(false)} />
                                        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">
                                            <h3 className="text-lg font-bold text-gray-900 mb-3">Set your location</h3>
                                            {locError && (
                                                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">
                                                    {locError}
                                                </p>
                                            )}
                                            <button
                                                onClick={handleUseMyLocation}
                                                disabled={locLoading}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#95E562] text-black font-semibold rounded-xl mb-3 disabled:opacity-60"
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
                        </div>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
                        {categories.map((cat, idx) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all
                                    ${selectedCategory === cat
                                        ? 'bg-[#1e293b] text-white shadow-md'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p className="text-gray-500 py-12">Loading vet services...</p>
                    ) : filteredServices.length === 0 ? (
                        <p className="text-gray-500 py-12">No vet services found. Try adjusting your search or filters.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {currentServices.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        className="flex flex-row gap-3 p-3 md:gap-4 md:p-4 bg-white border border-gray-100 rounded-2xl transition-all hover:shadow-md"
                                    >
                                        <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                            {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">🏥</div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="text-base md:text-lg font-extrabold text-gray-900 uppercase truncate leading-tight">
                                                        {item.name}
                                                    </h3>
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1E3A8A] shrink-0">
                                                        {item.type || item.category || 'Service'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1.5 font-medium">
                                                    <HiOutlineLocationMarker className="shrink-0" />
                                                    <span className="truncate">{item.distance}</span>
                                                </div>
                                                <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed line-clamp-2 font-medium">
                                                    {item.address}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 mt-3">
                                                <button
                                                    onClick={() => openCall(item.phone)}
                                                    className="flex items-center justify-center gap-1.5 bg-[#8B5FBF] text-white px-4 py-2 rounded-full text-[11px] md:text-xs font-bold hover:bg-[#7c3aed] transition shadow-sm min-w-[80px] disabled:opacity-50"
                                                    disabled={!item.phone}
                                                >
                                                    <HiPhone className="text-sm" />
                                                    Call
                                                </button>
                                                <button
                                                    onClick={() => openDirection(item.address)}
                                                    className="flex items-center gap-1.5 text-gray-600 text-[11px] md:text-xs font-bold hover:text-gray-900 transition"
                                                >
                                                    <RiDirectionLine className="text-lg" />
                                                    Direction
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <IoChevronBack className="text-xl" />
                                    </button>

                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition ${
                                                currentPage === page
                                                    ? 'bg-[#1F2E46] text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <IoChevronForward className="text-xl" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Container>
            <WhyChooseFurrmaa />
        </section>
    );
};

export default Vet;
