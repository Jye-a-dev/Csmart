import { Injectable, Logger } from '@nestjs/common';

export interface SqlValidationResult {
  isValid: boolean;
  error?: string;
}

@Injectable()
export class SqlGuardrailStrategy {
  private readonly logger = new Logger(SqlGuardrailStrategy.name);
  private readonly sensitiveKeys = [
    'password',
    'password_hash',
    'secret',
    'token',
    'access_token',
    'refresh_token',
  ];

  /**
   * Kiểm tra tính hợp lệ của câu lệnh SQL (chỉ cho phép READ-ONLY SELECT hoặc WITH, chống Stacked Queries & SQL Injection)
   */
  public validateReadOnlySql(sql: string): SqlValidationResult {
    if (!sql || typeof sql !== 'string') {
      return { isValid: false, error: 'Câu lệnh SQL không hợp lệ' };
    }

    let cleanSql = sql.trim();
    // Bỏ các dấu chấm phẩy ở cuối câu lệnh
    cleanSql = cleanSql.replace(/;+$/, '').trim();

    // Chặn Stacked Queries (nếu vẫn còn dấu chấm phẩy bên trong câu truy vấn)
    if (cleanSql.includes(';')) {
      return {
        isValid: false,
        error: 'Truy vấn không hợp lệ: Không cho phép thực thi đa câu lệnh (Stacked Queries)',
      };
    }

    // Chặn comment injection (-- hoặc /* */)
    if (cleanSql.includes('--') || cleanSql.includes('/*') || cleanSql.includes('*/')) {
      return {
        isValid: false,
        error: 'Truy vấn chứa ký tự chú thích SQL không hợp lệ',
      };
    }

    const lowerSql = cleanSql.toLowerCase();
    if (!lowerSql.startsWith('select') && !lowerSql.startsWith('with')) {
      return {
        isValid: false,
        error: 'Chỉ cho phép thực thi truy vấn READ-ONLY (SELECT/WITH)',
      };
    }

    // Chặn từ khóa DDL/DML và hàm/lệnh hệ thống nguy hiểm (dùng word boundary)
    const dangerousPattern =
      /\b(delete|update|insert|drop|alter|create|truncate|rename|grant|revoke|execute|exec|copy|pg_sleep)\b/i;
    if (dangerousPattern.test(cleanSql)) {
      return {
        isValid: false,
        error: 'Truy vấn chứa từ khóa làm thay đổi dữ liệu hoặc tiềm ẩn rủi ro bảo mật',
      };
    }

    return { isValid: true };
  }

  /**
   * Redact các thông tin bảo mật nhạy cảm khỏi bảng kết quả SQL
   */
  public sanitizeRows(
    rows: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const cleanRow: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        if (this.sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
          cleanRow[key] = '[REDACTED]';
        } else {
          cleanRow[key] = value;
        }
      }
      return cleanRow;
    });
  }

  /**
   * Đánh giá câu trả lời dạng Yes/No dựa trên ngữ cảnh câu hỏi tiếng Việt/Anh và dữ liệu trả về từ SQL
   */
  public evaluateYesNoAnswer(
    question: string,
    rows: Record<string, unknown>[],
  ): boolean | undefined {
    if (!question) return undefined;
    const lowerQ = question.toLowerCase().trim();

    const isYesNoQuestion =
      /^(có|phải|đúng|tồn tại)\b/i.test(lowerQ) ||
      /\b(không|không\?|phải không\?|đúng không\?|tồn tại không\?|chưa\?)$/i.test(
        lowerQ,
      ) ||
      /\b(có|exists|exist|is there|are there|does|has|can)\b/i.test(lowerQ);

    if (!isYesNoQuestion) {
      return undefined;
    }

    if (!rows || rows.length === 0) {
      return false;
    }

    const firstRow = rows[0];
    if (firstRow) {
      for (const [key, val] of Object.entries(firstRow)) {
        if (typeof val === 'boolean') {
          return val;
        }
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('count') || lowerKey.includes('total')) {
          const num = Number(val);
          return !isNaN(num) && num > 0;
        }
        if (lowerKey.includes('exists') || lowerKey.includes('answer')) {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string')
            return (
              val.toLowerCase() === 'true' ||
              val === '1' ||
              val.toLowerCase() === 't'
            );
          if (typeof val === 'number') return val > 0;
        }
      }
    }

    return rows.length > 0;
  }
}
