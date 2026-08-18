import { OcrRecordItem } from '../sections';

export const exportOcrRecordsToCsv = (records: OcrRecordItem[], onSuccess?: () => void) => {
  const headers = ['ID', 'Mã đơn', 'Mã vận đơn', 'Loại', 'Khách hàng', 'SĐT', 'Địa chỉ', 'Tổng tiền', 'Độ tin cậy', 'Thời gian'];
  const rows = records.map((r) => [
    r.id,
    r.order_code,
    r.tracking_number || '',
    r.document_type,
    `"${r.customer_name}"`,
    r.phone_number || '',
    `"${(r.address || '').replace(/"/g, '""')}"`,
    r.total_amount,
    `${Math.round((r.confidence_score || 0.9) * 100)}%`,
    r.created_at,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ocr_records_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (onSuccess) onSuccess();
};
