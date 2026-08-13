-- ============================================================================
-- CSMART AI (IDEA_2) - DATABASE SCHEMA & DDL SETUP (UPDATED ALL IDS TO UUID)
-- Target Database: PostgreSQL 14+
-- ============================================================================

-- 0. KÍCH HOẠT EXTENSION HỖ TRỢ VÀ TẠO ENUM TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum vai trò người dùng
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'SUPPORT');

-- Enum trạng thái tổng quan đơn hàng
CREATE TYPE order_status AS ENUM (
    'PENDING', 
    'PROCESSING', 
    'SHIPPED', 
    'DELIVERED', 
    'CANCELLED', 
    'REFUNDED'
);

-- Enum phương thức & trạng thái thanh toán
CREATE TYPE payment_method AS ENUM ('COD', 'CREDIT_CARD', 'BANK_TRANSFER', 'MOMO', 'VNPAY');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- 1. ENUM TRẠNG THÁI HÀNG TRONG KHO (PRODUCT AVAILABILITY)
CREATE TYPE product_status AS ENUM (
    'IN_STOCK',      -- Còn hàng
    'OUT_OF_STOCK', -- Hết hàng
    'PRE_ORDER',    -- Đặt hàng trước
    'DISCONTINUED'  -- Ngừng kinh doanh
);

-- 2. ENUM TÌNH TRẠNG VẬN CHUYỂN TỪNG MÓN HÀNG (ORDER ITEM SHIPPING STATUS)
CREATE TYPE item_shipping_status AS ENUM (
    'PENDING',      -- Chờ xử lý
    'PREPARING',    -- Đang đóng gói
    'SHIPPED',      -- Đã giao cho bên vận chuyển
    'IN_TRANSIT',   -- Đang trên đường giao
    'DELIVERED',    -- Đã giao thành công đến tay khách
    'RETURNED',     -- Khách trả hàng / Giao thất bại
    'CANCELLED'     -- Món hàng bị hủy
);

-- ============================================================================
-- 1. BẢNG NGƯỜI DÙNG & QUẢN LÝ TÀI KHOẢN (USERS & AUTH)
-- ============================================================================
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'CUSTOMER' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street_address TEXT NOT NULL,
    ward VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    city_province VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 2. BẢNG QUẢN LÝ DANH MỤC & SẢN PHẨM (CATEGORIES & PRODUCTS)
-- ============================================================================
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url_1 TEXT,
    image_url_2 TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    discount_price NUMERIC(12, 2) CHECK (discount_price >= 0),
    stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
    status product_status DEFAULT 'IN_STOCK' NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    tags VARCHAR(50)[],
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 3. BẢNG QUẢN LÝ ĐƠN HÀNG (ORDERS & ITEM TRACKING)
-- ============================================================================
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_code VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status order_status DEFAULT 'PENDING' NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_fee NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0 NOT NULL,
    shipping_address TEXT NOT NULL,
    note TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    shipping_status item_shipping_status DEFAULT 'PENDING' NOT NULL,
    courier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    estimated_delivery TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'PENDING' NOT NULL,
    transaction_code VARCHAR(100),
    amount NUMERIC(12, 2) NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 4. BẢNG PHỤC VỤ AI & EVALUATOR (LOGS & FAQS)
-- ============================================================================
CREATE TABLE faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    topic VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE ai_request_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    endpoint VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    input_text TEXT,
    output_json JSONB NOT NULL,
    corrected_output JSONB,
    confidence_score REAL,
    flag_for_review BOOLEAN DEFAULT FALSE NOT NULL,
    execution_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 5. INDEXES TỐI ƯU HÓA TRUY VẤN
-- ============================================================================
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_order_items_shipping ON order_items(shipping_status);
CREATE INDEX idx_order_items_tracking ON order_items(tracking_number);

-- ============================================================================
-- 6. BẢNG HUMAN-IN-THE-LOOP (HITL) REVIEW QUEUE
-- ============================================================================
CREATE TYPE hitl_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'LABELLED'
);

CREATE TABLE ai_review_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    log_id UUID REFERENCES ai_request_logs(id) ON DELETE CASCADE,
    endpoint VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    input_text TEXT,
    output_json JSONB NOT NULL,
    confidence_score REAL,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status hitl_status DEFAULT 'PENDING' NOT NULL,
    reviewer_note TEXT,
    corrected_label TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_review_queue_status ON ai_review_queue(status);
CREATE INDEX idx_review_queue_endpoint ON ai_review_queue(endpoint);
CREATE INDEX idx_review_queue_user ON ai_review_queue(user_id);

ALTER TABLE ai_request_logs ADD COLUMN IF NOT EXISTS review_id UUID REFERENCES ai_review_queue(id) ON DELETE SET NULL;