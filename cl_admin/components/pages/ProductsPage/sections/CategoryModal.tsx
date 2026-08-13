'use client';

import { useState, useEffect } from 'react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';
import { X } from 'lucide-react';
import CategoryImagePicker from './CategoryImagePicker';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  categories: Category[];
  defaultParentId?: string;
  onSubmit: (id?: string, payload?: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  categories,
  defaultParentId,
  onSubmit
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [imageUrl1, setImageUrl1] = useState<string | null>(null);
  const [imageUrl2, setImageUrl2] = useState<string | null>(null);
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
          setImageUrl1(category.image_url_1 || null);
          setImageUrl2(category.image_url_2 || null);
        } else {
          setName('');
          setSlug('');
          setParentId(defaultParentId || undefined);
          setDescription('');
          setImageUrl1(null);
          setImageUrl2(null);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [category, defaultParentId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert('Vui lòng nhập tên danh mục và slug.');
      return;
    }

    setSubmitting(true);
    try {
      const strParentId = parentId != null ? String(parentId).trim() : '';
      const cleanParentId = strParentId && strParentId !== 'null' && strParentId !== 'undefined' ? strParentId : undefined;
      const payload: CreateCategoryDto = {
        name,
        slug,
        parent_id: cleanParentId,
        description: description || undefined,
        image_url_1: imageUrl1 ? imageUrl1 : null,
        image_url_2: imageUrl2 ? imageUrl2 : null
      };

      if (!payload.parent_id) {
        delete payload.parent_id;
      }

      await onSubmit(category?.id, payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi lưu danh mục.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const availableParents = categories.filter((c) => !category || String(c.id) !== String(category.id));
  const isParentLocked = !category && defaultParentId != null && String(defaultParentId).trim() !== '';
  const lockedParentCategory = defaultParentId != null ? categories.find((c) => String(c.id) === String(defaultParentId)) : null;

  return (
    <div className="fixed inset-0 bg-[#09090B]/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-lg p-6 shadow-[8px_8px_0px_0px_#09090B] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B]"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-extrabold uppercase border-b-2 border-[#09090B] pb-3 mb-6">
          {category
            ? '📝 Sửa Danh Mục'
            : lockedParentCategory
            ? `➕ Thêm Danh Mục Con thuộc "${lockedParentCategory.name}"`
            : '➕ Thêm Danh Mục Mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Tên Danh Mục *</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Ví dụ: Áo Sơ Mi"
              className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Đường dẫn tĩnh (Slug) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ao-so-mi"
              className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Danh Mục Cha</label>
            {isParentLocked && lockedParentCategory ? (
              <div className="w-full px-3 py-2.5 border-2 border-[#09090B] bg-amber-50 font-mono text-xs font-black text-[#09090B] flex items-center justify-between shadow-[2px_2px_0px_0px_#09090B]">
                <span className="flex items-center gap-2">
                  📁 <span className="underline">{lockedParentCategory.name}</span>
                </span>
              </div>
            ) : (
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || undefined)}
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-xs font-bold focus:outline-none bg-white cursor-pointer"
              >
                <option value="">Không có (Danh mục gốc)</option>
                {availableParents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về danh mục này..."
              className="w-full px-3 py-2 border-2 border-[#09090B] font-sans text-xs focus:outline-none h-20 resize-none bg-white"
            />
          </div>

          {/* Local Image Uploaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-2 border-[#09090B] p-3 bg-zinc-100">
            <CategoryImagePicker label="Hình ảnh 1 (Local)" imageUrl={imageUrl1} onChange={setImageUrl1} />
            <CategoryImagePicker label="Hình ảnh 2 (Local)" imageUrl={imageUrl2} onChange={setImageUrl2} />
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
