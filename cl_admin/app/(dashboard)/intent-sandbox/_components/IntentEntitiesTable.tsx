'use client';

import { Tag } from 'lucide-react';

interface IntentEntitiesTableProps {
  entities: Record<string, unknown>;
}

export function IntentEntitiesTable({ entities }: IntentEntitiesTableProps) {
  const entityKeys = Object.keys(entities || {});

  return (
    <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B]">
      <h3 className="font-mono text-xs font-black uppercase tracking-wider text-[#09090B] mb-4 flex items-center gap-2">
        <Tag size={14} className="text-[#F97316]" />
        BÓC TÁCH ENTITIES ({entityKeys.length})
      </h3>

      {entityKeys.length === 0 ? (
        <p className="font-mono text-xs text-zinc-500 font-bold italic bg-[#FAFAFA] p-4 border-2 border-[#09090B]">
          Không tìm thấy Entity trong truy vấn này.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs border-2 border-[#09090B]">
            <thead>
              <tr className="bg-[#09090B] text-white">
                <th className="p-2.5 text-left border-r border-zinc-700 uppercase font-black">Entity Key</th>
                <th className="p-2.5 text-left uppercase font-black">Extracted Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(entities).map(([key, val], idx) => (
                <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                  <td className="p-2.5 font-bold text-[#F97316] border-t border-r border-[#09090B]">
                    {key}
                  </td>
                  <td className="p-2.5 font-bold text-[#09090B] border-t border-[#09090B]">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
