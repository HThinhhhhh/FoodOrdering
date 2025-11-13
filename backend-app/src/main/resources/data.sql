-- KỸ THUẬT XÓA VÀ RESET ID (CHO POSTGRESQL)
-- Thêm các bảng mới (vouchers, option_items, option_groups) vào truncate
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE vouchers CASCADE;
TRUNCATE TABLE option_items CASCADE;
TRUNCATE TABLE option_groups CASCADE;
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE employees CASCADE;

-- Reset ID cho tất cả các bảng
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE menu_items_id_seq RESTART WITH 1;
ALTER SEQUENCE option_groups_id_seq RESTART WITH 1;
ALTER SEQUENCE option_items_id_seq RESTART WITH 1;
ALTER SEQUENCE vouchers_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;


-- ==================================
-- 1. THÊM NGƯỜI DÙNG (CUSTOMERS & EMPLOYEES)
-- ==================================
-- Hash BCrypt chính xác cho '123': $2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m
INSERT INTO customers (phone_number, name, password, apartment_number, street_address, ward, city) VALUES
    ('0900000001', 'Khách Hàng A', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'P.101', '123 Đường Nguyễn Văn Cừ', 'Phường Cầu Ông Lãnh', 'Quận 1, TPHCM'); -- ID 1

INSERT INTO employees (username, password, role) VALUES
                                                     ('kitchen_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'KITCHEN'),   -- ID 1
                                                     ('employee_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'EMPLOYEE'), -- ID 2
                                                     ('admin_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'ADMIN');       -- ID 3


-- ==================================
-- 2. THÊM THỰC ĐƠN (MENU ITEMS)
-- ==================================
-- (Đã thêm category, status, image_url)
INSERT INTO menu_items (name, description, price, is_vegetarian, is_spicy, is_popular, category, status, image_url)
VALUES
    -- ID 1 (Có Tùy chọn)
    ('Phở Bò Tái', 'Phở bò truyền thống với thịt bò tái mềm', 65000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null),
    -- ID 2 (Bún Chả - Dùng cho Combo)
    ('Bún Chả Hà Nội', 'Bún chả nướng than hoa, kèm rau sống', 55000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null),
    -- ID 3 (Hết hàng)
    ('Bún Bò Huế (Cay)', 'Bún bò vị Huế đặc trưng, cay nồng', 60000.00, false, true, true, 'MAIN_COURSE', 'TEMP_OUT_OF_STOCK', null),
    -- ID 4 (Ngừng bán)
    ('Cơm Gà Xối Mỡ', 'Cơm chiên với gà giòn xối mỡ tỏi', 50000.00, false, false, true, 'MAIN_COURSE', 'DISCONTINUED', null),
    -- ID 5 (Món chay)
    ('Đậu Hũ Sốt Cà Chua', 'Đậu hũ non sốt cà chua, ăn kèm cơm trắng', 45000.00, true, false, false, 'MAIN_COURSE', 'ON_SALE', null),
    -- ID 6 (Khai vị)
    ('Nem Chay (Khai vị)', 'Nem cuốn chay kèm rau thơm và sốt tương', 30000.00, true, false, false, 'APPETIZER', 'ON_SALE', null),
    -- ID 7 (Đồ uống - Dùng cho Combo)
    ('Coca-Cola', 'Coca-Cola lon 330ml', 15000.00, true, false, true, 'BEVERAGE', 'ON_SALE', null),
    -- ID 8 (Combo)
    ('Combo Bún Chả', '1 Bún Chả + 1 Nước ngọt. Tiết kiệm 5k', 65000.00, false, false, true, 'COMBO', 'ON_SALE', null);

-- ==================================
-- 3. THÊM TÙY CHỌN MÓN ĂN (OPTIONS)
-- ==================================
-- --- SỬA LỖI (Statement #22): Thêm cột selection_type ---
INSERT INTO option_groups (name, menu_item_id, selection_type) VALUES
                                                                   ('Chọn Size (Phở)', 1, 'SINGLE_REQUIRED'),   -- Option Group ID 1 (Bắt buộc chọn 1)
                                                                   ('Chọn Topping (Phở)', 1, 'MULTI_SELECT'), -- Option Group ID 2 (Được chọn nhiều)
                                                                   ('Chọn Nước Ngọt (Combo)', 8, 'SINGLE_REQUIRED'); -- Option Group ID 3 (Bắt buộc chọn 1)

INSERT INTO option_items (name, price, option_group_id, linked_menu_item_id) VALUES
                                                                                 -- Tùy chọn cho "Chọn Size" (Group 1)
                                                                                 ('Tô nhỏ (Mặc định)', 0, 1, NULL), -- ID 1
                                                                                 ('Tô lớn (+15k)', 15000, 1, NULL), -- ID 2

                                                                                 -- Tùy chọn cho "Topping" (Group 2)
                                                                                 ('Thêm trứng (+5k)', 5000, 2, NULL), -- ID 3
                                                                                 ('Thêm quẩy (+5k)', 5000, 2, NULL), -- ID 4

                                                                                 -- Tùy chọn cho "Chọn Nước Ngọt" (Group 3, liên kết với Combo ID 8)
                                                                                 ('Coca-Cola (Mặc định)', 0, 3, 7), -- ID 5 (Link tới MenuItem ID 7)
                                                                                 ('Bún Chả (Test Link)', 0, 3, 2);  -- ID 6 (Link tới MenuItem ID 2)

-- ==================================
-- 4. THÊM MÃ GIẢM GIÁ (VOUCHERS)
-- ==================================
INSERT INTO vouchers (code, description, discount_type, discount_value, max_discount_amount, minimum_spend, usage_limit, current_usage, start_date, end_date, is_active)
VALUES
    ('GIAM30K', 'Giảm 30k cho đơn từ 150k', 'FIXED_AMOUNT', 30000, NULL, 150000, 100, 1, '2025-01-01 00:00:00', '2025-12-31 23:59:59', true),
    ('GIAM50', 'Giảm 50% tối đa 20k', 'PERCENTAGE', 50, 20000, NULL, 50, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', true),
    ('HETHAN', 'Voucher đã hết hạn', 'FIXED_AMOUNT', 10000, NULL, NULL, 10, 0, '2024-01-01 00:00:00', '2024-12-31 23:59:59', false);

-- ==================================
-- 5. THÊM ĐƠN HÀNG (ORDERS)
-- ==================================
-- (Đã cập nhật các trường notes, voucher, discount)
INSERT INTO orders (customer_id, status, order_time, pickup_window,
                    delivery_address, shipper_note, payment_method,
                    subtotal, vat_amount, shipping_fee, grand_total,
                    is_reviewed,
                    kitchen_note, delivery_note, employee_note,
                    voucher_code, discount_amount)
VALUES
    (1, 'PENDING_CONFIRMATION', '2025-11-13 01:00:00', '2025-11-13 01:30:00','123 Đường Nguyễn Văn Cừ, P. Cầu Ông Lãnh, Quận 1, TPHCM', 'Giao nhanh nhé', 'COD', 65000.00, 9750.00, 30000.00, 104750.00, false, NULL, NULL, NULL, NULL, 0),
    (1, 'RECEIVED', '2025-11-13 00:30:00', '2025-11-13 01:00:00','456 Đường Lê Lợi, P. Bến Nghé, Quận 1, TPHCM', NULL, 'CARD', 55000.00, 8250.00, 30000.00, 93250.00, false, NULL, NULL, '[admin_user]: Đã xác nhận', NULL, 0),
    (1, 'PREPARING', '2025-11-13 00:00:00', '2025-11-13 00:30:00','789 Đường Võ Văn Tần, P. 6, Quận 3, TPHCM', 'Ít cay', 'EWALLET', 120000.00, 18000.00, 30000.00, 168000.00, false, 'Khách dặn ít cay', NULL, '[admin_user]: Đã xác nhận', NULL, 0),
    (1, 'READY', '2025-11-12 23:30:00', '2025-11-13 00:00:00','111 Đường Hai Bà Trưng, P. Đa Kao, Quận 1, TPHCM', NULL, 'COD', 45000.00, 6750.00, 30000.00, 81750.00, false, 'OK', NULL, '[admin_user]: Đã xác nhận', NULL, 0),
    (1, 'DELIVERING', '2025-11-12 23:00:00', '2025-11-12 23:30:00','222 Đường CMT8, P. 10, Quận 3, TPHCM', 'Giao ngoài giờ', 'CARD', 85000.00, 12750.00, 30000.00, 127750.00, false, NULL, 'Shipper Tuấn 090... đang giao', '[admin_user]: Đã xác nhận', NULL, 0),
    (1, 'COMPLETED', '2025-11-12 12:00:00', '2025-11-12 12:30:00','333 Đường 3/2, P. 11, Quận 10, TPHCM', NULL, 'COD', 150000.00, 22500.00, 30000.00, 172500.00, false, 'Làm nhanh', 'Giao thành công', '[admin_user]: Đã xác nhận', 'GIAM30K', 30000.00),
    (1, 'CANCELLED', '2025-11-12 11:00:00', '2025-11-12 11:30:00','444 Đường Sư Vạn Hạnh, P. 12, Quận 10, TPHCM', 'Gọi trước 10p', 'COD', 55000.00, 8250.00, 30000.00, 93250.00, false, NULL, NULL, '[admin_user]: Khách gọi hủy', NULL, 0),
    (1, 'COMPLETED', '2025-11-11 11:30:00', '2025-11-11 12:00:00','123 Đường Nguyễn Văn Cừ, P. Cầu Ông Lãnh, Quận 1, TPHCM', NULL, 'CARD', 55000.00, 8250.00, 30000.00, 93250.00, false, NULL, 'Giao thành công', '[admin_user]: Đã xác nhận', NULL, 0);


-- ==================================
-- 6. THÊM CHI TIẾT ĐƠN HÀNG (ORDER ITEMS)
-- ==================================
-- --- SỬA LỖI (Statement #26): Thêm 2 cột (price_per_unit, selected_options_text) ---
INSERT INTO order_items (order_id, menu_item_id, quantity, note, price_per_unit, selected_options_text)
VALUES
    -- Đơn 1 (Pending): Phở (Giá gốc 65k)
    (1, 1, 1, 'Không hành', 65000.00, 'Tô nhỏ (Mặc định)'),
    -- Đơn 2 (Received): Bún Chả (Giá gốc 55k)
    (2, 2, 1, NULL, 55000.00, NULL),
    -- Đơn 3 (Preparing): 2 món
    (3, 2, 1, 'Nhiều bún', 55000.00, NULL),
    (3, 3, 1, NULL, 60000.00, NULL), -- Bún Bò Huế
    -- Đơn 4 (Ready): Đậu hũ
    (4, 5, 1, NULL, 45000.00, NULL),
    -- Đơn 5 (Delivering): Phở (Giá gốc 65k + 15k Size L + 5k Trứng = 85k)
    (5, 1, 1, 'Tô lớn, thêm trứng', 85000.00, 'Tô lớn (+15k), Thêm trứng (+5k)'),
    -- Đơn 6 (Completed): 3 món
    (6, 1, 1, NULL, 65000.00, 'Tô nhỏ (Mặc định)'),
    (6, 2, 1, 'Không rau', 55000.00, NULL),
    (6, 6, 1, NULL, 30000.00, NULL), -- Nem Chay
    -- Đơn 7 (Cancelled): Bún chả
    (7, 2, 1, NULL, 55000.00, NULL),
    -- Đơn 8 (Completed): Bún chả
    (8, 2, 1, NULL, 55000.00, NULL);

-- ==================================
-- 7. THÊM ĐÁNH GIÁ MẪU (REVIEWS)
-- ==================================
-- --- SỬA ĐỔI: Thêm cột review_time ---
INSERT INTO reviews (menu_item_id, customer_id, rating, comment, order_id, review_time)
VALUES
    -- Đánh giá cho Đơn hàng 6 (COMPLETED, trong 30 ngày)
    (1, 1, 5, 'Phở ngon', 6, '2025-11-12 13:00:00'),
    (2, 1, 4, 'Bún chả ok', 6, '2025-11-12 13:01:00'),
    (6, 1, 3, 'Nem hơi ít', 6, '2025-11-12 13:02:00'),

    -- Đánh giá cho Đơn hàng 8 (COMPLETED, trong 30 ngày)
    (2, 1, 5, 'Bún chả lần này rất ngon', 8, '2025-11-11 12:30:00');