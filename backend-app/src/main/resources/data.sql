-- KỸ THUẬT XÓA VÀ RESET ID (CHO POSTGRESQL)
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE app_user CASCADE;

-- Reset ID
ALTER SEQUENCE app_user_id_seq RESTART WITH 1;
ALTER SEQUENCE menu_items_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;


-- ==================================
-- 1. THÊM NGƯỜI DÙNG (app_user)
-- ==================================
-- (Giữ nguyên)
INSERT INTO app_user (phone_number, name, password, role, apartment_number, street_address, ward, city) VALUES
                                                                                                            ('0900000001', 'Khách Hàng A (Cũ)', '123', 'DINER', 'P.101', '123 Đường Nguyễn Văn Cừ', 'Phường Cầu Ông Lãnh', 'Quận 1, TPHCM'),
                                                                                                            ('0900000002', 'Bếp Trưởng', '123', 'KITCHEN', NULL, NULL, NULL, NULL),
                                                                                                            ('0900000003', NULL, '123', 'DINER', NULL, NULL, NULL, NULL);

-- ==================================
-- 2. THÊM THỰC ĐƠN (menu_items)
-- ==================================
-- (Giữ nguyên)
INSERT INTO menu_items (name, description, price, is_vegetarian, is_spicy, is_popular)
VALUES
    ('Phở Bò Tái', 'Phở bò truyền thống với thịt bò tái mềm', 65000.00, false, false, true),
    ('Bún Chả Hà Nội', 'Bún chả nướng than hoa, kèm rau sống', 55000.00, false, false, true),
    ('Nem Chay (Khai vị)', 'Nem cuốn chay kèm rau thơm và sốt tương', 30000.00, true, false, false),
    ('Bún Bò Huế (Cay)', 'Bún bò vị Huế đặc trưng, cay nồng', 60000.00, false, true, true),
    ('Đậu Hũ Sốt Cà Chua', 'Đậu hũ non sốt cà chua, ăn kèm cơm trắng', 45000.00, true, false, false),
    ('Cơm Gà Xối Mỡ', 'Cơm chiên với gà giòn xối mỡ tỏi', 50000.00, false, false, true);

-- ==================================
-- 3. THÊM ĐƠN HÀNG MẪU (orders)
-- ==================================
-- --- THÊM CỘT "cancellation_reason" ---
INSERT INTO orders (user_id, status, order_time, pickup_window,
                    delivery_address, shipper_note, payment_method,
                    subtotal, vat_amount, shipping_fee, grand_total,
                    is_reviewed, delivery_rating, delivery_comment, cancellation_reason)
VALUES
    (1, 'COMPLETED', '2025-11-06 10:30:00', '2025-11-06 11:00:00',
     'P.101, 123 Đường Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, Quận 1, TPHCM', 'Giao nhanh giúp', 'COD',
     85000.00, 12750.00, 30000.00, 127750.00, true, 5, 'Tài xế thân thiện', NULL),
    (1, 'RECEIVED', '2025-11-07 11:00:00', '2025-11-07 11:30:00',
     'P.101, 123 Đường Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, Quận 1, TPHCM', NULL, 'CARD',
     65000.00, 9750.00, 30000.00, 104750.00, false, null, null, NULL),
    (3, 'CANCELLED', '2025-11-07 12:00:00', '2025-11-07 12:30:00',
     'Địa chỉ user 3', 'Ghi chú', 'MOMO',
     50000.00, 7500.00, 30000.00, 87500.00, false, null, null, 'Hết món'); -- Đơn hàng bị hủy mẫu

-- ==================================
-- 4. THÊM CHI TIẾT ĐƠN HÀNG (order_items)
-- ==================================
-- (Giữ nguyên)
INSERT INTO order_items (order_id, menu_item_id, quantity, note)
VALUES
    (1, 2, 1, 'Nhiều bún, ít rau'),
    (1, 3, 1, NULL),
    (2, 1, 1, 'Không hành'),
    (3, 6, 1, NULL);

-- ==================================
-- 5. THÊM ĐÁNH GIÁ MẪU (reviews)
-- ==================================
-- (Giữ nguyên, 'order_id' đã có)
INSERT INTO reviews (menu_item_id, user_id, rating, comment, order_id)
VALUES
    (2, 1, 5, 'Bún chả ngon', 1),
    (3, 1, 4, 'Nem hơi ít', 1);