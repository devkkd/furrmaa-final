'use client';

import { useEffect, useRef } from 'react';
import {
  isGooglePlacesConfigured,
  loadGoogleMapsPlaces,
  parseGooglePlace,
} from '@/lib/googlePlaces';

/**
 * Address / location input with Google Places suggestions (falls back to plain input).
 * Remount with a new `key` when switching edit records so value stays editable.
 */
export default function LocationAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search address or place',
  className = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm',
  types = ['geocode'],
  disabled = false,
  id,
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);

  onPlaceSelectRef.current = onPlaceSelect;
  onChangeRef.current = onChange;

  // Keep DOM in sync when parent value changes (edit form open / reset)
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== (value || '')) {
      inputRef.current.value = value || '';
    }
  }, [value]);

  useEffect(() => {
    if (!isGooglePlacesConfigured() || !inputRef.current) return;

    let cancelled = false;
    let listener = null;

    loadGoogleMapsPlaces()
      .then((maps) => {
        if (cancelled || !inputRef.current) return;

        const ac = new maps.places.Autocomplete(inputRef.current, {
          types,
          componentRestrictions: { country: 'in' },
          fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name'],
        });

        listener = ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (!place?.geometry) return;
          const parsed = parseGooglePlace(place);
          if (inputRef.current) inputRef.current.value = parsed.label;
          onChangeRef.current(parsed.label);
          onPlaceSelectRef.current?.(parsed);
        });

        autocompleteRef.current = ac;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
      autocompleteRef.current = null;
    };
  }, [types.join(',')]);

  const hint = isGooglePlacesConfigured()
    ? 'Type freely to edit, or pick a suggestion'
    : 'Type your city or area (add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for suggestions)';

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="text"
        defaultValue={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoComplete="off"
      />
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}
