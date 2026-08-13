'use client';

import { Plus, Trash2 } from 'lucide-react';

interface TagManagerSectionProps {
  tags: string[];
  tagInput: string;
  setTagInput: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (i: number) => void;
}

export function TagManagerSection({ tags, tagInput, setTagInput, onAddTag, onRemoveTag }: TagManagerSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Tags</div>
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag(); } }}
            placeholder="Nhập tag rồi Enter..."
            className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none"
          />
          <button type="button" onClick={onAddTag} className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer"><Plus size={13} /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-1 border-2 border-[#09090B] bg-zinc-100 font-mono text-xs font-bold">
              {tag}
              <button type="button" onClick={() => onRemoveTag(i)} className="text-zinc-400 hover:text-rose-600 cursor-pointer"><Trash2 size={10} /></button>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
