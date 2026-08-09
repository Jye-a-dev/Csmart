'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Cpu, Activity, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const [latency, setLatency] = useState<number>(1.2);
  const [time, setTime] = useState<string>('22:08:17');

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Number((1.0 + Math.random() * 0.4).toFixed(2)));
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-20 md:px-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Panel: 7 Columns */}
        <div className="lg:col-span-7 flex flex-col justify-center items-start space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#09090B]">
            <Shield size={14} className="text-[#F97316]" />
            ENTERPRISE ADMINISTRATIVE CONTROL CENTER
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#09090B] tracking-tight leading-none uppercase">
            Quản trị thông minh <br className="hidden md:inline" />
            Bảng điều khiển <br />
            <span className="bg-[#F97316] text-[#FAFAFA] px-2 py-1 inline-block border-2 border-[#09090B] my-2 -rotate-1 shadow-[4px_4px_0px_0px_#09090B]">
              CSMART_OS
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-zinc-700 max-w-xl leading-relaxed">
            Hệ thống quản lý Admin Core nâng cao của Csmart AI. Tích hợp giám sát luồng dịch vụ xử lý ngôn ngữ tự nhiên, phê duyệt phản hồi, phân tích hành vi và kiểm duyệt rào chắn Text-to-SQL chuyên nghiệp.
          </p>

          {/* Actions & Metrics */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/login"
              className="btn-brutal inline-flex items-center justify-center gap-2 bg-[#F97316] text-[#09090B] font-mono font-bold px-6 py-3.5 uppercase text-base cursor-pointer"
            >
              Xác thực & Vào Workspace
              <ArrowRight size={18} />
            </Link>

            <a
              href="#core-structure"
              className="btn-brutal inline-flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold px-6 py-3.5 uppercase text-base cursor-pointer hover:bg-zinc-100"
            >
              Tài liệu kỹ thuật
            </a>
          </div>

          {/* System Latency Badge */}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 bg-zinc-100 p-2.5 border border-zinc-300 rounded">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>LATENCY: <strong className="text-[#09090B]">{latency}s</strong></span>
            </div>
            <div className="h-4 w-px bg-zinc-300" />
            <div>NODE STATE: <strong className="text-[#09090B]">STABLE</strong></div>
            <div className="h-4 w-px bg-zinc-300" />
            <div>SYS TIME: <strong className="text-[#09090B]">{time}</strong></div>
          </div>
        </div>

        {/* Right Panel: 5 Columns (Bento Console Telemetry) */}
        <div className="lg:col-span-5 flex items-stretch">
          <div className="relative w-full min-h-95 bg-zinc-950 text-emerald-400 border-4 border-[#09090B] p-6 font-mono text-xs overflow-hidden shadow-[8px_8px_0px_0px_#09090B] flex flex-col justify-between">
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,6px_100%] z-20" />
            <div className="absolute left-0 right-0 h-1 bg-emerald-500/10 opacity-30 animate-scanline pointer-events-none z-20" />

            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-500 font-bold uppercase tracking-wider">TELEMETRY_CONSOLE_V24</span>
              </div>
              <span className="text-emerald-600">SECURE_SSL</span>
            </div>

            {/* Simulated terminal lines */}
            <div className="space-y-4 my-4 flex-1">
              <div>
                <span className="text-emerald-600">[sys@csmart-os]:~$</span> <span className="text-emerald-300">systemctl status pipeline_ai</span>
                <div className="text-emerald-500 pl-4 mt-1">● pipeline_ai.service - FastAPI AI Engine Daemon</div>
                <div className="text-emerald-500 pl-4">Active: active (running) since Sun 2026-08-09</div>
              </div>

              <div className="border border-emerald-950 bg-emerald-950/20 p-2.5 rounded">
                <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
                  <span>TEXT-TO-SQL GUARDRAIL</span>
                  <span className="text-emerald-400 bg-emerald-900/30 px-1 border border-emerald-800">ACTIVE</span>
                </div>
                <div className="text-[10px] text-emerald-600">FILTER: FORBID_DESTRUCTIVE_ACTIONS [DROP, DELETE, TRUNCATE]</div>
                <div className="text-[10px] text-emerald-600">COMPLIANCE STATE: 100% SYSTEM ALIGNED</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="border border-emerald-900/50 p-2 rounded">
                  <div className="text-emerald-600">JACCARD THRESHOLD</div>
                  <div className="text-xl font-bold text-emerald-300">&gt;= 0.15</div>
                  <div className="text-[9px] text-emerald-500">SIMILARITY MATCH STATE</div>
                </div>
                <div className="border border-amber-900/40 p-2 rounded bg-amber-950/20">
                  <div className="text-amber-500 font-bold">HITL REVIEW QUEUE</div>
                  <div className="text-xl font-bold text-amber-400">5 ITEMS</div>
                  <div className="text-[9px] text-amber-600">ACTION REQUIRED PENDING</div>
                </div>
              </div>
            </div>

            {/* Footer telemetry */}
            <div className="border-t border-emerald-800/40 pt-3 flex items-center justify-between text-[10px] text-emerald-600">
              <span className="flex items-center gap-1">
                <Cpu size={12} /> CPU: 12.8%
              </span>
              <span className="flex items-center gap-1">
                <Activity size={12} /> RAM: 3.4 / 16.0 GB
              </span>
              <span className="flex items-center gap-1">
                MEM: 82% OK
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
