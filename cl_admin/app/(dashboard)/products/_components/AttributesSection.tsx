'use client';

import { Plus, Trash2 } from 'lucide-react';

interface AttributesSectionProps {
  attributes: Record<string, unknown>;
  attrKey: string;
  attrVal: string;
  setAttrKey: (v: string) => void;
  setAttrVal: (v: string) => void;
  onAddAttr: () => void;
  onRemoveAttr: (k: string) => void;
}

export function AttributesSection({
  attributes,
  attrKey,
  attrVal,
  setAttrKey,
  setAttrVal,
  onAddAttr,
  onRemoveAttr,
}: AttributesSectionProps) {
  const entries = Object.entries(attributes);

  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">
        Thuộc tính JSONB ({entries.length})
      </div>
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="Key (VD: chất liệu)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
          <input value={attrVal} onChange={(e) => setAttrVal(e.target.value)} placeholder="Value (VD: 100% Cotton)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
          <button type="button" onClick={onAddAttr} className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer">
            <Plus size={13} />
          </button>
        </div>
        {entries.length === 0 ? (
          <p className="font-mono text-xs text-zinc-400 italic">Chưa có thuộc tính nào.</p>
        ) : (
          <div className="space-y-1">
            {entries.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between p-2 border border-zinc-200 bg-zinc-50 font-mono text-xs">
                <span><strong>{k}:</strong> {String(v)}</span>
                <button type="button" onClick={() => onRemoveAttr(k)} className="text-rose-500 hover:text-rose-700 cursor-pointer ml-2"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
