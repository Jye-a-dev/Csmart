'use client';

import { useState } from 'react';
import { Cpu, Clock, Terminal, Code } from 'lucide-react';
import { ChatMessageDto } from '@/types/ai/copilot';

interface CopilotDiagnosticsInspectorProps {
  lastLatencyMs: number | null;
  streamChunksCount: number;
  systemPrompt: string;
  setSystemPrompt: (val: string) => void;
  temperature: number;
  confidenceThreshold: number;
  messages: ChatMessageDto[];
}

export function CopilotDiagnosticsInspector({
  lastLatencyMs,
  streamChunksCount,
  systemPrompt,
  setSystemPrompt,
  temperature,
  confidenceThreshold,
  messages,
}: CopilotDiagnosticsInspectorProps) {
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Stream Diagnostics Metrics Card */}
      <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B] space-y-4">
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-[#09090B] flex items-center gap-2 border-b-2 border-[#09090B] pb-3">
          <Cpu size={16} className="text-[#F97316]" />
          STREAM DIAGNOSTICS & LATENCY
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border-2 border-[#09090B] bg-[#FAFAFA] shadow-[2px_2px_0px_0px_#09090B]">
            <span className="font-mono text-[10px] font-black text-zinc-500 uppercase block mb-1">
              RESPONSE LATENCY
            </span>
            <span className="font-mono text-lg font-black text-[#09090B] flex items-center gap-1">
              <Clock size={16} className="text-[#F97316]" />
              {lastLatencyMs !== null ? `${lastLatencyMs} ms` : '--'}
            </span>
          </div>

          <div className="p-3 border-2 border-[#09090B] bg-[#FAFAFA] shadow-[2px_2px_0px_0px_#09090B]">
            <span className="font-mono text-[10px] font-black text-zinc-500 uppercase block mb-1">
              STREAM CHUNKS
            </span>
            <span className="font-mono text-lg font-black text-[#F97316]">
              {streamChunksCount} chunks
            </span>
          </div>
        </div>
      </div>

      {/* System Prompt Inspector */}
      <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B] space-y-3">
        <h3 className="font-mono text-xs font-black uppercase tracking-wider text-[#09090B] flex items-center gap-2">
          <Terminal size={14} className="text-[#F97316]" />
          SYSTEM PROMPT OVERRIDE
        </h3>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
          className="w-full p-3 font-mono text-[11px] border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] focus:outline-none resize-none shadow-[2px_2px_0px_0px_#09090B]"
        />
      </div>

      {/* Conversation Memory Payload Inspector */}
      <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B]">
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="flex items-center justify-between w-full font-mono text-xs font-black uppercase text-[#09090B]"
        >
          <span className="flex items-center gap-2">
            <Code size={14} className="text-[#F97316]" />
            CONVERSATION PAYLOAD ({messages.length})
          </span>
          <span className="px-2 py-0.5 border border-[#09090B] bg-zinc-100 text-[10px]">
            {showRawJson ? 'ẨN PAYLOAD' : 'XEM PAYLOAD'}
          </span>
        </button>

        {showRawJson && (
          <pre className="mt-4 p-4 font-mono text-[11px] bg-zinc-950 text-emerald-400 border-2 border-[#09090B] overflow-x-auto max-h-64">
            {JSON.stringify(
              {
                temperature,
                confidence_threshold: confidenceThreshold,
                system_prompt: systemPrompt,
                messages,
              },
              null,
              2
            )}
          </pre>
        )}
      </div>
    </div>
  );
}
