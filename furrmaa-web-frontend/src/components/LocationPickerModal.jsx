'use client';

import { useState } from 'react';
import LocationAutocomplete from '@/components/LocationAutocomplete';

/**
 * Location modal: GPS + Google Places manual search (Hope / Vet / Cremation).
 */
export default function LocationPickerModal({
  open,
  onClose,
  onConfirm,
  locLoading,
  locError,
  onUseCurrentLocation,
}) {
  const [manualLocation, setManualLocation] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    const val = manualLocation.trim();
    if (val) {
      onConfirm(val);
      setManualLocation('');
    }
  };

  const handlePlaceSelect = (place) => {
    if (place?.label) {
      onConfirm(place.label);
      setManualLocation('');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Set your location</h3>
        {locError && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">{locError}</p>
        )}
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={locLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#95E562] text-black font-semibold rounded-xl mb-3 disabled:opacity-60"
        >
          {locLoading ? 'Getting...' : 'Use my current location'}
        </button>
        <p className="text-xs text-gray-500 mb-2">Or search / type your area</p>
        <LocationAutocomplete
          value={manualLocation}
          onChange={setManualLocation}
          onPlaceSelect={handlePlaceSelect}
          placeholder="e.g. Sector 62, Noida, Uttar Pradesh"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          types={['geocode']}
        />
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!manualLocation.trim()}
            className="flex-1 py-2.5 bg-gray-900 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            Use this location
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
