import React from 'react';

interface CollegeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({ size = 'md', className = '' }) => {
  const pixelSize = size === 'sm' ? 36 : size === 'md' ? 48 : size === 'lg' ? 68 : 96;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Outer Circular Rim */}
        <circle cx="50" cy="50" r="48" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="2.5" />
        
        {/* Inner Ring with Decorative Dashes */}
        <circle cx="50" cy="50" r="42" fill="#172554" stroke="#FBBF24" strokeWidth="1" strokeDasharray="2 1.5" />
        <circle cx="50" cy="50" r="38" fill="#1E293B" stroke="#94A3B8" strokeWidth="0.75" />

        {/* Central Lotus Petals (Symbol of Goddess Saraswati & Purity) */}
        <path
          d="M50 48 C42 42 38 52 38 58 C42 62 48 64 50 64 C52 64 58 62 62 58 C62 52 58 42 50 48Z"
          fill="#F59E0B"
          opacity="0.95"
        />
        <path
          d="M50 42 C45 36 34 46 34 54 C39 58 46 60 50 60 C54 60 61 58 66 54 C66 46 55 36 50 42Z"
          fill="#E11D48"
          opacity="0.8"
        />

        {/* Open Book of Knowledge (विद्यया अमृतमश्नुते) */}
        <path
          d="M50 62 C43 59 34 60 30 63 L30 73 C35 70 43 69 50 72 C57 69 65 70 70 73 L70 63 C66 60 57 59 50 62Z"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.2"
        />
        <line x1="50" y1="62" x2="50" y2="72" stroke="#0F172A" strokeWidth="1.2" />

        {/* Lamp of Learning / Diya Flame */}
        <path
          d="M50 32 C48 36 46 39 46 42 C46 44.5 47.8 46 50 46 C52.2 46 54 44.5 54 42 C54 39 52 36 50 32Z"
          fill="#FBBF24"
        />
        <circle cx="50" cy="42" r="2.2" fill="#DC2626" />

        {/* Sun Rays / Radiance */}
        <line x1="50" y1="23" x2="50" y2="28" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="39" y1="26" x2="42" y2="30" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="61" y1="26" x2="58" y2="30" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />

        {/* Tiny Stars on Crest Ring */}
        <circle cx="50" cy="10" r="1.5" fill="#F59E0B" />
        <circle cx="20" cy="50" r="1.5" fill="#F59E0B" />
        <circle cx="80" cy="50" r="1.5" fill="#F59E0B" />
        <circle cx="50" cy="90" r="1.5" fill="#F59E0B" />
      </svg>
    </div>
  );
};
