"use client"
import React, { useState, useEffect } from 'react';
import { HiOutlineLocationMarker, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Container from '@/components/Container';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';
import { fetchPetEvents, registerPetEvent } from '@/lib/api';

const PetEvents = () => {
    const [expandedEventId, setExpandedEventId] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState('Jaipur');
    const [showCityPicker, setShowCityPicker] = useState(false);
    const [formByEvent, setFormByEvent] = useState({});
    const [submittingId, setSubmittingId] = useState(null);
    const [successId, setSuccessId] = useState(null);
    const [errorByEvent, setErrorByEvent] = useState({});

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const list = await fetchPetEvents({ city: city === 'All' ? undefined : city });
                if (!cancelled) setEvents(list);
            } catch (e) {
                if (!cancelled) setEvents([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [city]);

    const toggleEvent = (id) => {
        setExpandedEventId(expandedEventId === id ? null : id);
    };

    const image1 = (event) => event.posterUrl || event.images?.[0];
    const image2 = (event) => event.images?.[1];
    const CITIES = ['Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'All'];

    const getForm = (eventId) => formByEvent[eventId] || { name: '', email: '', phone: '', notes: '' };
    const setFormField = (eventId, key, value) => {
        setFormByEvent((prev) => ({
            ...prev,
            [eventId]: { ...getForm(eventId), [key]: value },
        }));
        setErrorByEvent((prev) => ({ ...prev, [eventId]: '' }));
    };

    const handleRegister = async (eventId) => {
        const form = getForm(eventId);
        if (!form.name.trim() || !form.phone.trim()) {
            setErrorByEvent((prev) => ({ ...prev, [eventId]: 'Name and phone are required.' }));
            return;
        }
        setSubmittingId(eventId);
        setErrorByEvent((prev) => ({ ...prev, [eventId]: '' }));
        try {
            await registerPetEvent(eventId, {
                name: form.name,
                email: form.email,
                phone: form.phone,
                notes: form.notes,
            });
            setSuccessId(eventId);
            setFormByEvent((prev) => ({ ...prev, [eventId]: { name: '', email: '', phone: '', notes: '' } }));
        } catch (err) {
            setErrorByEvent((prev) => ({ ...prev, [eventId]: err.message || 'Registration failed.' }));
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <section className="bg-white py-10">
            <Container>
                <div className="px-5">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                        <h1 className="text-4xl font-bold text-gray-900">Pet Events</h1>

                        {/* Location Picker */}
                        <div className="relative w-full md:w-auto min-w-[280px]">
                            {/* Visual Container */}
                            <div className="flex items-center justify-between border border-gray-200 rounded-2xl pl-4 pr-2 py-2 bg-white w-full">
                                <div className="flex items-center gap-3">
                                    <HiOutlineLocationMarker className="text-[#1F2E46] text-[22px] shrink-0" />
                                    <span className="text-lg text-[#1F2E46]">
                                        {city}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCityPicker(!showCityPicker)}
                                    className="bg-[#95E562] text-gray-900 text-sm font-medium px-5 py-2 rounded-xl hover:bg-[#85cc57] transition-colors ml-4"
                                >
                                    Change
                                </button>
                            </div>

                            {/* Dropdown */}
                            {showCityPicker && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-2">
                                    {CITIES.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => { setCity(c); setShowCityPicker(false); }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${city === c ? 'bg-[#95E562]/20 text-gray-900 font-medium' : 'text-gray-600'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Events List */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#a3e635] border-t-transparent" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-16 text-gray-600">
                            <p className="text-lg font-medium">No pet events in this location right now.</p>
                            <p className="text-sm mt-2">Try changing the city or check back later.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {events.map((event) => {
                                const isExpanded = expandedEventId === event._id;
                                const img1 = image1(event);
                                const img2 = image2(event);

                                return (
                                    <div
                                        key={event._id}
                                        className="flex flex-col lg:flex-row border border-gray-100 rounded-[32px] overflow-hidden bg-[#fbfcfd] shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        {/* Left: Event images (1 or 2) */}
                                        <div className="w-full lg:w-[380px] shrink-0 p-4 lg:p-6 space-y-4">
                                            {img1 && (
                                                <div
                                                    className="relative aspect-square md:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                                                    onClick={() => toggleEvent(event._id)}
                                                >
                                                    <img
                                                        src={img1}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                                    />
                                                </div>
                                            )}
                                            {img2 && (
                                                <div
                                                    className="relative aspect-video rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                                                    onClick={() => toggleEvent(event._id)}
                                                >
                                                    <img
                                                        src={img2}
                                                        alt={`${event.title} – Photo 2`}
                                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                                    />
                                                </div>
                                            )}
                                            {!img1 && !img2 && (
                                                <div
                                                    className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-4xl cursor-pointer"
                                                    onClick={() => toggleEvent(event._id)}
                                                >
                                                    🐶🎉
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Event Details */}
                                        <div className="flex-1 p-6 lg:pl-0 lg:pr-10 lg:py-10 flex flex-col justify-between">
                                            <div className="cursor-pointer" onClick={() => toggleEvent(event._id)}>
                                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                                                    {event.title}
                                                </h2>
                                                <div className="space-y-1 mb-4">
                                                    <p className="font-bold text-gray-800 text-[15px]">{event.dateText}</p>
                                                    <p className="text-gray-600 text-[14px] font-medium flex items-center gap-1">
                                                        <HiOutlineLocationMarker className="inline text-lg" />
                                                        {event.venue}
                                                        {event.city ? `, ${event.city}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => toggleEvent(event._id)}
                                                className="lg:hidden w-full flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200 transition mb-2"
                                            >
                                                {isExpanded ? 'Hide Details' : 'View Full Details'}
                                                {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
                                            </button>

                                            <div
                                                className={`space-y-6 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100 lg:mt-0'}`}
                                            >
                                                {event.description && (
                                                    <div className="space-y-3 pt-2 border-t border-gray-100 lg:border-none">
                                                        <h3 className="font-bold text-gray-900 text-lg">Event Details</h3>
                                                        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl whitespace-pre-wrap">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="space-y-3 pt-2 border-t border-gray-100 lg:border-none">
                                                    <h3 className="font-bold text-gray-900 text-lg">Register for this event</h3>
                                                    {successId === event._id ? (
                                                        <p className="text-sm text-green-700 font-medium">Registration successful. See you there!</p>
                                                    ) : (
                                                        <>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Your name *"
                                                                    value={getForm(event._id).name}
                                                                    onChange={(e) => setFormField(event._id, 'name', e.target.value)}
                                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                                />
                                                                <input
                                                                    type="tel"
                                                                    placeholder="Phone *"
                                                                    value={getForm(event._id).phone}
                                                                    onChange={(e) => setFormField(event._id, 'phone', e.target.value)}
                                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                                                />
                                                                <input
                                                                    type="email"
                                                                    placeholder="Email"
                                                                    value={getForm(event._id).email}
                                                                    onChange={(e) => setFormField(event._id, 'email', e.target.value)}
                                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm md:col-span-2"
                                                                />
                                                                <textarea
                                                                    placeholder="Notes (optional)"
                                                                    value={getForm(event._id).notes}
                                                                    onChange={(e) => setFormField(event._id, 'notes', e.target.value)}
                                                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm md:col-span-2 min-h-[70px]"
                                                                />
                                                            </div>
                                                            {errorByEvent[event._id] && (
                                                                <p className="text-sm text-red-600">{errorByEvent[event._id]}</p>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRegister(event._id)}
                                                                disabled={submittingId === event._id}
                                                                className="bg-[#1F2E46] text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                                                            >
                                                                {submittingId === event._id ? 'Registering...' : 'Register Now'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Container>

            <WhyChooseFurrmaa />
        </section>
    );
};
export default PetEvents;
