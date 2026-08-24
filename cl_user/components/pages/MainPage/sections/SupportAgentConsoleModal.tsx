'use client';

import { useState } from 'react';
import { X, Headphones, FileText, Layers } from 'lucide-react';
import { NerExtractorTab, HitlQueueTab } from './support-console';

interface SupportAgentConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportAgentConsoleModal({
  isOpen,
  onClose,
}: SupportAgentConsoleModalProps) {
  const [activeTab, setActiveTab] = useState<'NER' | 'HITL'>('NER');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card-brutal relative w-full max-w-4xl max-h-[90vh] bg-[#FAF7F2] border-2 border-[#09090B] flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_#09090B]">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-[#09090B] text-[#FAFAFA] px-6 py-4 border-b-2 border-[#09090B]">
          <div className="flex items-center gap-2">
            <div className="bg-[#F97316] text-[#09090B] p-1.5 border border-white">
              <Headphones size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-mono font-black text-sm uppercase tracking-tight text-[#FAFAFA]">
                Bảng Điều Khiển Nghiệp Vụ CSKH & Vận Hành
              </h2>
              <span className="font-mono text-[10px] text-[#F97316] uppercase font-bold">
                Quyền truy cập: SUPPORT / OPERATOR
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b-2 border-[#09090B] bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab('NER')}
            className={`font-mono text-xs font-black uppercase py-3 px-4 border-b-4 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'NER'
                ? 'border-[#F97316] text-[#09090B] bg-[#FAF7F2]'
                : 'border-transparent text-zinc-500 hover:text-[#09090B]'
            }`}
          >
            <FileText size={15} />
            <span>01. Bóc Tách Thực Thể (NER & Slots)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HITL')}
            className={`font-mono text-xs font-black uppercase py-3 px-4 border-b-4 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'HITL'
                ? 'border-[#F97316] text-[#09090B] bg-[#FAF7F2]'
                : 'border-transparent text-zinc-500 hover:text-[#09090B]'
            }`}
          >
            <Layers size={15} />
            <span>02. Hàng Đợi Kiểm Duyệt AI (HITL Queue)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'NER' && <NerExtractorTab />}
          {activeTab === 'HITL' && <HitlQueueTab />}
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-100 border-t-2 border-[#09090B] px-6 py-3 flex items-center justify-between font-mono text-xs text-zinc-500">
          <span>CSMART AI Support Engine (Backend: Port 3000)</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-brutal bg-white text-[#09090B] px-4 py-1 font-bold uppercase cursor-pointer hover:bg-zinc-200"
          >
            Đóng Console
          </button>
        </div>
      </div>
    </div>
  );
}
