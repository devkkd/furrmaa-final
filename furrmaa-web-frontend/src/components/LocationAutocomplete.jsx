'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isGooglePlacesConfigured,
  loadGoogleMapsPlaces,
  parseGooglePlace,
} from '@/lib/googlePlaces';

/**
 * Location input with Google Places suggestions.
 * Uses AutocompleteService (not the Autocomplete widget) so the field
 * never gets stuck / readonly while typing.
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
  const [suggestions, setSuggestions] = useState([]);
  const [listOpen, setListOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const wrapRef = useRef(null);
  const mapsRef = useRef(null);
  const serviceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const debounceRef = useRef(null);
  const typesKey = Array.isArray(types) ? types.join(',') : String(types || '');

  useEffect(() => {
    if (!isGooglePlacesConfigured()) return undefined;
    let cancelled = false;

    loadGoogleMapsPlaces()
      .then((maps) => {
        if (cancelled) return;
        mapsRef.current = maps;
        serviceRef.current = new maps.places.AutocompleteService();
        sessionTokenRef.current = new maps.places.AutocompleteSessionToken();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setListOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, []);

  const fetchSuggestions = useCallback(
    (input) => {
      const q = (input || '').trim();
      if (!serviceRef.current || !q) {
        setSuggestions([]);
        setListOpen(false);
        setSuggestLoading(false);
        return;
      }

      setSuggestLoading(true);
      const req = {
        input: q,
        componentRestrictions: { country: 'in' },
        sessionToken: sessionTokenRef.current || undefined,
      };
      if (typesKey) req.types = typesKey.split(',');

      serviceRef.current.getPlacePredictions(req, (preds, status) => {
        setSuggestLoading(false);
        if (status === 'OK' && preds?.length) {
          setSuggestions(preds);
          setListOpen(true);
        } else {
          setSuggestions([]);
          setListOpen(false);
        }
      });
    },
    [typesKey]
  );

  const handleChange = (e) => {
    const next = e.target.value;
    onChange(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(next), 280);
  };

  const pickPrediction = (prediction) => {
    const maps = mapsRef.current;
    const label = prediction.description || '';

    if (!maps?.places?.PlacesService) {
      onChange(label);
      onPlaceSelect?.({ label, formattedAddress: label });
      setSuggestions([]);
      setListOpen(false);
      return;
    }

    const holder = document.createElement('div');
    const placesService = new maps.places.PlacesService(holder);
    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name'],
        sessionToken: sessionTokenRef.current || undefined,
      },
      (place, status) => {
        try {
          sessionTokenRef.current = new maps.places.AutocompleteSessionToken();
        } catch {
          /* ignore */
        }

        if (status === 'OK' && place) {
          const parsed = parseGooglePlace(place);
          onChange(parsed.label);
          onPlaceSelect?.(parsed);
        } else {
          onChange(label);
          onPlaceSelect?.({ label, formattedAddress: label });
        }
        setSuggestions([]);
        setListOpen(false);
      }
    );
  };

  const hint = isGooglePlacesConfigured()
    ? suggestLoading
      ? 'Searching…'
      : 'Type freely to edit, or pick a suggestion'
    : 'Type your city or area (add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for suggestions)';

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        type="text"
        value={value ?? ''}
        onChange={handleChange}
        onFocus={() => {
          if (suggestions.length) setListOpen(true);
        }}
        placeholder={placeholder}
        className={`${className} disabled:opacity-60`}
        disabled={Boolean(disabled)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="search"
      />
      <p className="text-xs text-gray-400 mt-1">{hint}</p>

      {listOpen && suggestions.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full mt-1 z-[10050] max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
          role="listbox"
        >
          {suggestions.map((s) => (
            <li key={s.place_id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickPrediction(s)}
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
