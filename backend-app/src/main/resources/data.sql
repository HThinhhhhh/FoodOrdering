-- KỸ THUẬT XÓA VÀ RESET ID (CHO POSTGRESQL)
-- Giúp script này có thể chạy lại nhiều lần mà không bị lỗi
-- Xóa theo thứ tự ngược lại của quan hệ (foreign key)
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
-- (Mật khẩu là '123' - trong thực tế sẽ được mã hóa)
INSERT INTO app_user (username, password, role) VALUES
                                                    ('diner_user', '123', 'DINER'),    -- User ID 1 (Khách hàng)
                                                    ('kitchen_user', '123', 'KITCHEN');  -- User ID 2 (Nhân viên bếp)


-- ==================================
-- 2. THÊM THỰC ĐƠN (menu_items)
-- ==================================
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
-- (Một đơn hàng ĐÃ HOÀN THÀNH để test)
-- Tổng tiền: 125000.00 (1 Phở + 1 Bún Bò Huế)
INSERT INTO orders (user_id, status, pickup_window, order_time, total_amount)
VALUES
    (1, 'READY', (NOW() - INTERVAL '1 day'), (NOW() - INTERVAL '1 day' - INTERVAL '15 minute'), 125000.00); -- Order ID 1

-- (Một đơn hàng VỪA MỚI NHẬN - để test KDS)
-- Tổng tiền: 55000.00 (1 Bún Chả)
INSERT INTO orders (user_id, status, pickup_window, order_time, total_amount)
VALUES
    (1, 'RECEIVED', (NOW() + INTERVAL '1 hour'), NOW(), 55000.00); -- Order ID 2


-- ==================================
-- 4. THÊM CHI TIẾT ĐƠN HÀNG (order_items)
-- ==================================
-- Chi tiết cho Đơn hàng 1
INSERT INTO order_items (order_id, menu_item_id, quantity)
VALUES
    (1, 1, 1), -- 1 Phở Bò (ID 1)
    (1, 4, 1); -- 1 Bún Bò Huế (ID 4)

-- Chi tiết cho Đơn hàng 2
INSERT INTO order_items (order_id, menu_item_id, quantity)
VALUES
    (2, 2, 1); -- 1 Bún Chả (ID 2)


-- ==================================
-- 5. THÊM ĐÁNH GIÁ (reviews)
-- ==================================
-- User 1 đánh giá món Phở Bò (từ đơn hàng đã hoàn thành)
INSERT INTO reviews (menu_item_id, user_id, rating, comment)
VALUES
    (1, 1, 5, 'Phở ở đây rất ngon, nước dùng đậm đà!');