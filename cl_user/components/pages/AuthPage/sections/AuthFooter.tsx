'use client';

export default function AuthFooter() {
  return (
    <div className="pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
      <p>© 2026 CSMART Store. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-orange-600 transition-colors">
          Trung tâm trợ giúp
        </a>
        <span>•</span>
        <a
          href="tel:19001000"
          className="font-bold text-zinc-800 hover:text-orange-600 transition-colors"
        >
          Hotline: 1900 1000
        </a>
      </div>
    </div>
  );
}
