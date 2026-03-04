function TattooRose({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      <circle cx="60" cy="52" r="22" stroke="#c084fc" strokeWidth="1.5" />
      <ellipse cx="60" cy="52" rx="14" ry="10" stroke="#c084fc" strokeWidth="1.2" />
      <ellipse cx="60" cy="44" rx="9" ry="6" stroke="#c084fc" strokeWidth="1.2" />
      <ellipse cx="68" cy="50" rx="8" ry="5" stroke="#c084fc" strokeWidth="1" transform="rotate(30 68 50)" />
      <ellipse cx="52" cy="50" rx="8" ry="5" stroke="#c084fc" strokeWidth="1" transform="rotate(-30 52 50)" />
      <ellipse cx="60" cy="62" rx="8" ry="5" stroke="#c084fc" strokeWidth="1" />
      <line x1="60" y1="74" x2="60" y2="105" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="48" cy="88" rx="10" ry="5" stroke="#4ade80" strokeWidth="1.2" transform="rotate(-30 48 88)" />
      <ellipse cx="72" cy="94" rx="10" ry="5" stroke="#4ade80" strokeWidth="1.2" transform="rotate(30 72 94)" />
      <circle cx="60" cy="52" r="4" stroke="#c084fc" strokeWidth="1" />
    </svg>
  );
}

function TattooButterfly({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      <path d="M60 60 Q35 30 20 48 Q10 62 35 72 Q48 76 60 60Z"
        stroke="#38bdf8" strokeWidth="1.5" fill="rgba(56,189,248,0.07)" />
      <path d="M60 60 Q85 30 100 48 Q110 62 85 72 Q72 76 60 60Z"
        stroke="#38bdf8" strokeWidth="1.5" fill="rgba(56,189,248,0.07)" />
      <path d="M60 60 Q42 72 38 90 Q50 100 60 82 Z"
        stroke="#a78bfa" strokeWidth="1.2" fill="rgba(167,139,250,0.07)" />
      <path d="M60 60 Q78 72 82 90 Q70 100 60 82 Z"
        stroke="#a78bfa" strokeWidth="1.2" fill="rgba(167,139,250,0.07)" />
      <ellipse cx="60" cy="65" rx="3" ry="14" stroke="#f472b6" strokeWidth="1.2" />
      <line x1="58" y1="53" x2="46" y2="42" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
      <line x1="62" y1="53" x2="74" y2="42" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="44" cy="40" r="2" stroke="#38bdf8" strokeWidth="1" />
      <circle cx="76" cy="40" r="2" stroke="#38bdf8" strokeWidth="1" />
    </svg>
  );
}

function TattooGeometric({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      <polygon points="60,18 95,80 25,80" stroke="#34d399" strokeWidth="1.5" fill="rgba(52,211,153,0.06)" />
      <polygon points="60,32 83,72 37,72" stroke="#34d399" strokeWidth="1" fill="rgba(52,211,153,0.06)" />
      <circle cx="60" cy="60" r="16" stroke="#fb923c" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="8" stroke="#fb923c" strokeWidth="1" />
      <circle cx="60" cy="60" r="2.5" fill="#fb923c" />
      <line x1="60" y1="80" x2="60" y2="105" stroke="#34d399" strokeWidth="1.2" strokeDasharray="3 3" />
      <line x1="25" y1="80" x2="60" y2="105" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="95" y1="80" x2="60" y2="105" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="60" cy="18" r="2.5" fill="#34d399" />
      <circle cx="95" cy="80" r="2.5" fill="#34d399" />
      <circle cx="25" cy="80" r="2.5" fill="#34d399" />
    </svg>
  );
}

const MAP = { rose: TattooRose, butterfly: TattooButterfly, geometric: TattooGeometric };

export default function TattooSvg({ tattooKey, className = "tattooSvg" }) {
  const Component = MAP[tattooKey] || TattooRose;
  return <Component className={className} />;
}
