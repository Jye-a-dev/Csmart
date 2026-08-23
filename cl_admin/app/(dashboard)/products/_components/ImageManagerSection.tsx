'use client';

import { Plus, Trash2, AlertTriangle } from 'lucide-react';

interface ImageManagerSectionProps {
  images: string[];
  imgInput: string;
  setImgInput: (v: string) => void;
  onAddImg: () => void;
  onRemoveImg: (i: number) => void;
}

export function ImageManagerSection({ images, imgInput, setImgInput, onAddImg, onRemoveImg }: ImageManagerSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Hình ảnh ({images.length})</div>
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <input value={imgInput} onChange={(e) => setImgInput(e.target.value)} placeholder="URL hình ảnh (https://...)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
          <button type="button" onClick={onAddImg} className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer"><Plus size={13} /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative border-2 border-[#09090B] aspect-square overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f4f4f5" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23a1a1aa" font-size="10">No Image</text></svg>'; }} />
              <button type="button" onClick={() => onRemoveImg(i)} className="absolute top-1 right-1 p-1 bg-rose-500 text-white border border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Trash2 size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-[#09090B]/70 p-1">
                <p className="font-mono text-[9px] text-white truncate">{url}</p>
              </div>
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <AlertTriangle size={12} /> Chưa có hình ảnh nào.
          </div>
        )}
      </div>
    </section>
  );
}
