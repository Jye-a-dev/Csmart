'use client';

export default function CircuitGraphic() {
  return (
    <div className="mx-auto w-36 h-20 border-2 border-dashed border-[#09090B] bg-zinc-50 flex items-center justify-center relative mb-8 shadow-[2px_2px_0px_0px_#09090B]">
      {/* Disconnected wires */}
      <svg className="w-full h-full px-4" viewBox="0 0 100 40">
        {/* Left wire */}
        <path d="M 0,20 L 35,20" stroke="#09090B" strokeWidth="3" fill="none" />
        <circle cx="35" cy="20" r="3.5" fill="#09090B" />
        {/* Right wire (disconnected) */}
        <circle cx="65" cy="28" r="3.5" fill="#09090B" />
        <path d="M 65,28 L 100,28" stroke="#09090B" strokeWidth="3" fill="none" />
        {/* Warning exclamation badge */}
        <rect x="44" y="8" width="12" height="20" fill="#F97316" stroke="#09090B" strokeWidth="2" transform="rotate(15 50 18)" />
        <text x="47" y="24" fill="#09090B" fontSize="14" fontWeight="black" fontFamily="monospace" transform="rotate(15 50 18)">!</text>
      </svg>
      {/* Flashing warning LED */}
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
      </div>
    </div>
  );
}
