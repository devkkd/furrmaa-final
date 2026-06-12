'use client';

import { useEffect, useRef } from 'react';
import {
  isGooglePlacesConfigured,
  loadGoogleMapsPlaces,
  parseGooglePlace,
} from '@/lib/googlePlaces';

/**
 * Address / location input with Google Places suggestions (falls back to plain input).
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(v: string) => void} props.onChange
 * @param {(place: ReturnType<typeof parseGooglePlace>) => void} [props.onPlaceSelect]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 * @param {string[]} [props.types] - e.g. ['geocode'] or ['establishment', 'geocode']
 * @param {boolean} [props.disabled]
 * @param {string} [props.id]
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

  useEffect(() => {
    if (!isGooglePlacesConfigured() || !inputRef.current) return;

    let cancelled = false;

    loadGoogleMapsPlaces()
      .then((maps) => {
        if (cancelled || !inputRef.current) return;

        const ac = new maps.places.Autocomplete(inputRef.current, {
          types,
          componentRestrictions: { country: 'in' },
          fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name'],
        });

        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (!place?.geometry) return;
          const parsed = parseGooglePlace(place);
          onChangeRef.current(parsed.label);
          onPlaceSelectRef.current?.(parsed);
        });

        autocompleteRef.current = ac;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [types.join(',')]);

  const hint = isGooglePlacesConfigured()
    ? 'Start typing for address suggestions'
    : 'Type your city or area (add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for suggestions)';

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoComplete="off"
      />
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}
