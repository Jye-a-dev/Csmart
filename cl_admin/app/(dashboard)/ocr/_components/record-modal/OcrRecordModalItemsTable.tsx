'use client';

import React from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { ExtractedItem } from '../OcrProcessingResult';

interface OcrRecordModalItemsTableProps {
  items: ExtractedItem[];
  isViewOnly: boolean;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onItemChange: (idx: number, field: keyof ExtractedItem, value: string | number) => void;
}

export function OcrRecordModalItemsTable({
  items,
  isViewOnly,
  onAddItem,
  onRemoveItem,
  onItemChange,
}: OcrRecordModalItemsTableProps) {
  return (
    <div className="border-t-2 border-[#09090B] pt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold uppercase flex items-center gap-2">
          <Package size={16} className="text-[#F97316]" />
          DANH SÁCH MÓN HÀNG TRÍCH XUẤT:
        </h4>
        {!isViewOnly && (
          <button
            type="button"
            onClick={onAddItem}
            className="flex items-center gap-1 bg-[#FAFAFA] text-[#09090B] font-bold text-[11px] px-2.5 py-1 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-amber-100 cursor-pointer"
          >
            <Plus size={12} /> Thêm dòng
          </button>
        )}
      </div>

      <div className="overflow-x-auto border-2 border-[#09090B]">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#09090B] text-white font-bold uppercase">
              <th className="p-2 border-r border-zinc-700">TÊN SẢN PHẨM</th>
              <th className="p-2 border-r border-zinc-700 w-20 text-center">SL</th>
              <th className="p-2 border-r border-zinc-700 w-32 text-right">ĐƠN GIÁ</th>
              {!isViewOnly && <th className="p-2 w-12 text-center">XÓA</th>}
            </tr>
          </thead>
          <tbody className="divide-y border-t border-[#09090B]">
            {items && items.length > 0 ? (
              items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-1.5 border-r border-[#09090B]">
                    <input
                      type="text"
                      disabled={isViewOnly}
                      value={item.name}
                      onChange={(e) => onItemChange(idx, 'name', e.target.value)}
                      className="w-full p-1 border border-zinc-300 font-bold bg-white disabled:bg-transparent disabled:border-none"
                    />
                  </td>
                  <td className="p-1.5 border-r border-[#09090B]">
                    <input
                      type="number"
                      disabled={isViewOnly}
                      value={item.quantity}
                      onChange={(e) => onItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-1 border border-zinc-300 text-center font-bold bg-white disabled:bg-transparent disabled:border-none"
                    />
                  </td>
                  <td className="p-1.5 border-r border-[#09090B]">
                    <input
                      type="number"
                      disabled={isViewOnly}
                      value={item.unit_price}
                      onChange={(e) => onItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full p-1 border border-zinc-300 text-right font-bold bg-white disabled:bg-transparent disabled:border-none"
                    />
                  </td>
                  {!isViewOnly && (
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        className="p-1 text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-zinc-400">
                  Chưa có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

