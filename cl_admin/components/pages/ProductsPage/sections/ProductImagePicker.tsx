'use client';

import { useState } from 'react';
import { Upload, Trash2, Link as LinkIcon, Plus } from 'lucide-react';

interface ProductImagePickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ProductImagePicker({
  images,
  onChange,
  maxImages = 20
}: ProductImagePickerProps) {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

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

  const handleMultiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      alert(`Chỉ được phép tải tối đa ${maxImages} ảnh cho mỗi sản phẩm.`);
    }

    const availableSlots = maxImages - images.length;
    const selectedFiles = files.slice(0, availableSlots);

    const newBase64Images = await Promise.all(selectedFiles.map(file => compressAndReadImage(file)));
    onChange([...images, ...newBase64Images]);
    e.target.value = '';
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      alert(`Chỉ được phép tải tối đa ${maxImages} ảnh cho mỗi sản phẩm.`);
      return;
    }
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="border-2 border-dashed border-[#09090B] p-4 bg-zinc-50 space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <label className="block text-xs font-mono font-bold uppercase text-[#09090B]">
          🖼️ Hình ảnh sản phẩm ({images.length}/{maxImages} ảnh local / URL)
        </label>
        {images.length < maxImages && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-3 py-1.5 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LinkIcon size={14} />
              Gắn Link URL
            </button>

            <label className="cursor-pointer px-3 py-1.5 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1.5">
              <Upload size={14} />
              Thêm ảnh local
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultiFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* External URL Input Box */}
      {showUrlInput && (
        <div className="flex gap-2 p-2 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B]">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Dán đường dẫn URL hình ảnh từ bên ngoài (https://...)"
            className="flex-1 px-3 py-1.5 border border-[#09090B] font-mono text-xs focus:outline-none"
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
            className="px-4 py-1.5 border-2 border-[#09090B] bg-[#09090B] text-white font-mono text-xs font-bold uppercase hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            Thêm
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
        {images.map((imgUrl, idx) => (
          <div key={idx} className="border-2 border-[#09090B] bg-white p-1 relative group h-24 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={`Ảnh sản phẩm ${idx + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 p-1 bg-rose-500 text-white border border-[#09090B] shadow-[1px_1px_0px_0px_#09090B]"
              title="Xóa ảnh"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-4 text-center py-6 text-zinc-400 font-mono text-xs italic">
            Chưa chọn ảnh nào. Chọn ảnh từ máy hoặc bấm &quot;Gắn Link URL&quot; để thêm ảnh từ bên ngoài.
          </div>
        )}
      </div>
    </div>
  );
}
