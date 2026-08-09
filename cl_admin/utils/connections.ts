import { computeLatency } from './latency';

interface ConnectionCheckResult {
  latency: number;
  serverStatus: 'ONLINE' | 'OFFLINE';
  pipelineStatus: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  circuitBreaker: string;
  hitlCount: number;
}

/**
 * Thực hiện gọi API kiểm tra trạng thái kết nối các phân hệ
 */
export async function checkSystemConnections(
  baseUrl: string,
  getCircuitStatus: () => Promise<{ state: string }>,
  countLogsBy: (filters: { flag_for_review: boolean }) => Promise<number>
): Promise<ConnectionCheckResult> {
  const startTime = performance.now();
  try {
    const response = await fetch(`${baseUrl}/`);
    const endTime = performance.now();
    const latency = computeLatency(startTime, endTime);

    if (response.ok) {
      let circuitBreaker = 'UNKNOWN';
      let pipelineStatus: 'ONLINE' | 'OFFLINE' | 'UNKNOWN' = 'UNKNOWN';

      try {
        const circuit = await getCircuitStatus();
        circuitBreaker = circuit.state || 'CLOSED';
        pipelineStatus = circuit.state === 'OPEN' ? 'OFFLINE' : 'ONLINE';
      } catch {
        pipelineStatus = 'OFFLINE';
      }

      let hitlCount = 0;
      try {
        hitlCount = await countLogsBy({ flag_for_review: true });
      } catch {
        hitlCount = 0;
      }

      return {
        latency,
        serverStatus: 'ONLINE',
        pipelineStatus,
        circuitBreaker,
        hitlCount,
      };
    } else {
      return {
        latency: 0,
        serverStatus: 'OFFLINE',
        pipelineStatus: 'UNKNOWN',
        circuitBreaker: 'UNKNOWN',
        hitlCount: 0,
      };
    }
  } catch {
    return {
      latency: 0,
      serverStatus: 'OFFLINE',
      pipelineStatus: 'OFFLINE',
      circuitBreaker: 'UNKNOWN',
      hitlCount: 0,
    };
  }
}
