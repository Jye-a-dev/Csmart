'use client';

import { Play, FileText, Upload, Loader2, ShieldAlert, Activity } from 'lucide-react';

interface ActiveJob {
  id: string;
  type: 'ocr' | 'eval';
  status: string;
  progress?: number;
  result?: unknown;
  failedReason?: string;
}

interface JobQueueTabProps {
  ocrFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | null) => void;
  onOcrSubmit: () => void;
  onEvalSubmit: () => void;
  activeJobs: ActiveJob[];
  loading: boolean;
}

export default function JobQueueTab({
  ocrFile,
  fileInputRef,
  onFileChange,
  onOcrSubmit,
  onEvalSubmit,
  activeJobs,
  loading
}: JobQueueTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-[#09090B] font-mono uppercase border-b-2 border-zinc-200 pb-2 flex items-center gap-2">
        <Play size={16} className="text-[#F97316]" />
        Trigger Background Processing Job
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task 1: OCR File parsing */}
        <div className="border-2 border-[#09090B] p-4 bg-white shadow-[3px_3px_0px_0px_#09090B]">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-[#F97316]" size={20} />
            <h4 className="font-bold text-[#09090B] font-mono uppercase text-sm">Task 01: Nhận diện OCR hình ảnh</h4>
          </div>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed font-sans">
            Tải lên hóa đơn hoặc ảnh văn bản để phân tách nội dung qua hàng đợi OCR bất đồng bộ BullMQ.
          </p>
          
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 border-2 border-dashed border-[#09090B] hover:bg-zinc-50 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 bg-white"
            >
              <Upload size={14} />
              {ocrFile ? ocrFile.name : 'Chọn File hình ảnh'}
            </button>
            
            <button
              onClick={onOcrSubmit}
              disabled={!ocrFile || loading}
              className="w-full py-2 bg-[#09090B] text-white hover:bg-zinc-800 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
              Bắt đầu xử lý OCR
            </button>
          </div>
        </div>

        {/* Task 2: Self-Evaluation */}
        <div className="border-2 border-[#09090B] p-4 bg-white shadow-[3px_3px_0px_0px_#09090B] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="text-[#F97316]" size={20} />
              <h4 className="font-bold text-[#09090B] font-mono uppercase text-sm">Task 02: Tự đánh giá (Evaluation)</h4>
            </div>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed font-sans">
              Kích hoạt tác vụ chạy hậu đài đánh giá sự chính xác, độ tin cậy và kiểm duyệt nội dung LLM.
            </p>
          </div>

          <button
            onClick={onEvalSubmit}
            disabled={loading}
            className="w-full py-2 bg-[#09090B] text-white hover:bg-zinc-800 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
            Chạy Đánh giá
          </button>
        </div>
      </div>

      {/* Active Jobs Monitor */}
      <div className="mt-6 border-2 border-[#09090B] p-4 bg-zinc-50">
        <h4 className="font-bold font-mono text-xs uppercase mb-3 text-zinc-700 flex items-center gap-1.5">
          <Activity size={14} /> Monitor các tác vụ đang chạy ({activeJobs.length})
        </h4>
        {activeJobs.length === 0 ? (
          <p className="text-xs text-zinc-400 font-mono italic">Chưa có tác vụ nào được kích hoạt.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activeJobs.map((job) => (
              <div key={job.id} className="bg-white border-2 border-[#09090B] p-3 text-xs font-mono shadow-[2px_2px_0px_0px_#09090B]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold uppercase text-[#09090B]">
                    {job.type === 'ocr' ? '📝 OCR Task' : '🛡️ Eval Task'} ({job.id})
                  </span>
                  <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                    job.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    job.status === 'failed' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
                {job.progress !== undefined && job.status === 'active' && (
                  <div className="w-full bg-zinc-200 h-1.5 mt-2 mb-1">
                    <div className="bg-[#F97316] h-1.5" style={{ width: `${job.progress}%` }}></div>
                  </div>
                )}
                {!!job.result && (
                  <div className="mt-2 bg-zinc-50 p-2 border border-zinc-200 text-[10px] text-zinc-600 max-h-24 overflow-y-auto whitespace-pre-wrap">
                    Kết quả: {JSON.stringify(job.result, null, 2)}
                  </div>
                )}
                {job.failedReason && (
                  <div className="mt-2 bg-rose-50 text-rose-700 p-2 border border-rose-200 text-[10px]">
                    Lỗi: {job.failedReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
