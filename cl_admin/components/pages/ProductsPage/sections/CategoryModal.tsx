'use client';

import { useState, useEffect } from 'react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';
import { X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  categories: Category[];
  onSubmit: (id?: string, payload?: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  categories,
  onSubmit
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!category) {
      setSlug(generateSlug(val));
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (category) {
          setName(category.name);
          setSlug(category.slug);
          setParentId(category.parent_id || undefined);
          setDescription(category.description || '');
        } else {
          setName('');
          setSlug('');
          setParentId(undefined);
          setDescription('');
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert('Vui lòng nhập tên danh mục và slug.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateCategoryDto = {
        name,
        slug,
        parent_id: parentId || undefined,
        description: description || undefined
      };

      await onSubmit(category?.id, payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi lưu danh mục.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out self from parent candidates to prevent circular reference
  const availableParents = categories.filter(c => !category || c.id !== category.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09090B]/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-md p-6 shadow-[8px_8px_0px_0px_#09090B] relative">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B]"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-extrabold uppercase border-b-2 border-[#09090B] pb-3 mb-6">
          {category ? '📝 Sửa danh mục' : '➕ Thêm danh mục mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Tên Danh Mục *</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Vd: Quần áo nam"
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Đường dẫn tĩnh (Slug) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="quan-ao-nam"
              className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Danh Mục Cha</label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || undefined)}
              className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-xs font-bold focus:outline-none bg-white cursor-pointer"
            >
              <option value="">Không có</option>
              {availableParents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Mô tả danh mục</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả danh mục..."
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none h-20 resize-none bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 border-t-2 border-[#09090B] pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase hover:bg-zinc-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border-2 border-[#09090B] bg-[#09090B] text-white font-mono text-xs font-bold uppercase hover:bg-zinc-800"
            >
              {category ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
