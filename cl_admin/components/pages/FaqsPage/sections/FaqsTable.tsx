'use client';

import { Faq } from '@/types/common/faq';
import { HelpCircle, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface FaqsTableProps {
  loading: boolean;
  filtered: Faq[];
  togglingId: string | null;
  onToggle: (faq: Faq) => void;
  onEdit: (faq: Faq) => void;
  onDelete: (id: string) => void;
}

export function FaqsTable({
  loading,
  filtered,
  togglingId,
  onToggle,
  onEdit,
  onDelete,
}: FaqsTableProps) {
  if (loading && filtered.length === 0) {
    return <div className="text-center py-16 font-mono text-zinc-500 italic">Đang tải FAQs...</div>;
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 border-4 border-dashed border-[#09090B]/15">
        <HelpCircle size={40} className="mx-auto mb-3 text-zinc-300" />
        <p className="font-mono text-zinc-500 font-bold">Chưa có FAQ nào.</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B]">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="bg-[#09090B] text-white">
            {['#', 'Topic', 'Câu hỏi', 'Câu trả lời', 'Trạng thái', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-black uppercase whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((faq, i) => (
            <tr key={faq.id} className={`border-t-2 border-[#09090B] ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}>
              <td className="px-4 py-3 font-black text-zinc-400">#{faq.id}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 border-2 border-[#09090B] bg-[#09090B] text-white text-[10px] font-black uppercase">{faq.topic}</span>
              </td>
              <td className="px-4 py-3 max-w-50"><span className="line-clamp-2 font-semibold text-[#09090B]">{faq.question}</span></td>
              <td className="px-4 py-3 max-w-70"><span className="line-clamp-2 text-zinc-500 italic">{faq.answer}</span></td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggle(faq)}
                  disabled={togglingId === faq.id}
                  className="cursor-pointer disabled:opacity-50"
                >
                  {faq.is_active
                    ? <ToggleRight size={24} className="text-emerald-500" />
                    : <ToggleLeft size={24} className="text-zinc-300" />}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(faq)} className="p-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => onDelete(faq.id)} className="p-1.5 border-2 border-[#09090B] bg-rose-400 text-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
