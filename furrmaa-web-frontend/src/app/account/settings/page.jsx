'use client';

import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

const defaultSettings = {
  notifications: { push: true, email: true, sms: false, orderUpdates: true, promotions: true, reminders: true },
  preferences: { language: 'en', currency: 'INR', theme: 'light' },
  privacy: { profileVisibility: 'public', showPhone: false, showEmail: false },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => setSettings({ ...defaultSettings, ...s, notifications: { ...defaultSettings.notifications, ...s?.notifications }, preferences: { ...defaultSettings.preferences, ...s?.preferences }, privacy: { ...defaultSettings.privacy, ...s?.privacy } }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      alert('Settings saved');
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LogoLoader />;

  return (
    <div className="bg-white border border-gray-100 md:rounded-[32px] p-4 md:p-10 shadow-sm min-h-[600px]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Settings</h1>

      <section className="mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-3">
          {Object.entries(settings.notifications).map(([key, val]) => (
            <label key={key} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 cursor-pointer">
              <span className="capitalize text-sm font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input type="checkbox" checked={!!val} onChange={() => toggle('notifications', key)} className="w-5 h-5" />
            </label>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Privacy</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between border border-gray-100 rounded-xl p-4 cursor-pointer">
            <span className="text-sm font-medium">Show phone on profile</span>
            <input type="checkbox" checked={!!settings.privacy.showPhone} onChange={() => toggle('privacy', 'showPhone')} className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between border border-gray-100 rounded-xl p-4 cursor-pointer">
            <span className="text-sm font-medium">Show email on profile</span>
            <input type="checkbox" checked={!!settings.privacy.showEmail} onChange={() => toggle('privacy', 'showEmail')} className="w-5 h-5" />
          </label>
        </div>
      </section>

      <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-3 bg-[#1F2E46] text-white rounded-xl font-semibold">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
