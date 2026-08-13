'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFaqs } from '@/hooks';
import { Faq, CreateFaqDto, UpdateFaqDto } from '@/types/common/faq';
import {
  FaqModal,
  FaqsHeader,
  FaqsFilters,
  FaqsTable,
} from './sections';

export default function FaqsPage() {
  const { loading, findAllFaqs, createFaq, updateFaq, removeFaq } = useFaqs();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleSubmit = async (id?: string, data?: CreateFaqDto | UpdateFaqDto) => {
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

  const handleDelete = async (id: string) => {
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

      {/* Header Section */}
      <FaqsHeader
        totalFaqs={faqs.length}
        activeCount={activeCount}
        loading={loading}
        onRefresh={load}
        onOpenCreateModal={() => { setSelectedFaq(null); setIsModalOpen(true); }}
      />

      {/* Filters Section */}
      <FaqsFilters
        search={search}
        setSearch={setSearch}
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
        topics={topics}
      />

      {/* FAQ Table Section */}
      <FaqsTable
        loading={loading}
        filtered={filtered}
        togglingId={togglingId}
        onToggle={handleToggle}
        onEdit={(faq) => { setSelectedFaq(faq); setIsModalOpen(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
}
