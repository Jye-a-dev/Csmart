'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFaqs } from '@/hooks';
import { Faq, CreateFaqDto, UpdateFaqDto } from '@/types/common/faq';
import { HelpCircle, RefreshCw, Plus, Pencil, Trash2, Search, X, Save, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

function FaqModal({
  isOpen,
  onClose,
  faq,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  faq: Faq | null;
  onSubmit: (id?: number, data?: CreateFaqDto | UpdateFaqDto) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateFaqDto>({ topic: '', question: '', answer: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (faq) {
      setForm({ topic: faq.topic, question: faq.question, answer: faq.answer, is_active: faq.is_active });
    } else {
      setForm({ topic: '', question: '', answer: '', is_active: true });
    }
  }, [faq, isOpen]);

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

export default function FaqsPage() {
  const { loading, findAllFaqs, createFaq, updateFaq, removeFaq } = useFaqs();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const data = await findAllFaqs({ limit: 300 });
      setFaqs(data || []);
    } catch {
      showToast('Không thể tải FAQs', 'err');
    }
  }, [findAllFaqs]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const topics = ['ALL', ...Array.from(new Set(faqs.map((f) => f.topic))).sort()];

  const filtered = faqs.filter((f) => {
    const topicMatch = topicFilter === 'ALL' || f.topic === topicFilter;
    const searchMatch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    return topicMatch && searchMatch;
  });

  const handleSubmit = async (id?: number, data?: CreateFaqDto | UpdateFaqDto) => {
    if (!data) return;
    try {
      if (id) {
        await updateFaq(id, data as UpdateFaqDto);
        showToast('Đã cập nhật FAQ!');
      } else {
        await createFaq(data as CreateFaqDto);
        showToast('Đã tạo FAQ mới!');
      }
      void load();
    } catch {
      showToast('Lỗi khi lưu FAQ', 'err');
      throw new Error('Save failed');
    }
  };

  const handleToggle = async (faq: Faq) => {
    setTogglingId(faq.id);
    try {
      await updateFaq(faq.id, { is_active: !faq.is_active });
      void load();
    } catch {
      showToast('Lỗi khi thay đổi trạng thái', 'err');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa FAQ này?')) return;
    try {
      await removeFaq(id);
      showToast('Đã xóa FAQ');
      void load();
    } catch {
      showToast('Lỗi khi xóa FAQ', 'err');
    }
  };

  const activeCount = faqs.filter((f) => f.is_active).length;

  return (
    <div className="space-y-8 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <FaqModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedFaq(null); }}
        faq={selectedFaq}
        onSubmit={handleSubmit}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#09090B] text-[#F97316]"><HelpCircle size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">Quản Lý FAQs</h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">{faqs.length} câu hỏi · {activeCount} đang kích hoạt · Phục vụ endpoint ASK_FAQ</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => { setSelectedFaq(null); setIsModalOpen(true); }} className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 text-xs">
            <Plus size={15} /> Thêm FAQ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400"><Search size={14} /></div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm câu hỏi, câu trả lời..." className="w-full pl-9 pr-4 py-2.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white shadow-[2px_2px_0px_0px_#09090B]" />
        </div>
        <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
          {topics.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'Tất cả topic' : t}</option>)}
        </select>
      </div>

      {/* FAQ Table */}
      {loading && filtered.length === 0 ? (
        <div className="text-center py-16 font-mono text-zinc-500 italic">Đang tải FAQs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-[#09090B]/15">
          <HelpCircle size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="font-mono text-zinc-500 font-bold">Chưa có FAQ nào.</p>
        </div>
      ) : (
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
                      onClick={() => handleToggle(faq)}
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
                      <button onClick={() => { setSelectedFaq(faq); setIsModalOpen(true); }} className="p-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(faq.id)} className="p-1.5 border-2 border-[#09090B] bg-rose-400 text-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
