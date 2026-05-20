"use client";
import React, { useState, useEffect } from 'react';
import { fetchNotifications, markNotificationRead } from '@/lib/api';

const AccNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchNotifications()
            .then((data) => {
                if (!cancelled) setNotifications(data);
            })
            .catch(() => {
                if (!cancelled) setNotifications([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const handleNotificationClick = async (notification) => {
        if (!notification.read && notification._id) {
            try {
                await markNotificationRead(notification._id);
                setNotifications(notifications.map(n => 
                    n._id === notification._id ? { ...n, read: true } : n
                ));
            } catch (err) {
                console.error('Failed to mark notification as read:', err);
            }
        }
    };

    return (
        <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
            {/* Header */}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
                Notifications
            </h1>

            {/* Notifications List */}
            {loading ? (
                <div className="py-12 text-center text-gray-500">Loading notifications...</div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => {
                        const notificationId = notification._id || notification.id;
                        const time = notification.createdAt 
                            ? new Date(notification.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })
                            : notification.time || 'Recently';
                        
                        return (
                            <div 
                                key={notificationId}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-[#fbfcfd] border rounded-2xl p-5 hover:shadow-sm transition-shadow cursor-pointer group
                                    ${notification.read ? 'border-gray-50 opacity-75' : 'border-gray-100'}`}
                            >
                                <div className="space-y-1">
                                    <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {notification.title || notification.message}
                                    </h3>
                                    <p className="text-[13px] text-gray-600 font-medium">
                                        {notification.description || notification.body || notification.message}
                                    </p>
                                    <p className="text-[11px] text-gray-400 font-bold pt-1 uppercase tracking-wider">
                                        {time}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State Logic (Optional) */}
            {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest">
                        No New Notifications
                    </p>
                </div>
            )}
        </div>
    );
};

export default AccNotification;