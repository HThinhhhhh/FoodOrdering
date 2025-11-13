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
                                                     ('kitchen_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'KITCHEN'),   -- ID 1 (Chỉ thấy KDS)
                                                     ('employee_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'EMPLOYEE'), -- ID 2 (Chỉ thấy QL Đơn hàng)
                                                     ('admin_user', '$2a$12$bcWVWBqiHrwI7LPiH9rMBeWl3xqLc50FK51RxSd2ovmMd33Kz.A3m', 'ADMIN');       -- ID 3 (Thấy tất cả)


-- ==================================
-- 2. THÊM THỰC ĐƠN (MENU ITEMS)
-- ==================================
-- Thêm các cột mới: category, status, image_url
INSERT INTO menu_items (name, description, price, is_vegetarian, is_spicy, is_popular, category, status, image_url)
VALUES
    -- ID 1 (Có Tùy chọn)
    ('Phở Bò Tái', 'Phở bò truyền thống với thịt bò tái mềm', 65000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null),
    -- ID 2 (Bình thường)
    ('Bún Chả Hà Nội', 'Bún chả nướng than hoa, kèm rau sống', 55000.00, false, false, true, 'MAIN_COURSE', 'ON_SALE', null),
    -- ID 3 (Hết hàng)
    ('Bún Bò Huế (Cay)', 'Bún bò vị Huế đặc trưng, cay nồng', 60000.00, false, true, true, 'MAIN_COURSE', 'TEMP_OUT_OF_STOCK', null),
    -- ID 4 (Ngừng bán)
    ('Cơm Gà Xối Mỡ', 'Cơm chiên với gà giòn xối mỡ tỏi', 50000.00, false, false, true, 'MAIN_COURSE', 'DISCONTINUED', null),
    -- ID 5 (Món chay)
    ('Đậu Hũ Sốt Cà Chua', 'Đậu hũ non sốt cà chua, ăn kèm cơm trắng', 45000.00, true, false, false, 'MAIN_COURSE', 'ON_SALE', null),
    -- ID 6 (Khai vị)
    ('Nem Chay (Khai vị)', 'Nem cuốn chay kèm rau thơm và sốt tương', 30000.00, true, false, false, 'APPETIZER', 'ON_SALE', null);

-- ==================================
-- 3. THÊM TÙY CHỌN MÓN ĂN (OPTIONS)
-- ==================================
-- Thêm 2 nhóm Tùy chọn cho "Phở Bò Tái" (menu_item_id = 1)
INSERT INTO option_groups (name, menu_item_id) VALUES
                                                   ('Chọn Size', 1),   -- Option Group ID 1
                                                   ('Chọn Topping', 1); -- Option Group ID 2

-- Thêm các mục Tùy chọn cho 2 nhóm trên
INSERT INTO option_items (name, price, option_group_id) VALUES
                                                            -- Tùy chọn cho "Chọn Size" (Group 1)
                                                            ('Tô nhỏ (Mặc định)', 0, 1), -- Option Item ID 1
                                                            ('Tô lớn (+15k)', 15000, 1), -- Option Item ID 2

                                                            -- Tùy chọn cho "Topping" (Group 2)
                                                            ('Thêm trứng (+5k)', 5000, 2), -- Option Item ID 3
                                                            ('Thêm quẩy (+5k)', 5000, 2); -- Option Item ID 4

-- ==================================
-- 4. THÊM MÃ GIẢM GIÁ (VOUCHERS)
-- ==================================
INSERT INTO vouchers (code, description, discount_type, discount_value, max_discount_amount, minimum_spend, usage_limit, current_usage, start_date, end_date, is_active)
VALUES
    -- ID 1: Giảm 30k (Fixed)
    ('GIAM30K', 'Giảm 30k cho đơn từ 150k', 'FIXED_AMOUNT', 30000, NULL, 150000, 100, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', true),
    -- ID 2: Giảm 50% (Percentage)
    ('GIAM50', 'Giảm 50% tối đa 20k', 'PERCENTAGE', 50, 20000, NULL, 50, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', true),
    -- ID 3: Hết hạn
    ('HETHAN', 'Voucher đã hết hạn', 'FIXED_AMOUNT', 10000, NULL, NULL, 10, 0, '2024-01-01 00:00:00', '2024-12-31 23:59:59', false);

-- ==================================
-- 5. THÊM ĐƠN HÀNG (ORDERS)
-- ==================================
-- Thêm các cột mới: kitchen_note, delivery_note, employee_note, voucher_code, discount_amount
INSERT INTO orders (customer_id, status, order_time, pickup_window,
                    delivery_address, shipper_note, payment_method,
                    subtotal, vat_amount, shipping_fee, grand_total,
                    is_reviewed,
                    kitchen_note, delivery_note, employee_note,
                    voucher_code, discount_amount)
VALUES
    -- ID 1 (Pending - Để test Xác nhận/Sửa)
    (1, 'PENDING_CONFIRMATION', '2025-11-13 01:00:00', '2025-11-13 01:30:00',
     '123 Đường Nguyễn Văn Cừ, P. Cầu Ông Lãnh, Quận 1, TPHCM', 'Giao nhanh nhé', 'COD',
     65000.00, 9750.00, 30000.00, 104750.00, false,
     NULL, NULL, NULL, NULL, 0),

    -- ID 2 (Received - Để test Bếp)
    (1, 'RECEIVED', '2025-11-13 00:30:00', '2025-11-13 01:00:00',
     '456 Đường Lê Lợi, P. Bến Nghé, Quận 1, TPHCM', NULL, 'CARD',
     55000.00, 8250.00, 30000.00, 93250.00, false,
     NULL, NULL, '[admin_user]: Đã xác nhận', NULL, 0),

    -- ID 3 (Preparing - Để test Bếp)
    (1, 'PREPARING', '2025-11-13 00:00:00', '2025-11-13 00:30:00',
     '789 Đường Võ Văn Tần, P. 6, Quận 3, TPHCM', 'Ít cay', 'EWALLET',
     120000.00, 18000.00, 30000.00, 168000.00, false,
     'Khách dặn ít cay', NULL, '[admin_user]: Đã xác nhận', NULL, 0),

    -- ID 4 (Ready - Để test Giao hàng)
    (1, 'READY', '2025-11-12 23:30:00', '2025-11-13 00:00:00',
     '111 Đường Hai Bà Trưng, P. Đa Kao, Quận 1, TPHCM', NULL, 'COD',
     45000.00, 6750.00, 30000.00, 81750.00, false,
     'OK', NULL, '[admin_user]: Đã xác nhận', NULL, 0),

    -- ID 5 (Delivering - Để test Hoàn thành)
    (1, 'DELIVERING', '2025-11-12 23:00:00', '2025-11-12 23:30:00',
     '222 Đường CMT8, P. 10, Quận 3, TPHCM', 'Giao ngoài giờ', 'CARD',
     65000.00, 9750.00, 30000.00, 104750.00, false,
     NULL, 'Shipper Tuấn 090... đang giao', '[admin_user]: Đã xác nhận', NULL, 0),

    -- ID 6 (Completed - Để test Báo cáo 1 + Voucher)
    (1, 'COMPLETED', '2025-11-12 12:00:00', '2025-11-12 12:30:00',
     '333 Đường 3/2, P. 11, Quận 10, TPHCM', NULL, 'COD',
     150000.00, 22500.00, 30000.00, 172500.00, false, -- 150+22.5+30 - 30 (voucher)
     'Làm nhanh', 'Giao thành công', '[admin_user]: Đã xác nhận',
     'GIAM30K', 30000.00), -- Áp dụng voucher

    -- ID 7 (Cancelled - Để test)
    (1, 'CANCELLED', '2025-11-12 11:00:00', '2025-11-12 11:30:00',
     '444 Đường Sư Vạn Hạnh, P. 12, Quận 10, TPHCM', 'Gọi trước 10p', 'COD',
     55000.00, 8250.00, 30000.00, 93250.00, false,
     NULL, NULL, '[admin_user]: Khách gọi hủy', NULL, 0),

    -- ID 8 (Completed - Để test Báo cáo 2)
    (1, 'COMPLETED', '2025-11-11 11:30:00', '2025-11-11 12:00:00',
     '123 Đường Nguyễn Văn Cừ, P. Cầu Ông Lãnh, Quận 1, TPHCM', NULL, 'CARD',
     55000.00, 8250.00, 30000.00, 93250.00, false,
     NULL, 'Giao thành công', '[admin_user]: Đã xác nhận', NULL, 0);


-- ==================================
-- 6. THÊM CHI TIẾT ĐƠN HÀNG (ORDER ITEMS)
-- ==================================
INSERT INTO order_items (order_id, menu_item_id, quantity, note)
VALUES
    -- Đơn 1 (Pending): Phở
    (1, 1, 1, 'Không hành'),
    -- Đơn 2 (Received): Bún Chả
    (2, 2, 1, NULL),
    -- Đơn 3 (Preparing): 2 món
    (3, 2, 1, 'Nhiều bún'),
    (3, 3, 1, NULL), -- Món 3 Bún Bò (TEMP_OUT_OF_STOCK) -> Đơn này lẽ ra bị lỗi, nhưng ta giả định lúc đặt vẫn ON_SALE
    -- Đơn 4 (Ready): Đậu hũ
    (4, 5, 1, NULL),
    -- Đơn 5 (Delivering): Phở
    (5, 1, 1, 'Tô lớn, thêm trứng'), -- (Note thủ công, Giai đoạn 3 sẽ sửa)
    -- Đơn 6 (Completed): 2 món
    (6, 1, 1, NULL),
    (6, 2, 1, 'Không rau'),
    (6, 6, 1, NULL),
    -- Đơn 7 (Cancelled): Bún chả
    (7, 2, 1, NULL),
    -- Đơn 8 (Completed): Bún chả
    (8, 2, 1, NULL);

-- ==================================
-- 7. THÊM ĐÁNH GIÁ MẪU (REVIEWS)
-- ==================================
INSERT INTO reviews (menu_item_id, customer_id, rating, comment, order_id)
VALUES
    -- Đánh giá cho Đơn hàng 6 (Sau khi sửa logic `isReviewed`)
    (1, 1, 5, 'Phở ngon', 6),
    (2, 1, 4, 'Bún chả ok', 6);