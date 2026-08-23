'use client';

import { useState } from 'react';
import { Faq, CreateFaqDto, UpdateFaqDto } from '@/types/common/faq';
import { X, Save, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq: Faq | null;
  onSubmit: (id?: string, data?: CreateFaqDto | UpdateFaqDto) => Promise<void>;
}

export function FaqModal({ isOpen, onClose, faq, onSubmit }: FaqModalProps) {
  const [prevFaq, setPrevFaq] = useState<Faq | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [form, setForm] = useState<CreateFaqDto>({ topic: '', question: '', answer: '', is_active: true });
  const [saving, setSaving] = useState(false);

  if (faq !== prevFaq || isOpen !== prevIsOpen) {
    setPrevFaq(faq);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setForm(faq ? { topic: faq.topic, question: faq.question, answer: faq.answer, is_active: faq.is_active } : { topic: '', question: '', answer: '', is_active: true });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(faq?.id, form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090B]/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-2xl">
        <div className="bg-[#09090B] text-white px-5 py-3 flex items-center justify-between font-mono font-black uppercase text-sm">
          <span>{faq ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}</span>
          <button onClick={onClose} className="hover:text-[#F97316] cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Topic *</label>
              <input value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} required placeholder="VD: shipping, payment, return..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <button type="button" onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}>
                  {form.is_active ? <ToggleRight size={28} className="text-emerald-500" /> : <ToggleLeft size={28} className="text-zinc-300" />}
                </button>
                <span className="font-mono text-xs font-black text-[#09090B]">Kích hoạt (is_active)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Câu hỏi *</label>
            <input value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} required placeholder="Làm thế nào để đổi địa chỉ giao hàng?" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
          </div>
          <div>
            <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Câu trả lời *</label>
            <textarea value={form.answer} onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))} required rows={5} placeholder="Bạn có thể đổi địa chỉ giao hàng bằng cách..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border-2 border-[#09090B] font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer">Hủy</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {faq ? 'Lưu thay đổi' : 'Tạo FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
