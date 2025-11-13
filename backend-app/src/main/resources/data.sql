-- KỸ THUẬT XÓA VÀ RESET ID (CHO POSTGRESQL)
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
-- (Tạo 3 khách hàng)
INSERT INTO customers (phone_number, name, password, apartment_number, street_address, ward, city) VALUES
                                                                                                       ('0900000001', 'Khách Hàng A', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'P.101', '123 Đường Nguyễn Văn Cừ', 'Phường Cầu Ông Lãnh', 'Quận 1, TPHCM'), -- ID 1
                                                                                                       ('0900000002', 'Khách Hàng B', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'P.202', '456 Đường Lê Lợi', 'Phường Bến Nghé', 'Quận 1, TPHCM'), -- ID 2
                                                                                                       ('0900000003', 'Khách Hàng C', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'P.303', '789 Đường Võ Văn Tần', 'Phường 6', 'Quận 3, TPHCM'); -- ID 3

-- (Tạo 3 nhân viên)
INSERT INTO employees (username, password, role) VALUES
                                                     ('kitchen_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'KITCHEN'),   -- ID 1
                                                     ('employee_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'EMPLOYEE'), -- ID 2
                                                     ('admin_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'ADMIN');       -- ID 3


-- ==================================
-- 2. THÊM THỰC ĐƠN (MENU ITEMS)
-- ==================================
-- (Giữ nguyên)
INSERT INTO menu_items (name, description, price, is_vegetarian, is_spicy, is_popular, category, status, image_url)
VALUES
    ('Phở Bò Tái', 'Phở bò truyền thống với thịt bò tái mềm', 65000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null), -- ID 1
    ('Bún Chả Hà Nội', 'Bún chả nướng than hoa, kèm rau sống', 55000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null), -- ID 2
    ('Bún Bò Huế (Cay)', 'Bún bò vị Huế đặc trưng, cay nồng', 60000.00, false, true, true, 'MAIN_COURSE', 'TEMP_OUT_OF_STOCK', null), -- ID 3 (Hết hàng -> Thông báo)
    ('Cơm Gà Xối Mỡ', 'Cơm chiên với gà giòn xối mỡ tỏi', 50000.00, false, false, true, 'MAIN_COURSE', 'DISCONTINUED', null), -- ID 4
    ('Đậu Hũ Sốt Cà Chua', 'Đậu hũ non sốt cà chua, ăn kèm cơm trắng', 45000.00, true, false, false, 'MAIN_COURSE', 'ON_SALE', null), -- ID 5
    ('Nem Chay (Khai vị)', 'Nem cuốn chay kèm rau thơm và sốt tương', 30000.00, true, false, false, 'APPETIZER', 'ON_SALE', null), -- ID 6
    ('Coca-Cola', 'Coca-Cola lon 330ml', 15000.00, true, false, true, 'BEVERAGE', 'ON_SALE', null), -- ID 7
    ('Combo Bún Chả', '1 Bún Chả + 1 Nước ngọt. Tiết kiệm 5k', 65000.00, false, false, true, 'COMBO', 'ON_SALE', null); -- ID 8

-- ==================================
-- 3. THÊM TÙY CHỌN MÓN ĂN (OPTIONS)
-- ==================================
-- (Giữ nguyên)
INSERT INTO option_groups (name, menu_item_id, selection_type) VALUES
                                                                   ('Chọn Size (Phở)', 1, 'SINGLE_REQUIRED'),   -- Option Group ID 1
                                                                   ('Chọn Topping (Phở)', 1, 'MULTI_SELECT'), -- Option Group ID 2
                                                                   ('Chọn Nước Ngọt (Combo)', 8, 'SINGLE_REQUIRED'); -- Option Group ID 3

INSERT INTO option_items (name, price, option_group_id, linked_menu_item_id) VALUES
                                                                                 ('Tô nhỏ (Mặc định)', 0, 1, NULL), -- ID 1
                                                                                 ('Tô lớn (+15k)', 15000, 1, NULL), -- ID 2
                                                                                 ('Thêm trứng (+5k)', 5000, 2, NULL), -- ID 3
                                                                                 ('Thêm quẩy (+5k)', 5000, 2, NULL), -- ID 4
                                                                                 ('Coca-Cola (Mặc định)', 0, 3, 7), -- ID 5
                                                                                 ('Bún Chả (Test Link)', 0, 3, 2);  -- ID 6

-- ==================================
-- 4. THÊM MÃ GIẢM GIÁ (VOUCHERS)
-- ==================================
-- (Giữ nguyên)
INSERT INTO vouchers (code, description, discount_type, discount_value, max_discount_amount, minimum_spend, usage_limit, current_usage, start_date, end_date, is_active)
VALUES
    ('GIAM30K', 'Giảm 30k cho đơn từ 150k', 'FIXED_AMOUNT', 30000, NULL, 150000, 100, 1, '2025-01-01 00:00:00', '2025-12-31 23:59:59', true),
    ('GIAM50', 'Giảm 50% tối đa 20k', 'PERCENTAGE', 50, 20000, NULL, 50, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', true),
    ('HETHAN', 'Voucher đã hết hạn', 'FIXED_AMOUNT', 10000, NULL, NULL, 10, 0, '2024-01-01 00:00:00', '2024-12-31 23:59:59', false);

-- ==================================
-- 5. THÊM ĐƠN HÀNG (ORDERS)
-- (Dàn trải 7 ngày qua, và đủ các Status)
-- Giả sử hôm nay là 2025-11-13
-- ==================================

-- (COMPLETED - 7 ngày trước)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'COMPLETED', '2025-11-06 10:00:00', '2025-11-06 10:30:00','123 Đường Nguyễn Văn Cừ', 'COD', 130000.00, 19500.00, 30000.00, 179500.00, true); -- ID 1

-- (COMPLETED - 5 ngày trước)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'COMPLETED', '2025-11-08 11:00:00', '2025-11-08 11:30:00','456 Đường Lê Lợi', 'CARD', 45000.00, 6750.00, 30000.00, 81750.00, true); -- ID 2

-- (COMPLETED - 4 ngày trước)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (3, 'COMPLETED', '2025-11-09 12:00:00', '2025-11-09 12:30:00','789 Đường Võ Văn Tần', 'EWALLET', 325000.00, 48750.00, 30000.00, 403750.00, true); -- ID 3

-- (COMPLETED - 2 ngày trước, có voucher)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed, voucher_code, discount_amount)
VALUES (1, 'COMPLETED', '2025-11-11 14:00:00', '2025-11-11 14:30:00','123 Đường Nguyễn Văn Cừ', 'COD', 255000.00, 38250.00, 30000.00, 293250.00, true, 'GIAM30K', 30000.00); -- ID 4

-- (COMPLETED - 1 ngày trước, CHƯA REVIEW -> Sẽ dùng để tạo Review mới)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'COMPLETED', '2025-11-12 18:00:00', '2025-11-12 18:30:00','456 Đường Lê Lợi', 'CARD', 110000.00, 16500.00, 30000.00, 156500.00, false); -- ID 5

-- (CANCELLED - Hôm nay -> Trigger Thông báo)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed, cancellation_reason)
VALUES (3, 'CANCELLED', '2025-11-13 10:00:00', '2025-11-13 10:30:00','789 Đường Võ Văn Tần', 'COD', 55000.00, 8250.00, 30000.00, 93250.00, false, 'Khách bom hàng'); -- ID 6

-- (DELIVERING - Hôm nay -> Status Chart)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'DELIVERING', '2025-11-13 11:00:00', '2025-11-13 11:30:00','123 Đường Nguyễn Văn Cừ', 'CARD', 85000.00, 12750.00, 30000.00, 127750.00, false); -- ID 7

-- (READY - Hôm nay -> Status Chart)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'READY', '2025-11-13 12:00:00', '2025-11-13 12:30:00','456 Đường Lê Lợi', 'EWALLET', 60000.00, 9000.00, 30000.00, 99000.00, false); -- ID 8

-- (PREPARING - Hôm nay -> Status Chart + Đơn Active 1 của C1)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'PREPARING', '2025-11-13 13:00:00', '2025-11-13 13:30:00','123 Đường Nguyễn Văn Cừ', 'COD', 260000.00, 39000.00, 30000.00, 329000.00, false); -- ID 9

-- (RECEIVED - Hôm nay -> Status Chart + Đơn Active 1 của C2)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'RECEIVED', '2025-11-13 14:00:00', '2025-11-13 14:30:00','456 Đường Lê Lợi', 'CARD', 45000.00, 6750.00, 30000.00, 81750.00, false); -- ID 10

-- (PENDING_CONFIRMATION - Hôm nay -> Status Chart + Đơn Active 2 của C1)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'PENDING_CONFIRMATION', '2025-11-13 15:00:00', '2025-11-13 15:30:00','123 Đường Nguyễn Văn Cừ', 'EWALLET', 130000.00, 19500.00, 30000.00, 179500.00, false); -- ID 11

-- (COMPLETED - Hôm nay -> Thêm doanh thu cho hôm nay)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (3, 'COMPLETED', '2025-11-13 16:00:00', '2025-11-13 16:30:00','789 Đường Võ Văn Tần', 'CARD', 165000.00, 24750.00, 30000.00, 219750.00, false); -- ID 12


-- ==================================
-- 6. THÊM CHI TIẾT ĐƠN HÀNG (ORDER ITEMS)
-- (Khớp với các đơn hàng và tạo Top Items)
-- ==================================
INSERT INTO order_items (order_id, menu_item_id, quantity, note, price_per_unit, selected_options_text)
VALUES
    -- Đơn 1 (COMPLETED): 2 Phở
    (1, 1, 2, NULL, 65000.00, 'Tô nhỏ (Mặc định)'),
    -- Đơn 2 (COMPLETED): 1 Đậu hũ
    (2, 5, 1, 'Thêm cơm', 45000.00, NULL),
    -- Đơn 3 (COMPLETED): 5 Combo (Bán chạy)
    (3, 8, 5, NULL, 65000.00, 'Coca-Cola (Mặc định)'),
    -- Đơn 4 (COMPLETED): 3 Phở, 2 Nem
    (4, 1, 3, 'Không hành', 65000.00, 'Tô nhỏ (Mặc định)'),
    (4, 6, 2, NULL, 30000.00, NULL),
    -- Đơn 5 (COMPLETED): 2 Bún chả (Sẽ có review mới)
    (5, 2, 2, NULL, 55000.00, NULL),
    -- Đơn 6 (CANCELLED): 1 Bún chả
    (6, 2, 1, NULL, 55000.00, NULL),
    -- Đơn 7 (DELIVERING): 1 Phở (options)
    (7, 1, 1, 'Tô lớn, thêm trứng', 85000.00, 'Tô lớn (+15k), Thêm trứng (+5k)'),
    -- Đơn 8 (READY): 1 Bún Bò Huế (Hết hàng)
    (8, 3, 1, 'Ít cay', 60000.00, NULL),
    -- Đơn 9 (PREPARING): 4 Combo
    (9, 8, 4, '1 combo không cay', 65000.00, 'Coca-Cola (Mặc định)'),
    -- Đơn 10 (RECEIVED): 1 Đậu hũ
    (10, 5, 1, NULL, 45000.00, NULL),
    -- Đơn 11 (PENDING): 2 Phở
    (11, 1, 2, NULL, 65000.00, 'Tô nhỏ (Mặc định)'),
    -- Đơn 12 (COMPLETED): 3 Bún chả
    (12, 2, 3, 'Nhiều bún', 55000.00, NULL);

-- ==================================
-- 7. THÊM ĐÁNH GIÁ MẪU (REVIEWS)
-- ==================================
INSERT INTO reviews (menu_item_id, customer_id, rating, comment, order_id, review_time)
VALUES
    -- Đánh giá cũ
    (1, 1, 5, 'Phở ngon', 1, '2025-11-06 11:00:00'),
    (5, 2, 4, 'Đậu hũ ok', 2, '2025-11-08 12:00:00'),
    (8, 3, 5, 'Combo rất lợi', 3, '2025-11-09 13:00:00'),
    (1, 1, 4, 'Vẫn ngon như mọi khi', 4, '2025-11-11 15:00:00'),

    -- ĐÁNH GIÁ MỚI (Trigger Thông báo)
    -- Cho Đơn 5 (của C2), đánh giá vào hôm nay 2025-11-13
    (2, 2, 5, 'Bún chả lần này rất ngon, thịt nướng thơm!', 5, '2025-11-13 10:30:00');