'use client';

import React from 'react';

export interface ToastState {
  msg: string;
  type: 'ok' | 'err';
}

interface OcrToastProps {
  toast: ToastState | null;
}

export const OcrToast: React.FC<OcrToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] transition-all animate-bounce ${
        toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'
      }`}
    >
      {toast.msg}
    </div>
  );
};
