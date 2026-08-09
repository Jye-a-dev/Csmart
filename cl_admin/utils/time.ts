/**
 * Định dạng đối tượng Date thành chuỗi thời gian HH:MM:SS
 */
export function formatTimeString(date: Date): string {
  return date.toTimeString().split(' ')[0];
}
