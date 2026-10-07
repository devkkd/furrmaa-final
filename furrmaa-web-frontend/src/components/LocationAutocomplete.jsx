'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  isGooglePlacesConfigured,
  loadGoogleMapsPlaces,
  parseGooglePlace,
} from '@/lib/googlePlaces';

/**
 * Google AutocompleteService types cannot mix e.g. establishment + geocode.
 * Invalid types make predictions fail and the field feels "stuck".
 */
function normalizePlacesTypes(types) {
  const list = (Array.isArray(types) ? types : String(types || '').split(','))
    .map((t) => String(t).trim())
    .filter(Boolean);
  if (!list.length) return undefined;
  const hasEst = list.includes('establishment');
  const hasGeo = list.some((t) => t === 'geocode' || t === 'address');
  if (hasEst && hasGeo) return undefined;
  if (list.length > 1 && list.some((t) => t.startsWith('('))) return undefined;
  return list;
}

/**
 * Location input with Google Places suggestions.
 * Custom dropdown (no Autocomplete widget) so the field never goes readonly/disabled.
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
  const [menuPos, setMenuPos] = useState(null);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const mapsRef = useRef(null);
  const serviceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const debounceRef = useRef(null);
  const typesNorm = normalizePlacesTypes(types);
  const typesKey = typesNorm ? typesNorm.join(',') : '';

  const unlockInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.removeAttribute('readonly');
    el.removeAttribute('disabled');
    if (el.readOnly) el.readOnly = false;
    if (el.disabled && !disabled) el.disabled = false;
  };

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

  const updateMenuPos = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 200),
    });
  }, []);

  useLayoutEffect(() => {
    if (!listOpen) return undefined;
    updateMenuPos();
    const onScroll = () => updateMenuPos();
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [listOpen, suggestions.length, updateMenuPos]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        const menu = document.getElementById('furrmaa-places-menu');
        if (menu && menu.contains(e.target)) return;
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
      if (typesNorm?.length) req.types = typesNorm;

      serviceRef.current.getPlacePredictions(req, (preds, status) => {
        setSuggestLoading(false);
        unlockInput();
        if (status === 'OK' && preds?.length) {
          setSuggestions(preds);
          setListOpen(true);
          requestAnimationFrame(updateMenuPos);
        } else {
          setSuggestions([]);
          setListOpen(false);
        }
      });
    },
    [typesKey, typesNorm, updateMenuPos]
  );

  const handleChange = (e) => {
    unlockInput();
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
      unlockInput();
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
        unlockInput();
        inputRef.current?.focus();
      }
    );
  };

  const hint = isGooglePlacesConfigured()
    ? suggestLoading
      ? 'Searching…'
      : 'Type freely to edit, or pick a suggestion'
    : 'Type your city or area (add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for suggestions)';

  const menu =
    typeof document !== 'undefined' &&
    listOpen &&
    suggestions.length > 0 &&
    menuPos ? (
      <ul
        id="furrmaa-places-menu"
        className="z-[10050] max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
        style={{
          position: 'fixed',
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
        }}
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
    ) : null;

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value ?? ''}
        onChange={handleChange}
        onFocus={() => {
          unlockInput();
          if (suggestions.length) {
            setListOpen(true);
            updateMenuPos();
          }
        }}
        onClick={unlockInput}
        placeholder={placeholder}
        className={`${className} bg-white ${disabled ? 'opacity-60' : ''}`}
        disabled={false}
        readOnly={false}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="search"
      />
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}
