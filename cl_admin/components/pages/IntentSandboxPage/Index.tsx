'use client';

import { useState } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  IntentSandboxHeader,
  IntentInputPanel,
  IntentOutputPanel,
  IntentResponse,
} from './sections';

const SAMPLE_PROMPTS = [
  'Cho tôi xem áo thun nam màu đen size L dưới 300k',
  'Hủy giúp tôi đơn hàng #1085 vì đặt nhầm màu',
  'Shop có chính sách miễn phí vận chuyển không?',
  'Địa chỉ cửa hàng gần nhất ở đâu?',
];

export default function IntentSandboxPage() {
  const [query, setQuery] = useState<string>(SAMPLE_PROMPTS[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async (inputQuery?: string) => {
    const textToClassify = inputQuery ?? query;
    if (!textToClassify.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const data = await apiClient<IntentResponse>('/ai/intent', {
        method: 'POST',
        body: { query: textToClassify },
      });
      setResult({
        ...data,
        execution_time_ms: data.execution_time_ms ?? Date.now() - startTime,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối dịch vụ AI Intent';
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <IntentSandboxHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <IntentInputPanel
            query={query}
            setQuery={setQuery}
            loading={loading}
            onClassify={handleClassify}
            samplePrompts={SAMPLE_PROMPTS}
          />
        </div>

        <div className="lg:col-span-7">
          <IntentOutputPanel
            result={result}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
