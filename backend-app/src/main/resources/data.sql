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
-- Mật khẩu là '123' (văn bản thuần)
-- --- THAY ĐỔI: DÙNG SĐT VÀ THÊM TÊN, ĐỊA CHỈ ---
INSERT INTO app_user (phone_number, name, password, role, apartment_number, street_address, ward, city) VALUES
                                                                                                            ('0900000001', 'Khách Hàng A (Cũ)', '123', 'DINER', 'P.101', '123 Đường Nguyễn Văn Cừ', 'Phường Cầu Ông Lãnh', 'Quận 1, TPHCM'),    -- User ID 1 (Khách hàng)
                                                                                                            ('0900000002', 'Bếp Trưởng', '123', 'KITCHEN', NULL, NULL, NULL, NULL),  -- User ID 2 (Nhân viên bếp)
                                                                                                            ('0900000003', NULL, '123', 'DINER', NULL, NULL, NULL, NULL); -- User ID 3 (User mới, chưa đặt hàng)


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
-- --- THÊM CÁC CỘT MỚI ---
INSERT INTO orders (user_id, status, order_time, pickup_window,
                    delivery_address, shipper_note, payment_method,
                    subtotal, vat_amount, shipping_fee, grand_total, is_reviewed, delivery_rating, delivery_comment)
VALUES
    (1, 'COMPLETED', '2025-11-06 10:30:00', '2025-11-06 11:00:00',
     'P.101, 123 Đường Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, Quận 1, TPHCM', 'Giao nhanh giúp', 'COD',
     85000.00, 12750.00, 30000.00, 127750.00, true, 5, 'Tài xế thân thiện'),
    (1, 'RECEIVED', '2025-11-07 11:00:00', '2025-11-07 11:30:00',
     'P.101, 123 Đường Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, Quận 1, TPHCM', NULL, 'CARD',
     65000.00, 9750.00, 30000.00, 104750.00, false, null, null);

-- ==================================
-- 4. THÊM CHI TIẾT ĐƠN HÀNG (order_items)
-- ==================================
-- --- THÊM CỘT "note" ---
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
-- --- THÊM CỘT "order_id" ---
INSERT INTO reviews (menu_item_id, user_id, rating, comment, order_id)
VALUES
    (2, 1, 5, 'Bún chả ngon', 1),
    (3, 1, 4, 'Nem hơi ít', 1);