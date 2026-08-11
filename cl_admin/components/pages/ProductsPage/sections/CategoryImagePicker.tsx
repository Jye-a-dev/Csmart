'use client';

import { useState } from 'react';
import { Upload, Trash2, Link as LinkIcon, Plus } from 'lucide-react';

interface CategoryImagePickerProps {
  label: string;
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}

export default function CategoryImagePicker({
  label,
  imageUrl,
  onChange,
}: CategoryImagePickerProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const compressAndReadImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressAndReadImage(file);
    onChange(base64);
    e.target.value = '';
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-1.5 font-mono">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-mono font-bold uppercase text-[#09090B]">{label}</label>
        {!imageUrl && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] text-zinc-600 underline font-bold hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon size={12} />
            {showUrlInput ? 'Ẩn nhâp URL' : 'Dán Link URL'}
          </button>
        )}
      </div>

      {showUrlInput && !imageUrl && (
        <div className="flex gap-1 border-2 border-[#09090B] bg-white p-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Link URL ảnh (https://...)"
            className="flex-1 px-2 py-1 text-[11px] font-mono border border-zinc-300 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-2 py-1 bg-[#09090B] text-white text-[10px] font-bold uppercase border border-[#09090B]"
          >
            <Plus size={12} />
          </button>
        </div>
      )}

      <div className="border-2 border-[#09090B] bg-zinc-50 p-2.5 flex items-center justify-between gap-3">
        {imageUrl ? (
          <div className="flex items-center gap-3 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Category Thumbnail"
              className="w-12 h-12 object-cover border-2 border-[#09090B] bg-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="block font-mono text-[10px] text-emerald-600 font-bold truncate">✓ Đã gắn ảnh</span>
              <span className="block font-mono text-[9px] text-zinc-400 truncate" title={imageUrl}>
                {imageUrl.startsWith('data:') ? 'Lưu dữ liệu local' : imageUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-1.5 bg-rose-500 text-white border-2 border-[#09090B] shadow-[1px_1px_0px_0px_#09090B] hover:bg-rose-600 shrink-0"
              title="Xóa ảnh"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer w-full py-2 border-2 border-dashed border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-zinc-100 transition-all">
            <Upload size={14} />
            Chọn ảnh từ máy
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
