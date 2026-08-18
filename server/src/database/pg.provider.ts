import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_CONNECTION = 'PG_CONNECTION';

export const PgProvider: Provider = {
  provide: PG_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('PgProvider');
    const connectionString = configService.get<string>('DATABASE_URL');
    const pool = new Pool({
      connectionString,
    });

    try {
      const client = await pool.connect();
      logger.log('Database connection established successfully');

      // Auto-migrate database table schema for category and product images if columns do not exist
      await client.query(`
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url_1 TEXT;
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url_2 TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
        ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]';

        CREATE TABLE IF NOT EXISTS ocr_records (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          document_type VARCHAR(50) NOT NULL DEFAULT 'INVOICE',
          order_code VARCHAR(100) NOT NULL,
          tracking_number VARCHAR(100),
          courier_name VARCHAR(100),
          customer_name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(50),
          address TEXT,
          total_amount NUMERIC(12, 2) DEFAULT 0,
          confidence_score REAL DEFAULT 0.95,
          execution_time_ms INT DEFAULT 300,
          image_url TEXT,
          status VARCHAR(50) DEFAULT 'VERIFIED',
          extracted_items JSONB DEFAULT '[]'::jsonb,
          raw_text_chunks JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      // Guarantee seed records exist with ON CONFLICT DO NOTHING
      await client.query(`
        INSERT INTO ocr_records (id, document_type, order_code, tracking_number, courier_name, customer_name, phone_number, address, total_amount, confidence_score, execution_time_ms, image_url, status, extracted_items, raw_text_chunks)
        VALUES 
        (
          '11111111-1111-1111-1111-111111111111',
          'INVOICE',
          'ORD-98421',
          NULL,
          NULL,
          'Nguyễn Văn An',
          '0988 123 456',
          'Số 12 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          1450000,
          0.94,
          320,
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
          'VERIFIED',
          '[{"name":"Tai nghe Bluetooth SmartPod Pro","quantity":1,"unit_price":950000},{"name":"Cáp sạc nhanh Type-C 100W","quantity":2,"unit_price":250000}]'::jsonb,
          '["SMARTCART E-COMMERCE INVOICE","Mã đơn: ORD-98421","KH: Nguyễn Văn An - SĐT: 0988 123 456","1. Tai nghe Bluetooth SmartPod Pro - 950,000đ","2. Cáp sạc nhanh Type-C - 500,000đ","TỔNG CỘNG: 1,450,000 VNĐ"]'::jsonb
        ),
        (
          '22222222-2222-2222-2222-222222222222',
          'SHIPPING_LABEL',
          'ORD-77620',
          'GHN-99823411',
          'Giao Hàng Nhanh (GHN)',
          'Trần Thị Bình',
          '0912 345 678',
          'Tòa nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh',
          820000,
          0.72,
          410,
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
          'NEEDS_REVIEW',
          '[{"name":"Nồi chiên không dầu SmartChef 5.5L","quantity":1,"unit_price":820000}]'::jsonb,
          '["GIAO HÀNG NHANH - MÃ VẬN ĐƠN: GHN-99823411","Người nhận: Trần Thị Bình - 0912345678","Đ/c: Landmark 81, B.Thạnh","Thu hộ COD: 820.000 VNĐ"]'::jsonb
        ),
        (
          '33333333-3333-3333-3333-333333333333',
          'PRODUCT_LABEL',
          'ORD-55410',
          NULL,
          NULL,
          'Phạm Minh Tuấn',
          '0903 888 999',
          'Số 45 Phố Huế, Quận Hai Bà Trưng, Hà Nội',
          3200000,
          0.89,
          280,
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
          'VERIFIED',
          '[{"name":"Đồng hồ thông minh SmartWatch Ultra","quantity":1,"unit_price":3200000}]'::jsonb,
          '["SMARTWATCH ULTRA MODEL-S9","Serial No: SN-2026-9817","Bảo hành chính hãng 12 tháng"]'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      `);

      client.release();
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Failed to establish database connection', errorStack);
      throw error;
    }

    return pool;
  },
};
