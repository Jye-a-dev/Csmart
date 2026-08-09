'use client';

import { Folder, Code, Database, LayoutTemplate, Smartphone } from 'lucide-react';

export default function MonorepoStack() {
  const projects = [
    {
      path: "/pipeline_ai",
      name: "AI Pipeline Engine",
      role: "Trực quan hóa luồng dữ liệu thô đầu vào, trích xuất thông tin tự động và tính toán nhúng vector.",
      tech: ["FastAPI", "PyTorch", "Qwen2.5", "EasyOCR"],
      color: "bg-red-50 text-red-700 border-red-200",
      icon: CpuIcon,
    },
    {
      path: "/server",
      name: "Core Business API Gateway",
      role: "Quản lý cơ sở dữ liệu quan hệ, phân quyền người dùng, lưu vết hành vi AI và cung cấp API Swagger.",
      tech: ["NestJS", "TypeScript", "PostgreSQL", "BullMQ"],
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: ServerIcon,
    },
    {
      path: "/cl_admin",
      name: "Admin Control Console",
      role: "Bảng quản trị hệ thống, giám sát hiệu năng mô hình, phê duyệt HITL và thiết lập cấu hình rào chắn.",
      tech: ["Next.js App Router", "React 19", "Tailwind CSS", "TypeScript"],
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AdminIcon,
    },
    {
      path: "/cl_user",
      name: "Client Copilot App",
      role: "Giao diện khách hàng tích hợp trợ lý ảo mua sắm thông minh, tạo đơn hàng và thanh toán trực tuyến.",
      tech: ["Next.js Client", "React SSE", "Tailwind CSS", "TypeScript"],
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: UserIcon,
    },
  ];

  return (
    <section id="monorepo" className="mx-auto max-w-7xl px-6 py-12 md:px-12 w-full border-t-2 border-[#09090B] mt-6">
      
      {/* Title */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-extrabold text-[#09090B] tracking-tight uppercase inline-block border-b-4 border-[#F97316] pb-2">
          Cơ Cấu Tổ Chức Monorepo
        </h2>
        <p className="text-zinc-600 mt-2 font-mono text-sm">
          Phân rã kiến trúc Monorepo bao gồm 4 phân vùng ứng dụng độc lập, đồng bộ dữ liệu.
        </p>
      </div>

      {/* Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <div
            key={idx}
            className="card-brutal bg-[#FAFAFA] p-6 flex flex-col justify-between border-2 border-[#09090B]"
          >
            <div>
              {/* Top row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder size={18} className="text-[#F97316]" />
                  <span className="font-mono text-sm font-black bg-zinc-100 px-2 py-0.5 border border-zinc-300 rounded text-[#09090B]">
                    {project.path}
                  </span>
                </div>
                <project.icon />
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold text-[#09090B] mb-2 uppercase">
                {project.name}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                {project.role}
              </p>
            </div>

            {/* Tech Stack pills */}
            <div className="border-t border-zinc-200 pt-4">
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t, i) => (
                  <span
                    key={i}
                    className="font-mono text-[10px] font-bold px-2 py-0.5 border border-[#09090B] bg-[#FAFAFA] shadow-[1px_1px_0px_0px_#09090B]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}

// Micro icons for monorepo components
function CpuIcon() {
  return (
    <div className="p-1.5 border border-[#09090B] bg-red-100 text-red-700 rounded">
      <Code size={14} />
    </div>
  );
}

function ServerIcon() {
  return (
    <div className="p-1.5 border border-[#09090B] bg-blue-100 text-blue-700 rounded">
      <Database size={14} />
    </div>
  );
}

function AdminIcon() {
  return (
    <div className="p-1.5 border border-[#09090B] bg-amber-100 text-amber-700 rounded">
      <LayoutTemplate size={14} />
    </div>
  );
}

function UserIcon() {
  return (
    <div className="p-1.5 border border-[#09090B] bg-emerald-100 text-emerald-700 rounded">
      <Smartphone size={14} />
    </div>
  );
}
