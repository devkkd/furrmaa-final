'use client';

/**
 * Brand spinner — Furrmaa logo rotates while data loads.
 * size: 'sm' | 'md' | 'lg'
 */
export default function LogoLoader({ size = 'md', className = '', label }) {
  const logoClass =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-10 col-span-full w-full ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
    >
      <img
        src="/images/MainLogo.png"
        alt=""
        className={`${logoClass} object-contain animate-spin`}
        style={{ animationDuration: '1.2s' }}
      />
    </div>
  );
}
