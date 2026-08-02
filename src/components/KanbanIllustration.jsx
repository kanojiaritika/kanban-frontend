import React from "react";

const KanbanIllustration = () => {
  return (
    <div className="relative w-full max-w-md aspect-[6/5]">
      <style>{`
        @keyframes kb-float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes kb-drift { 0%,100% { transform: translate(0,0) rotate(-4deg); } 50% { transform: translate(6px,-10px) rotate(-2deg); } }
        .kb-card-a { animation: kb-float 5s ease-in-out infinite; }
        .kb-card-b { animation: kb-float 6s ease-in-out infinite 0.4s; }
        .kb-card-c { animation: kb-float 5.5s ease-in-out infinite 0.8s; }
        .kb-card-drag { animation: kb-drift 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kb-card-a, .kb-card-b, .kb-card-c, .kb-card-drag { animation: none; }
        }
      `}</style>
      <svg viewBox="0 0 480 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="16" y="24" width="136" height="330" rx="14" fill="#16213A" fillOpacity="0.35" />
        <rect x="172" y="24" width="136" height="330" rx="14" fill="#16213A" fillOpacity="0.35" />
        <rect x="328" y="24" width="136" height="330" rx="14" fill="#16213A" fillOpacity="0.35" />

        <text x="34" y="52" fill="#97A3C4" fontFamily="Space Grotesk, sans-serif" fontSize="13" letterSpacing="0.5">TO DO</text>
        <text x="190" y="52" fill="#97A3C4" fontFamily="Space Grotesk, sans-serif" fontSize="13" letterSpacing="0.5">IN PROGRESS</text>
        <text x="346" y="52" fill="#97A3C4" fontFamily="Space Grotesk, sans-serif" fontSize="13" letterSpacing="0.5">DONE</text>

        <g className="kb-card-a">
          <rect x="30" y="70" width="108" height="60" rx="10" fill="#FAF9F6" />
          <rect x="42" y="82" width="24" height="6" rx="3" fill="#FBBF24" />
          <rect x="42" y="96" width="76" height="6" rx="3" fill="#D9DCE5" />
          <rect x="42" y="108" width="52" height="6" rx="3" fill="#D9DCE5" />
        </g>
        <g className="kb-card-b">
          <rect x="30" y="146" width="108" height="60" rx="10" fill="#FAF9F6" />
          <rect x="42" y="158" width="24" height="6" rx="3" fill="#FB7367" />
          <rect x="42" y="172" width="64" height="6" rx="3" fill="#D9DCE5" />
          <rect x="42" y="184" width="44" height="6" rx="3" fill="#D9DCE5" />
        </g>

        <g className="kb-card-c">
          <rect x="186" y="70" width="108" height="60" rx="10" fill="#FAF9F6" />
          <rect x="198" y="82" width="24" height="6" rx="3" fill="#14B8A6" />
          <rect x="198" y="96" width="72" height="6" rx="3" fill="#D9DCE5" />
          <rect x="198" y="108" width="48" height="6" rx="3" fill="#D9DCE5" />
        </g>

        <g className="kb-card-drag">
          <rect x="255" y="200" width="108" height="60" rx="10" fill="#FFFFFF" stroke="#14B8A6" strokeWidth="1.5" />
          <rect x="267" y="212" width="24" height="6" rx="3" fill="#14B8A6" />
          <rect x="267" y="226" width="68" height="6" rx="3" fill="#D9DCE5" />
          <rect x="267" y="238" width="40" height="6" rx="3" fill="#D9DCE5" />
        </g>

        <g className="kb-card-a">
          <rect x="342" y="70" width="108" height="60" rx="10" fill="#FAF9F6" />
          <circle cx="358" cy="88" r="9" fill="#14B8A6" />
          <path d="M354 88l3 3 6-6" stroke="#FAF9F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="374" y="85" width="60" height="6" rx="3" fill="#D9DCE5" />
          <rect x="358" y="108" width="76" height="6" rx="3" fill="#D9DCE5" />
        </g>
        <g className="kb-card-b">
          <rect x="342" y="146" width="108" height="60" rx="10" fill="#FAF9F6" />
          <circle cx="358" cy="164" r="9" fill="#14B8A6" />
          <path d="M354 164l3 3 6-6" stroke="#FAF9F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="374" y="161" width="52" height="6" rx="3" fill="#D9DCE5" />
          <rect x="358" y="184" width="66" height="6" rx="3" fill="#D9DCE5" />
        </g>
      </svg>
    </div>
  );
};

export default KanbanIllustration;