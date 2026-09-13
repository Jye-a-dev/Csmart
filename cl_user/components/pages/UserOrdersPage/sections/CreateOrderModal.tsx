'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingBag, MapPin, FileText } from 'lucide-react';
import { CreateOrderDto, CreateOrderItemDto, OrderStatus } from '@/types/entities/order';
import { useProducts } from '@/hooks';
import type { Product } from '@/types/entities/product';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onCreate: (payload: CreateOrderDto) => Promise<void>;
}

function generateOrderCode(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 900 + 100
  )}`;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  userId,
  onCreate,
}: CreateOrderModalProps) {
  const { findAllProducts } = useProducts();
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<CreateOrderItemDto[]>([
    { product_name: '', unit_price: 0, quantity: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    findAllProducts({ limit: 50 })
      .then((data) => {
        if (isMounted && data) {
          setCatalogProducts(data);
          if (data.length > 0) {
            setItems((prevItems) => {
              if (prevItems.length === 1 && !prevItems[0].product_name) {
                const first = data[0];
                const price = Number(first.discount_price || first.base_price || 0);
                return [
                  {
                    product_id: String(first.id),
                    product_name: first.name,
                    unit_price: price,
                    quantity: 1,
                  },
                ];
              }
              return prevItems;
            });
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, findAllProducts]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product_name: '', unit_price: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = catalogProducts.find((p) => String(p.id) === productId);
    if (!prod) return;
    const price = Number(prod.discount_price || prod.base_price || 0);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      product_id: String(prod.id),
      product_name: prod.name,
      unit_price: price,
    };
    setItems(updated);
  };

  const handleUpdateItem = (
    index: number,
    key: keyof CreateOrderItemDto,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 1),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validItems = items.filter(
      (item) => item.product_name.trim() !== '' && Number(item.unit_price) >= 0 && item.quantity > 0
    );

    if (validItems.length === 0) {
      setErrorMsg('Vui lòng thêm ít nhất một sản phẩm hợp lệ vào đơn hàng.');
      return;
    }

    if (!shippingAddress.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }

    setSubmitting(true);
    try {
      const orderCode = generateOrderCode();

      const payload: CreateOrderDto = {
        order_code: orderCode,
        user_id: userId,
        status: OrderStatus.PENDING,
        total_amount: totalAmount,
        shipping_fee: 0,
        discount_amount: 0,
        shipping_address: shippingAddress.trim(),
        note: note.trim() || undefined,
        items: validItems,
      };

      await onCreate(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900">
                Đặt Hàng / Thêm Đơn Hàng Mới
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Thêm sản phẩm và tạo đơn hàng hiển thị ngay trong danh sách
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600">
              {errorMsg}
            </div>
          )}

          {/* Shipping Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-600" />
              <span>Địa Chỉ Giao Hàng *</span>
            </label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, TP..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-orange-600" />
                <span>Sản Phẩm Trong Đơn ({items.length})</span>
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Thêm Sản Phẩm</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 space-y-3"
                >
                  {/* Select product from catalog if available */}
                  {catalogProducts.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 block mb-1">
                        Chọn nhanh từ danh mục sản phẩm:
                      </span>
                      <select
                        value={item.product_id || ''}
                        onChange={(e) => handleSelectProduct(index, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white text-zinc-800 focus:outline-none focus:border-orange-500"
                      >
                        <option value="">-- Chọn sản phẩm có sẵn --</option>
                        {catalogProducts.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name} -{' '}
                            {Number(p.discount_price || p.base_price || 0).toLocaleString('vi-VN')}đ
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    <div className="sm:col-span-6 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500">
                        Tên Sản Phẩm *
                      </span>
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) =>
                          handleUpdateItem(index, 'product_name', e.target.value)
                        }
                        placeholder="Vd: Áo Polo Bamboo Basic"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500">
                        Đơn Giá (đ) *
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={item.unit_price || ''}
                        onChange={(e) =>
                          handleUpdateItem(index, 'unit_price', Number(e.target.value))
                        }
                        placeholder="299000"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500">SL *</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(
                            index,
                            'quantity',
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        required
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-orange-500 text-center font-bold"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-center pb-1">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa mục này"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <FileText size={14} className="text-orange-600" />
              <span>Ghi Chú Đơn Hàng (Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Giao giờ hành chính, gọi trước khi đến..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Total & Submit */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-600 block">Tổng thanh toán dự kiến:</span>
              <span className="text-lg font-black text-orange-600">
                {totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
                <span>Xác Nhận Đặt Hàng</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

