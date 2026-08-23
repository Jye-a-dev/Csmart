'use client';

export default function LoginPageFooter() {
  return (
    <footer className="w-full bg-white border-t-2 border-[#09090B] px-6 py-4 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_-2px_0_0_#09090B] text-[10px] font-mono text-zinc-500 uppercase font-bold">
      <span>© 2026 CSMART_Admin. Bản quyền nội bộ.</span>
      <span className="flex items-center gap-1.5">
        Trạng thái: Hoạt động bình thường
      </span>
    </footer>
  );
}
