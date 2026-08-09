/**
 * Tính toán độ trễ phản hồi theo đơn vị giây
 */
export function computeLatency(startTime: number, endTime: number): number {
  return Number(((endTime - startTime) / 1000).toFixed(3));
}
