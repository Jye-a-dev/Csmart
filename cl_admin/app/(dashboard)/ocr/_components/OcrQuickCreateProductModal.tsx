'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, PackagePlus, Loader2 } from 'lucide-react';
import { OcrExtractedData } from './OcrProcessingResult';
import { CreateProductDto, ProductStatus } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { OcrPrecheckMatrix, OcrQuickCreateFormFields } from './quick-create';

interface OcrQuickCreateProductModalProps {
  isOpen: boolean;
  result: OcrExtractedData | null;
  categories: Category[];
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirmCreate: (dto: CreateProductDto) => Promise<void>;
}

export function OcrQuickCreateProductModal({
  isOpen,
  result,
  categories,
  isSubmitting = false,
  onClose,
  onConfirmCreate,
}: OcrQuickCreateProductModalProps) {
  // Form State
  const [name, setName] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [colorName, setColorName] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // Helper to generate slug from product name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // Populate data when result changes or modal opens
  useEffect(() => {
    if (!result || !isOpen) return;

    const initialName =
      result.product_name ||
      (result.extracted_items && result.extracted_items[0]?.name) ||
      result.customer_name ||
      '';

    const initialSku =
      result.order_code && result.order_code !== 'N/A'
        ? result.order_code
        : `SKU-${Date.now().toString().slice(-6)}`;

    const initialPrice =
      result.total_amount > 0
        ? result.total_amount
        : result.extracted_items && result.extracted_items[0]?.unit_price
          ? result.extracted_items[0].unit_price
          : 0;

    const initialColor = result.color || result.extracted_items?.[0]?.color || '';
    const initialOrigin = result.origin || result.extracted_items?.[0]?.origin || 'Việt Nam';
    const initialType = result.type || result.extracted_items?.[0]?.type || '';

    // Try auto-matching category
    let matchedCatId = '';
    if (initialType && categories.length > 0) {
      const normalizedType = initialType.toLowerCase();
      const matched = categories.find(
        (c) =>
          c.name.toLowerCase().includes(normalizedType) ||
          normalizedType.includes(c.name.toLowerCase()) ||
          c.slug.toLowerCase().includes(normalizedType)
      );
      if (matched) matchedCatId = matched.id;
    }

    const initialDesc =
      result.raw_text_chunks && result.raw_text_chunks.length > 0
        ? `Sản phẩm quét tự động từ nhãn OCR:\n- Tên: ${initialName}\n- Xuất xứ: ${initialOrigin}\n- Chi tiết nhãn: ${result.raw_text_chunks.join(
          ' '
        )}`
        : `Sản phẩm quét tự động từ nhãn OCR: ${initialName}`;

    // Batch state updates
    const timer = setTimeout(() => {
      setName(initialName);
      setSku(initialSku);
      setSlug(generateSlug(initialName));
      setCategoryId(matchedCatId);
      setBasePrice(initialPrice);
      setStockQuantity(10);
      setColorName(initialColor);
      setOrigin(initialOrigin);
      setDescription(initialDesc);
      setIsPublished(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [result, isOpen, categories]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(generateSlug(val));
  };

  // Real-time Field Validation Check
  const validation = useMemo(() => {
    const isNameValid = name.trim().length >= 2;
    const isSkuValid = sku.trim().length >= 2;
    const isSlugValid = slug.trim().length >= 2;
    const isPriceValid = basePrice >= 0;
    const isStockValid = stockQuantity >= 0;
    const isCategoryMatched = Boolean(categoryId);

    const canSubmit = isNameValid && isSkuValid && isSlugValid && isPriceValid && isStockValid;

    return {
      isNameValid,
      isSkuValid,
      isSlugValid,
      isPriceValid,
      isStockValid,
      isCategoryMatched,
      canSubmit,
    };
  }, [name, sku, slug, basePrice, stockQuantity, categoryId]);

  if (!isOpen || !result) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.canSubmit) return;

    const dto: CreateProductDto = {
      name: name.trim(),
      sku: sku.trim(),
      slug: slug.trim(),
      category_id: categoryId || undefined,
      base_price: Number(basePrice),
      stock_quantity: Number(stockQuantity),
      status: ProductStatus.IN_STOCK,
      is_published: isPublished,
      description: description.trim(),
      short_description: `Xuất xứ: ${origin || 'Chưa rõ'}${colorName ? ` • Màu: ${colorName}` : ''}`,
      colors: colorName.trim()
        ? [{ name: colorName.trim(), hex: '#09090B', in_stock: true }]
        : [],
      images: result.image_url ? [result.image_url] : [],
      attributes: {
        origin: origin.trim() || 'Chưa rõ',
        ocr_extracted: true,
        ocr_confidence: result.confidence_score,
      },
      tags: ['OCR_SCAN', result.type || 'PRODUCT_LABEL'].filter(Boolean),
    };

    await onConfirmCreate(dto);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-4 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-3xl my-8 relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#09090B] text-white p-4 flex items-center justify-between border-b-2 border-[#09090B]">
          <div className="flex items-center gap-2 font-mono font-black text-sm uppercase">
            <div className="p-1.5 bg-emerald-500 text-[#09090B]">
              <PackagePlus size={18} />
            </div>
            <span>TIỀN KIỂM TRA & TẠO SẢN PHẨM TỪ NHÃN OCR</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Sub-component 1: Pre-check Matrix */}
          <OcrPrecheckMatrix validation={validation} />

          {/* Sub-component 2: Quick Create Form Fields */}
          <OcrQuickCreateFormFields
            name={name}
            sku={sku}
            slug={slug}
            categoryId={categoryId}
            basePrice={basePrice}
            stockQuantity={stockQuantity}
            colorName={colorName}
            origin={origin}
            description={description}
            isPublished={isPublished}
            categories={categories}
            onNameChange={handleNameChange}
            onSkuChange={setSku}
            onSlugChange={setSlug}
            onCategoryIdChange={setCategoryId}
            onBasePriceChange={setBasePrice}
            onStockQuantityChange={setStockQuantity}
            onColorNameChange={setColorName}
            onOriginChange={setOrigin}
            onDescriptionChange={setDescription}
            onIsPublishedChange={setIsPublished}
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#09090B]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-5 py-2.5 uppercase border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              HỦY BỎ
            </button>

            <button
              type="submit"
              disabled={!validation.canSubmit || isSubmitting}
              className={`flex items-center gap-2 font-mono font-black text-xs px-6 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] transition-all cursor-pointer ${validation.canSubmit && !isSubmitting
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed border-zinc-400 shadow-none'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>ĐANG TẠO SẢN PHẨM...</span>
                </>
              ) : (
                <>
                  <PackagePlus size={16} />
                  <span>XÁC NHẬN TẠO SẢN PHẨM</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
