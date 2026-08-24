'use client';

interface LandingFooterBarProps {
  onReset: () => void;
  onSave: () => void;
}

export default function LandingFooterBar({ onReset, onSave }: LandingFooterBarProps) {
  return (
    <div className="sticky bottom-6 z-40 flex items-center justify-between bg-zinc-900 text-white p-4 border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B]">
      <div className="text-xs text-zinc-300">
        Các thay đổi sẽ có hiệu lực ngay lập tức trên{' '}
        <span className="text-orange-400 font-mono font-bold">http://localhost:5100/</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-bold border border-zinc-700 cursor-pointer"
        >
          Khôi Phục
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-6 py-2 bg-[#F97316] hover:bg-[#ea580c] text-white text-xs font-mono font-black uppercase shadow-sm cursor-pointer"
        >
          Lưu Cấu Hình
        </button>
      </div>
    </div>
  );
}
