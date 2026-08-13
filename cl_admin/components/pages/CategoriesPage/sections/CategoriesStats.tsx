'use client';

interface CategoriesStatsProps {
  rootCount: number;
  subCount: number;
  productsCount: number;
}

export function CategoriesStats({ rootCount, subCount, productsCount }: CategoriesStatsProps) {
  const stats = [
    { label: 'Danh mục cha', value: rootCount, color: 'bg-blue-400' },
    { label: 'Danh mục con', value: subCount, color: 'bg-purple-400' },
    { label: 'Sản phẩm', value: productsCount, color: 'bg-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] bg-white p-4 flex items-center gap-3">
          <div className={`w-3 h-10 border-2 border-[#09090B] ${s.color}`} />
          <div>
            <div className="font-mono text-xl font-black text-[#09090B]">{s.value}</div>
            <div className="font-mono text-[10px] text-zinc-500 uppercase">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
