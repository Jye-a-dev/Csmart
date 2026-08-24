'use client';

export default function PublicFooter() {
  return (
    <footer id="faq" className="w-full bg-white text-zinc-600 border-t border-zinc-200 px-4 sm:px-6 lg:px-8 pt-12 pb-8 font-sans text-xs mt-auto">
      <div className="mx-auto max-w-7xl">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Branding & Intro */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs">
                CS
              </div>
              <span className="font-extrabold text-sm tracking-tight text-zinc-900">
                CSMART STORE
              </span>
            </div>
            <p className="text-zinc-500 leading-relaxed text-xs">
              Hệ thống mua sắm trực tuyến hàng đầu, mang đến sản phẩm chất lượng và trải nghiệm tiện lợi cho mọi gia đình.
            </p>
          </div>

          {/* Col 2: Về CSMART */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-zinc-900 text-xs">
              Về CSMART
            </h4>
            <ul className="space-y-2 text-zinc-500 text-xs">
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Giới thiệu cửa hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Tin tức & Khuyến mãi
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hỗ Trợ Khách Hàng */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-zinc-900 text-xs">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2 text-zinc-500 text-xs">
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Hướng dẫn đặt hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Chính sách đổi trả hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Tra cứu vận đơn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-600 transition-colors">
                  Liên hệ hỗ trợ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Tổng Đài Chăm Sóc */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-zinc-900 text-xs">
              Tổng Đài Chăm Sóc
            </h4>
            <div className="space-y-1 text-zinc-500 text-xs leading-relaxed">
              <div>
                Mua hàng: <strong className="text-zinc-800">1900 1000</strong> (8:00 - 21:00)
              </div>
              <div>
                Email: <span className="text-zinc-800 font-medium">hotro@csmart.vn</span>
              </div>
              <div>
                Địa chỉ: 123 Đường Số 1, Quận 1, TP. Hồ Chí Minh
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="border-t border-zinc-100 pt-6 text-center text-zinc-400 text-[11px]">
          &copy; 2026 CSMART. Bản quyền thuộc về CSMART Store.
        </div>
      </div>
    </footer>
  );
}
