'use client';

import { Cpu, Users, ShieldAlert } from 'lucide-react';

export default function BentoGrid() {
  return (
    <section id="ai-flow" className="mx-auto max-w-7xl px-6 py-12 md:px-12 w-full">
      
      {/* Section Title */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-extrabold text-[#09090B] tracking-tight uppercase inline-block border-b-4 border-[#F97316] pb-2">
          Hệ Thống Rào Chắn Core & AI Engine
        </h2>
        <p className="text-zinc-600 mt-2 font-mono text-sm">
          Đảm bảo tính tin cậy, an toàn thông tin và tối ưu hóa tài nguyên cho mô hình ngôn ngữ lớn (LLM).
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 01: Pipeline AI Monitoring */}
        <div className="card-brutal bg-[#FAFAFA] p-6 flex flex-col justify-between min-h-75">
          <div>
            <div className="inline-flex items-center justify-center p-3 border-2 border-[#09090B] bg-[#F97316]/10 text-[#F97316] mb-4">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#09090B] mb-2 uppercase font-mono">
              01. Giám Sát Pipeline AI
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Module <code className="font-mono text-xs bg-zinc-100 p-0.5 border border-zinc-300">pipeline_ai</code> xây dựng trên nền tảng FastAPI hiệu năng cao, đóng vai trò cầu nối xử lý các tác vụ AI cốt lõi: Nhận diện thực thể (NER), Phân loại ý định (Intent Classification) và OCR trích xuất dữ liệu.
            </p>
          </div>
          <div className="border-t border-zinc-200 pt-4 font-mono text-xs text-zinc-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Framework:</span>
              <span className="text-[#09090B] font-bold">FastAPI / Python</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Model Backbone:</span>
              <span className="text-[#09090B] font-bold">Qwen2.5 / SentenceTransformers</span>
            </div>
          </div>
        </div>

        {/* Card 02: Human-in-the-Loop Queue */}
        <div className="card-brutal bg-[#FAFAFA] p-6 flex flex-col justify-between min-h-75">
          <div>
            <div className="inline-flex items-center justify-center p-3 border-2 border-[#09090B] bg-[#F97316]/10 text-[#F97316] mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#09090B] mb-2 uppercase font-mono">
              02. Phê Duyệt HITL Queue
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Hệ thống Human-in-the-Loop (HITL) tự động giữ lại các yêu cầu truy vấn có điểm tin cậy (Confidence Score) dưới mức cho phép, chuyển tiếp trực tiếp sang hàng đợi kiểm duyệt thủ công dành cho quản trị viên trước khi thực thi.
            </p>
          </div>
          <div className="border-t border-zinc-200 pt-4 font-mono text-xs text-zinc-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Confidence Threshold:</span>
              <span className="text-amber-600 font-bold">&lt; 85% Score</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Review Strategy:</span>
              <span className="text-[#09090B] font-bold">Admin Manual Intervention</span>
            </div>
          </div>
        </div>

        {/* Card 03: SQL Guardrails */}
        <div className="card-brutal bg-[#FAFAFA] p-6 flex flex-col justify-between min-h-75">
          <div>
            <div className="inline-flex items-center justify-center p-3 border-2 border-[#09090B] bg-[#F97316]/10 text-[#F97316] mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#09090B] mb-2 uppercase font-mono">
              03. Rào Chắn Text-to-SQL
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              Rào chắn bảo mật nghiêm ngặt ngăn chặn hành vi tấn công SQL Injection. Hệ thống phân tích cú pháp AST, chỉ cho phép thực thi lệnh đọc dữ liệu <code className="font-mono text-xs bg-zinc-100 p-0.5 border border-zinc-300">SELECT</code> và chặn đứng các truy vấn nguy hiểm đến cơ sở dữ liệu.
            </p>
          </div>
          <div className="border-t border-zinc-200 pt-4 font-mono text-xs text-zinc-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Execution Rule:</span>
              <span className="text-emerald-600 font-bold">SELECT-ONLY GUARDRAIL</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database Provider:</span>
              <span className="text-[#09090B] font-bold">PostgreSQL / TimescaleDB</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
