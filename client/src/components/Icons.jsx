import React from 'react';

const svgProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function TruckIcon({ size = 20 }) {
  return (
    <svg {...svgProps} width={size} height={size}>
      <path d="M3 6.5h10v10H3z" />
      <path d="M13 10h4l4 4v2.5h-8z" />
      <circle cx="7" cy="18.5" r="1.7" />
      <circle cx="17" cy="18.5" r="1.7" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 20 }) {
  return (
    <svg {...svgProps} width={size} height={size}>
      <path d="M12 3.2 19 6v5.2c0 4.4-2.6 7.9-7 9.6-4.4-1.7-7-5.2-7-9.6V6z" />
      <path d="m8.5 12.2 2.2 2.2 4.8-5" />
    </svg>
  );
}

export function HeadsetIcon({ size = 20 }) {
  return (
    <svg {...svgProps} width={size} height={size}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13h3v5H5a1 1 0 0 1-1-1z" />
      <path d="M20 13h-3v5h2a1 1 0 0 0 1-1z" />
      <path d="M17 18c0 1.1-.9 2-2 2h-2" />
    </svg>
  );
}

export function Spinner({ size = 18, className = '' }) {
  return <span className={`button-spinner ${className}`} style={{ width: size, height: size }} aria-hidden="true" />;
}
