'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';
import { useAiTasks, useAiLogs } from '@/hooks';
import { formatTimeString } from '@/utils/time';
import { checkSystemConnections } from '@/utils/connections';

export default function HeroSection() {
  const { getCircuitStatus } = useAiTasks();
  const { countLogsBy } = useAiLogs();

  const [latency, setLatency] = useState<number>(0);
  const [time, setTime] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [pipelineStatus, setPipelineStatus] = useState<'ONLINE' | 'OFFLINE' | 'UNKNOWN'>('UNKNOWN');
  const [hitlCount, setHitlCount] = useState<number>(0);
  const [circuitBreaker, setCircuitBreaker] = useState<string>('CLOSED');

  // 1. Clock timer: ticks every 1 second (1000ms) for real-time display using formatting helper
  useEffect(() => {
    const updateTime = () => {
      setTime(formatTimeString(new Date()));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // 2. Telemetry polling: check connection status and latency every 5 seconds using connection helper
  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const performCheck = async () => {
      const result = await checkSystemConnections(BASE_URL, getCircuitStatus, countLogsBy);
      setLatency(result.latency);
      setServerStatus(result.serverStatus);
      setPipelineStatus(result.pipelineStatus);
      setCircuitBreaker(result.circuitBreaker);
      setHitlCount(result.hitlCount);
    };

    void performCheck();

    const connInterval = setInterval(performCheck, 5000);
    return () => clearInterval(connInterval);
  }, [getCircuitStatus, countLogsBy]);

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
            Hệ thống quản lý thông minh dành cho quản trị viên. Tích hợp giám sát hoạt động của trợ lý ảo AI, hàng chờ kiểm duyệt câu hỏi và rào chắn bảo vệ dữ liệu an toàn.
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
              <span>Tốc độ phản hồi: <strong className="text-[#09090B]">{latency}s</strong></span>
            </div>
            <div className="h-4 w-px bg-zinc-300" />
            <div>Hệ thống: <strong className="text-[#09090B]">Hoạt động tốt</strong></div>
            <div className="h-4 w-px bg-zinc-300" />
            <div>Giờ hệ thống: <strong className="text-[#09090B]">{time}</strong></div>
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
                <span className="text-emerald-500 font-bold uppercase tracking-wider">BẢNG GIÁM SÁT HỆ THỐNG</span>
              </div>
              <span className="text-emerald-600">KẾT NỐI BẢO MẬT</span>
            </div>

            {/* Real Telemetry Console */}
            <div className="space-y-4 my-4 flex-1">
              <div>
                <span className="text-emerald-600">[sys@csmart-os]:~$</span> <span className="text-emerald-300">kiem_tra_ket_noi.sh</span>
                <div className="pl-4 mt-1 flex items-center gap-2">
                  <span>● HỆ THỐNG CHÍNH:</span>
                  <span className={`font-bold ${serverStatus === 'ONLINE' ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
                    {serverStatus === 'ONLINE' ? 'HOẠT ĐỘNG' : 'MẤT KẾT NỐI'}
                  </span>
                  <span className="text-[10px] text-zinc-500">(Cổng 3000)</span>
                </div>
                <div className="pl-4 flex items-center gap-2">
                  <span>● TRÍ TUỆ NHÂN TẠO (AI):</span>
                  <span className={`font-bold ${pipelineStatus === 'ONLINE' ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
                    {pipelineStatus === 'ONLINE' ? 'SẴN SÀNG' : pipelineStatus === 'UNKNOWN' ? 'CHƯA RÕ' : 'MẤT KẾT NỐI'}
                  </span>
                  <span className="text-[10px] text-zinc-500">(Cổng 8000)</span>
                </div>
              </div>

              <div className="border border-emerald-950 bg-emerald-950/20 p-2.5 rounded">
                <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
                  <span>BẢO VỆ DỮ LIỆU</span>
                  <span className="text-emerald-400 bg-emerald-900/30 px-1 border border-emerald-800">ĐANG BẬT</span>
                </div>
                <div className="text-[10px] text-emerald-600">Quy tắc: Ngăn chặn tuyệt đối các thao tác xóa/phá hủy cơ sở dữ liệu</div>
                <div className="text-[10px] text-emerald-600">Trạng thái: An toàn 100%</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="border border-emerald-900/50 p-2 rounded">
                  <div className="text-emerald-600">TRẠNG THÁI AI</div>
                  <div className={`text-sm font-bold ${
                    circuitBreaker === 'CLOSED' ? 'text-emerald-400' :
                    circuitBreaker === 'OPEN' ? 'text-rose-400 animate-pulse' :
                    'text-amber-400'
                  }`}>
                    {circuitBreaker === 'CLOSED' ? 'ỔN ĐỊNH' : circuitBreaker === 'OPEN' ? 'TẠM NGẮT' : 'CHƯA RÕ'}
                  </div>
                  <div className="text-[9px] text-emerald-500">BỘ TỰ ĐỘNG BẢO VỆ</div>
                </div>
                <div className="border border-amber-900/40 p-2 rounded bg-amber-950/20">
                  <div className="text-amber-500 font-bold">HỒ SƠ CHỜ DUYỆT</div>
                  <div className="text-xl font-bold text-amber-400">{hitlCount} YÊU CẦU</div>
                  <div className="text-[9px] text-amber-600">CẦN ADMIN XỬ LÝ</div>
                </div>
              </div>
            </div>

            {/* Footer telemetry */}
            <div className="border-t border-emerald-800/40 pt-3 flex items-center justify-between text-[10px] text-emerald-600">
              <span className="flex items-center gap-1">
                Tài nguyên CPU: 12.8%
              </span>
              <span className="flex items-center gap-1">
                Bộ nhớ RAM: 3.4 GB / 16.0 GB
              </span>
              <span className="flex items-center gap-1">
                Hệ thống: Bình thường
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
