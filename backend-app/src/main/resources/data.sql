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
-- --- CẬP NHẬT: URL HÌNH ẢNH MỚI (TỪ WIKIMEDIA) ---
-- ==================================
INSERT INTO menu_items (name, description, price, vegetarian, spicy, popular, category, status, image_url)
VALUES
    -- ID 1 (Có Tùy chọn)
    ('Phở Bò Tái', 'Phở bò truyền thống với thịt bò tái mềm', 65000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', 'https://img-global.cpcdn.com/recipes/fdfe66b5480915c5/680x781cq80/beef-pho-ph%E1%BB%9F-bo-tai-recipe-main-photo.jpg'),
    -- ID 2
    ('Bún Chả Hà Nội', 'Bún chả nướng than hoa, kèm rau sống', 55000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_1_13_638407567967930759_tong-hop-cac-cach-an-bun-cha-ha-noi-chuan-4.png'),
    -- ID 3 (Hết hàng)
    ('Bún Bò Huế (Cay)', 'Bún bò vị Huế đặc trưng, cay nồng', 60000.00, false, true, true, 'MAIN_COURSE', 'TEMP_OUT_OF_STOCK', 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Bun_bo_hue.JPG'),
    -- ID 4 (Ngừng bán) - Dùng ảnh cơm gà Hải Nam
    ('Cơm Gà Xối Mỡ', 'Cơm chiên với gà giòn xối mỡ tỏi', 50000.00, false, false, true, 'MAIN_COURSE', 'DISCONTINUED', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hainanese_Chicken_Rice_in_Singapore.jpg/1280px-Hainanese_Chicken_Rice_in_Singapore.jpg'),
    -- ID 5 (Món chay) - Dùng ảnh đậu hũ nhồi thịt (tương tự)
    ('Đậu Hũ Sốt Cà Chua', 'Đậu hũ non sốt cà chua, ăn kèm cơm trắng', 45000.00, true, false, false, 'MAIN_COURSE', 'ON_SALE', 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Pork_stuffed_fried_tofu%2C_with_tomato_and_onion.jpg'),
    -- ID 6 (Khai vị)
    ('Nem Chay (Khai vị)', 'Nem cuốn chay kèm rau thơm và sốt tương', 30000.00, true, false, false, 'APPETIZER', 'ON_SALE', 'https://upload.wikimedia.org/wikipedia/commons/2/22/VegetableSpringRolls.JPG'),
    -- ID 7 (Đồ uống)
    ('Coca-Cola', 'Coca-Cola lon 330ml', 15000.00, true, false, true, 'BEVERAGE', 'ON_SALE', 'https://leteemartdalat.vn/static/images/san-pham/thuc-pham/Nước%20uống/3/Nước%20Ngọt%20Cocacola%20350ml.jpg'),
    -- ID 8 (Combo) - Dùng lại ảnh Bún Chả
    ('Combo Bún Chả', '1 Bún Chả + 1 Nước ngọt. Tiết kiệm 5k', 65000.00, false, false, true, 'COMBO', 'ON_SALE', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bun-cha-hanoi.jpg/1280px-Bun-cha-hanoi.jpg');


-- ==================================
-- 3. THÊM TÙY CHỌN MÓN ĂN (OPTIONS)
-- ==================================
-- (Giữ nguyên)
INSERT INTO option_groups (name, menu_item_id, selection_type) VALUES
                                                                   ('Chọn Size (Phở)', 1, 'SINGLE_REQUIRED'),
                                                                   ('Chọn Topping (Phở)', 1, 'MULTI_SELECT'),
                                                                   ('Chọn Nước Ngọt (Combo)', 8, 'SINGLE_REQUIRED');

INSERT INTO option_items (name, price, option_group_id, linked_menu_item_id) VALUES
                                                                                 ('Tô nhỏ (Mặc định)', 0, 1, NULL),
                                                                                 ('Tô lớn (+15k)', 15000, 1, NULL),
                                                                                 ('Thêm trứng (+5k)', 5000, 2, NULL),
                                                                                 ('Thêm quẩy (+5k)', 5000, 2, NULL),
                                                                                 ('Coca-Cola (Mặc định)', 0, 3, 7),
                                                                                 ('Bún Chả (Test Link)', 0, 3, 2);

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
-- ==================================
-- (Giữ nguyên)
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'COMPLETED', '2025-11-06 10:00:00', '2025-11-06 10:30:00','123 Đường Nguyễn Văn Cừ', 'COD', 130000.00, 19500.00, 30000.00, 179500.00, true); -- ID 1
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'COMPLETED', '2025-11-08 11:00:00', '2025-11-08 11:30:00','456 Đường Lê Lợi', 'CARD', 45000.00, 6750.00, 30000.00, 81750.00, true); -- ID 2
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (3, 'COMPLETED', '2025-11-09 12:00:00', '2025-11-09 12:30:00','789 Đường Võ Văn Tần', 'EWALLET', 325000.00, 48750.00, 30000.00, 403750.00, true); -- ID 3
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed, voucher_code, discount_amount)
VALUES (1, 'COMPLETED', '2025-11-11 14:00:00', '2025-11-11 14:30:00','123 Đường Nguyễn Văn Cừ', 'COD', 255000.00, 38250.00, 30000.00, 293250.00, true, 'GIAM30K', 30000.00); -- ID 4
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'COMPLETED', '2025-11-12 18:00:00', '2025-11-12 18:30:00','456 Đường Lê Lợi', 'CARD', 110000.00, 16500.00, 30000.00, 156500.00, false); -- ID 5
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed, cancellation_reason)
VALUES (3, 'CANCELLED', '2025-11-13 10:00:00', '2025-11-13 10:30:00','789 Đường Võ Văn Tần', 'COD', 55000.00, 8250.00, 30000.00, 93250.00, false, 'Khách bom hàng'); -- ID 6
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'DELIVERING', '2025-11-13 11:00:00', '2025-11-13 11:30:00','123 Đường Nguyễn Văn Cừ', 'CARD', 85000.00, 12750.00, 30000.00, 127750.00, false); -- ID 7
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'READY', '2025-11-13 12:00:00', '2025-11-13 12:30:00','456 Đường Lê Lợi', 'EWALLET', 60000.00, 9000.00, 30000.00, 99000.00, false); -- ID 8
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'PREPARING', '2025-11-13 13:00:00', '2025-11-13 13:30:00','123 Đường Nguyễn Văn Cừ', 'COD', 260000.00, 39000.00, 30000.00, 329000.00, false); -- ID 9
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (2, 'RECEIVED', '2025-11-13 14:00:00', '2025-11-13 14:30:00','456 Đường Lê Lợi', 'CARD', 45000.00, 6750.00, 30000.00, 81750.00, false); -- ID 10
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (1, 'PENDING_CONFIRMATION', '2025-11-13 15:00:00', '2025-11-13 15:30:00','123 Đường Nguyễn Văn Cừ', 'EWALLET', 130000.00, 19500.00, 30000.00, 179500.00, false); -- ID 11
INSERT INTO orders (customer_id, status, order_time, pickup_window, delivery_address, payment_method, subtotal, vat_amount, shipping_fee, grand_total, is_reviewed)
VALUES (3, 'COMPLETED', '2025-11-13 16:00:00', '2025-11-13 16:30:00','789 Đường Võ Văn Tần', 'CARD', 165000.00, 24750.00, 30000.00, 219750.00, false); -- ID 12


-- ==================================
-- 6. THÊM CHI TIẾT ĐƠN HÀNG (ORDER ITEMS)
-- ==================================
-- (Giữ nguyên)
INSERT INTO order_items (order_id, menu_item_id, quantity, note, price_per_unit, selected_options_text)
VALUES
    (1, 1, 2, NULL, 65000.00, 'Tô nhỏ (Mặc định)'),
    (2, 5, 1, 'Thêm cơm', 45000.00, NULL),
    (3, 8, 5, NULL, 65000.00, 'Coca-Cola (Mặc định)'),
    (4, 1, 3, 'Không hành', 65000.00, 'Tô nhỏ (Mặc định)'),
    (4, 6, 2, NULL, 30000.00, NULL),
    (5, 2, 2, NULL, 55000.00, NULL),
    (6, 2, 1, NULL, 55000.00, NULL),
    (7, 1, 1, 'Tô lớn, thêm trứng', 85000.00, 'Tô lớn (+15k), 1 x Thêm trứng (+5k)'),
    (8, 3, 1, 'Ít cay', 60000.00, NULL),
    (9, 8, 4, '1 combo không cay', 65000.00, 'Coca-Cola (Mặc định)'),
    (10, 5, 1, NULL, 45000.00, NULL),
    (11, 1, 2, NULL, 65000.00, 'Tô nhỏ (Mặc định)'),
    (12, 2, 3, 'Nhiều bún', 55000.00, NULL);

-- ==================================
-- 7. THÊM ĐÁNH GIÁ MẪU (REVIEWS)
-- ==================================
-- (Giữ nguyên)
INSERT INTO reviews (menu_item_id, customer_id, rating, comment, order_id, review_time)
VALUES
    (1, 1, 5, 'Phở ngon', 1, '2025-11-06 11:00:00'),
    (5, 2, 4, 'Đậu hũ ok', 2, '2025-11-08 12:00:00'),
    (8, 3, 5, 'Combo rất lợi', 3, '2025-11-09 13:00:00'),
    (1, 1, 4, 'Vẫn ngon như mọi khi', 4, '2025-11-11 15:00:00'),
    (2, 2, 5, 'Bún chả lần này rất ngon, thịt nướng thơm!', 5, '2025-11-13 10:30:00');