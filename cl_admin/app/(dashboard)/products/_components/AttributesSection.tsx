'use client';

import { Plus, Trash2, SlidersHorizontal, Sparkles } from 'lucide-react';

interface AttributesSectionProps {
  attributes: Record<string, unknown>;
  attrKey: string;
  attrVal: string;
  setAttrKey: (v: string) => void;
  setAttrVal: (v: string) => void;
  onAddAttr: () => void;
  onRemoveAttr: (k: string) => void;
}

const COMMON_PRESETS = [
  'Chất liệu',
  'Bảo hành',
  'Xuất xứ',
  'Kích thước',
  'Trọng lượng',
  'Công suất',
];

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

  const handlePresetClick = (preset: string) => {
    setAttrKey(preset);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (attrKey.trim() && attrVal.trim()) {
        onAddAttr();
      }
    }
  };

  return (
    <section className="bg-white border-2 border-zinc-900 shadow-[3px_3px_0px_0px_#09090B] overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-orange-400" />
          <h3 className="text-xs font-black uppercase tracking-wider font-sans">
            Thuộc Tính Động (Key-Value)
          </h3>
        </div>
        <span className="text-[11px] font-mono bg-zinc-800 text-orange-400 px-2 py-0.5 rounded border border-zinc-700">
          {entries.length} thuộc tính
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mr-1">
            <Sparkles size={12} className="text-orange-500" /> Gợi ý nhanh:
          </span>
          {COMMON_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="text-[11px] px-2.5 py-1 bg-zinc-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 text-zinc-700 border border-zinc-200 rounded-md transition-colors cursor-pointer"
            >
              +{preset}
            </button>
          ))}
        </div>

        {/* Key-Value Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5">
            <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
              Tên thuộc tính (Key)
            </label>
            <input
              type="text"
              value={attrKey}
              onChange={(e) => setAttrKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ví dụ: Chất liệu, Bảo hành..."
              className="w-full border-2 border-zinc-900 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
              Giá trị (Value)
            </label>
            <input
              type="text"
              value={attrVal}
              onChange={(e) => setAttrVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ví dụ: 100% Cotton, 12 tháng..."
              className="w-full border-2 border-zinc-900 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              onClick={onAddAttr}
              disabled={!attrKey.trim() || !attrVal.trim()}
              className="w-full py-2.5 px-3 border-2 border-zinc-900 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-200 disabled:border-zinc-300 disabled:text-zinc-400 text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#09090B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              <span>Thêm</span>
            </button>
          </div>
        </div>

        {/* Visual Attributes Cards List */}
        {entries.length === 0 ? (
          <div className="py-6 text-center border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-4">
            <p className="text-xs text-zinc-500 font-medium">
              Chưa có thuộc tính bổ sung nào được tạo.
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Thêm thông số kỹ thuật, cấu hình hoặc đặc điểm sản phẩm bên trên.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {entries.map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between p-3 border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_0px_#09090B] group hover:border-orange-500 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="inline-block px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 text-[10px] font-bold text-zinc-800 uppercase tracking-wide rounded">
                    {k}
                  </div>
                  <div className="text-xs font-semibold text-zinc-900 mt-1 truncate">
                    {String(v)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAttr(k)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors cursor-pointer shrink-0"
                  title="Xóa thuộc tính"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
