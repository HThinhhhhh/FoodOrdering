-- KỸ THUẬT XÓA VÀ RESET ID (CHO POSTGRESQL)
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE employees CASCADE;

-- Reset ID
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE menu_items_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;


-- ==================================
-- 1. THÊM NGƯỜI DÙNG (Bảng mới)
-- ==================================
-- Hash cho '123': $2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m
INSERT INTO customers (phone_number, name, password, apartment_number, street_address, ward, city) VALUES
    ('0900000001', 'Khách Hàng A (Cũ)', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'P.101', '123 Đường Nguyễn Văn Cừ', 'Phường Cầu Ông Lãnh', 'Quận 1, TPHCM');    -- Customer ID 1

INSERT INTO employees (username, password, role) VALUES
                                                     ('kitchen_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'KITCHEN'),  -- Employee ID 1
                                                     ('employee_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'EMPLOYEE'), -- Employee ID 2
                                                     ('admin_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'ADMIN');      -- Employee ID 3


-- ==================================
-- 2. THÊM THỰC ĐƠN (menu_items)
-- ==================================
INSERT INTO menu_items (name, description, price, is_vegetarian, is_spicy, is_popular, category, status, image_url)
VALUES
    ('Phở Bò Tái', 'Phở bò truyền thống với thịt bò tái mềm', 65000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null),
    ('Bún Chả Hà Nội', 'Bún chả nướng than hoa, kèm rau sống', 55000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null),
    ('Nem Chay (Khai vị)', 'Nem cuốn chay kèm rau thơm và sốt tương', 30000.00, true, false, false, 'APPETIZER', 'ON_SALE', null),
    ('Bún Bò Huế (Cay)', 'Bún bò vị Huế đặc trưng, cay nồng', 60000.00, false, true, true, 'MAIN_COURSE', 'TEMP_OUT_OF_STOCK', null),
    ('Đậu Hũ Sốt Cà Chua', 'Đậu hũ non sốt cà chua, ăn kèm cơm trắng', 45000.00, true, false, false, 'MAIN_COURSE', 'ON_SALE', null),
    ('Cơm Gà Xối Mỡ', 'Cơm chiên với gà giòn xối mỡ tỏi', 50000.00, false, false, true, 'MAIN_COURSE', 'DISCONTINUED', null);

-- ==================================
-- 3. THÊM ĐƠN HÀNG MẪU (orders)
-- ==================================
INSERT INTO orders (customer_id, status, order_time, pickup_window,
                    delivery_address, shipper_note, payment_method,
                    subtotal, vat_amount, shipping_fee, grand_total,
                    is_reviewed, delivery_rating, delivery_comment, cancellation_reason,
                    kitchen_note, delivery_note, employee_note)
VALUES
    (1, 'COMPLETED', '2025-11-06 10:30:00', '2025-11-06 11:00:00',
     'P.101, 123 Đường Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, Quận 1, TPHCM', -- 1. delivery_address (Đã sửa)
     'Giao nhanh giúp', -- 2. shipper_note
     'COD', -- 3. payment_method
     85000.00, 12750.00, 30000.00, 127750.00, -- costs
     true, 5, 'Tài xế thân thiện', NULL, -- review/cancel
     'Bếp làm nhanh', 'Shipper Hùng 090...', '[admin_user - 2025-11-06 10:32:01]: Đã xác nhận' -- notes (18 cột)
    ),

    (1, 'PENDING_CONFIRMATION', '2025-11-07 11:00:00', '2025-11-07 11:30:00',
     'P.101, 123 Đường Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, Quận 1, TPHCM', -- 1. delivery_address (Đã sửa)
     NULL, -- 2. shipper_note
     'CARD', -- 3. payment_method
     65000.00, 9750.00, 30000.00, 104750.00, -- costs
     false, null, null, NULL, -- review/cancel
     NULL, NULL, NULL -- notes (18 cột)
    );

-- ==================================
-- 4. THÊM CHI TIẾT ĐƠN HÀNG (order_items)
-- ==================================
INSERT INTO order_items (order_id, menu_item_id, quantity, note)
VALUES
    -- Đơn hàng 1
    (1, 2, 1, 'Nhiều bún, ít rau'),
    (1, 3, 1, NULL),
    -- Đơn hàng 2
    (2, 1, 1, 'Không hành');

-- ==================================
-- 5. THÊM ĐÁNH GIÁ MẪU (reviews)
-- ==================================
INSERT INTO reviews (menu_item_id, customer_id, rating, comment, order_id)
VALUES
    (2, 1, 5, 'Bún chả ngon', 1),
    (3, 1, 4, 'Nem hơi ít', 1);