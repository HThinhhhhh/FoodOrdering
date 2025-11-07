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