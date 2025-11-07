# Đặc tả Yêu cầu Hệ thống GourmetGo

Tài liệu này tổng hợp các Yêu cầu Chức năng (Functional Requirements) và Yêu cầu Phi chức năng (Non-Functional Requirements) cho hệ thống đặt hàng GourmetGo, dựa trên phỏng vấn các bên liên quan.

---

# I. Yêu cầu Chức năng (Functional Requirements)

Đây là những gì hệ thống *phải làm*, được phân loại theo các phân hệ (Module) chính.

## 1. Phân hệ Tích hợp Hệ thống (System Integrations)

Giải quyết vấn đề "nhập liệu 2 lần" (double entry) và đồng bộ dữ liệu.

* **FR1 (Quan trọng nhất):** Hệ thống phải tích hợp **đồng bộ 2 chiều (2-way sync)** qua API với phần mềm POS hiện tại (iPOS).
* **FR2:** Khi có đơn hàng mới từ Website/App "GourmetGo", đơn hàng đó phải được **tự động đẩy** vào hệ thống iPOS tại chi nhánh tương ứng.
* **FR3:** Khi Quản trị viên thay đổi (thêm/sửa/xóa) menu trên hệ thống trung tâm, thay đổi đó phải được **tự động đồng bộ** xuống iPOS.
* **FR4:** Khi một món hàng bị "Tắt" (hết hàng) trên iPOS tại chi nhánh, trạng thái đó phải được **tự động đồng bộ ngược** lên Website/App "GourmetGo" (và ngược lại).
* **FR5:** Hệ thống phải tích hợp với các kênh bán hàng thứ ba (GrabFood, ShopeeFood) để **tự động lấy đơn hàng** và đẩy vào iPOS, loại bỏ hoàn toàn việc thu ngân nhập tay.
* **FR6:** Hệ thống phải tích hợp với các **cổng thanh toán** trực tuyến, bao gồm:
    * Ví điện tử (MoMo, ZaloPay).
    * Thẻ tín dụng (Visa/Mastercard).
    * Quét mã QR Ngân hàng.

## 2. Phân hệ Vận hành Cửa hàng & Bếp (Store & Kitchen Operations)

Giải quyết sự hỗn loạn tại quầy và bếp.

* **FR7:** Hệ thống phải cung cấp **Màn hình Hiển thị Bếp (Kitchen Display System - KDS)** thay thế cho máy in phiếu giấy.
* **FR8:** KDS phải hiển thị danh sách các đơn hàng đang chờ xử lý theo thứ tự thời gian, trạng thái (Mới, Đang làm, Hoàn thành).
* **FR9:** KDS phải hiển thị **rõ ràng, nổi bật** các yêu cầu tùy chỉnh đặc biệt (ví dụ: "KHÔNG CAY", "THÊM TRỨNG").
* **FR10:** Khi bếp hoàn thành một món (hoặc cả đơn), phải có thao tác (ví dụ: bấm nút) để cập nhật trạng thái trên KDS và thông báo cho quầy ra đồ.

## 3. Phân hệ Quản lý Menu & Tồn kho (Menu & Inventory)

Giải quyết vấn đề quản lý tập trung và kiểm soát thất thoát.

* **FR11:** Quản trị viên (Admin) phải có thể "Tắt/Mở" một món ăn trên hệ thống trung tâm.
* **FR12:** Thao tác "Tắt" món phải **đồng bộ trạng thái "Hết hàng"** trên tất cả các kênh bán đã tích hợp (Website/App, iPOS, Grab, ShopeeFood) chỉ bằng một cú nhấp chuột.
* **FR13:** Hệ thống phải cho phép thiết lập các **Bảng giá (Price Lists) khác nhau** và áp dụng cho từng chi nhánh cụ thể (ví dụ: giá Quận 1 khác giá Gò Vấp).
* **FR14:** Hệ thống phải hỗ trợ quản lý **tồn kho theo nguyên vật liệu (Ingredient-level)**, cho phép định lượng và tự động trừ kho (ví dụ: bán 1 Cơm Gà Xối Mỡ, tự động trừ 150g Gà, 200g Cơm).

## 4. Phân hệ Giao diện Khách hàng (Customer-Facing Portal - Web/App)

Đáp ứng kỳ vọng của khách hàng khi đặt hàng.

* **FR15:** Hệ thống phải cho phép khách hàng xem menu với **hình ảnh thật, hấp dẫn** và **mô tả chi tiết** (thành phần, món ăn kèm...).
* **FR16:** Trang chủ phải hiển thị nổi bật **Banner Khuyến mãi/Combo** và danh sách **Món bán chạy nhất (Best-Sellers)**.
* **FR17:** Hệ thống phải có tính năng **"Đặt lại đơn hàng cũ" (Re-order)** chỉ với vài cú nhấp chuột.
* **FR18:** Hệ thống phải cung cấp tính năng **Theo dõi trạng thái đơn hàng** chi tiết cho khách hàng (Đã xác nhận -> Đang chuẩn bị -> Đang giao hàng -> Đã giao thành công).
* **FR19:** Khách hàng phải có thể chọn các hình thức thanh toán: **COD (Thu tiền khi nhận hàng)** và các hình thức Online (đã nêu ở FR6).

## 5. Phân hệ Tùy chỉnh Món ăn (Order Customization)

Đây là yêu cầu "bắt buộc" từ khách hàng để giảm sai sót.

* **FR20:** Hệ thống phải cho phép cấu hình các tùy chỉnh (customization) **dưới dạng nút chọn (Radio/Checkbox)** thay vì ô "Ghi chú" chung.
* **FR21:** Các tùy chỉnh phải được phân loại rõ ràng:
    * Tùy chọn miễn phí (ví dụ: Mức đường/đá: [100%], [70%], [Không đá]).
    * Tùy chọn tính phí (ví dụ: Topping: [+ Thêm Trứng Ốp La (10k)]).
* **FR22:** Khi khách hàng chọn một tùy chọn có tính phí, **giá tiền trong giỏ hàng phải được cập nhật ngay lập tức**.

## 6. Phân hệ Khuyến mãi & Khách hàng thân thiết (Promotion & Loyalty)

Vũ khí chính để kéo khách hàng về app "nhà".

* **FR23 (Promotion Engine):** Cung cấp giao diện cho bộ phận Marketing **tự thiết lập các chương trình khuyến mãi** (không cần IT).
* **FR24:** "Cỗ máy khuyến mãi" phải hỗ trợ các loại phức tạp:
    * Giảm % (20%), Giảm tiền cố định (30k cho đơn từ 150k).
    * Mua 1 Tặng 1 (BOGO), Tặng kèm món.
    * Điều kiện: Theo thời gian (Giờ vàng), theo Chi nhánh (Khai trương Q7), theo Hạng khách hàng (Voucher cho hạng Vàng), theo người dùng mới (WELCOME50), theo vận chuyển (Freeship từ 200k).
* **FR25 (Loyalty Program):** Hệ thống phải **tự động tích điểm** cho khách hàng dựa trên chi tiêu (ví dụ: 10.000đ = 1 điểm).
* **FR26:** Hệ thống phải **tự động phân hạng** khách hàng (Member, Silver, Gold, Diamond) khi đạt mốc điểm và tự động áp dụng quyền lợi (ví dụ: giảm giá cố định 10% cho hạng Diamond).
* **FR27:** Khách hàng phải có thể **tích điểm và tiêu điểm tại quầy POS** (ví dụ: bằng cách đọc Số điện thoại cho thu ngân).

## 7. Phân hệ Báo cáo & Phân tích (Reporting & Analytics)

Cung cấp dữ liệu cho Ban Lãnh đạo ra quyết định.

* **FR28:** Cung cấp **"CEO Dashboard" (truy cập được trên di động)** hiển thị các chỉ số kinh doanh.
* **FR29:** Báo cáo **thời gian thực (Real-time)**: Tổng doanh thu (theo giờ), Doanh thu theo Chi nhánh, Doanh thu theo Kênh bán hàng (Tại chỗ, App "Nhà", Grab, ShopeeFood).
* **FR30:** Báo cáo **chiến lược (hàng tuần/tháng)**: Món bán chạy/chậm, Số lượng khách hàng mới, Tỷ lệ khách hàng quay lại, Giá trị đơn hàng trung bình (AOV), Tổng chi phí hoa hồng đã trả cho bên thứ ba.

## 8. Phân hệ Hỗ trợ & Giao vận (Support & Delivery)

Cải thiện trải nghiệm sau đặt hàng.

* **FR31:** Cung cấp tính năng **Chat hỗ trợ trực tiếp trên App** ngay tại màn hình "Chi tiết đơn hàng".
* **FR32:** Khi khách hàng chat, nhân viên hỗ trợ phải **thấy ngay thông tin đơn hàng** mà khách đang khiếu nại mà không cần hỏi lại.
* **FR33:** Cung cấp giao diện cho Quản lý chi nhánh để **điều phối đội giao hàng riêng** (thay vì dùng Zalo/Messenger thủ công).

---

# II. Yêu cầu Phi chức năng (Non-Functional Requirements)

Đây là các yêu cầu về *chất lượng* của hệ thống, hay còn gọi là hệ thống phải *như thế nào*.

## 1. Hiệu năng (Performance)

* **NFR1 (Critical):** Hệ thống phải đảm bảo hoạt động ổn định, **phản hồi nhanh trong giờ cao điểm (11h-13h)** khi lượng đơn hàng (từ mọi kênh) dồn về cùng lúc.
* **NFR2:** Thao tác "Tắt món" hết hàng phải được **đồng bộ trên tất cả các kênh bán** trong vòng tối đa **1 phút** để tránh khách đặt nhầm.
* **NFR3:** Giá tiền trong giỏ hàng (trên app khách hàng) phải được **cập nhật ngay lập tức (dưới 1 giây)** sau khi khách chọn/bỏ một topping có tính phí.
* **NFR4:** Dashboard của CEO phải tải dữ liệu (gần) thời gian thực với độ trễ không quá [X] giây (cần định nghĩa X).

## 2. Tính Ổn định & Sẵn sàng (Reliability & Availability)

* **NFR5:** Kết nối API giữa hệ thống và iPOS phải **bền bỉ**, có cơ chế **thử lại (retry)** tự động nếu việc đẩy đơn hàng/đồng bộ trạng thái thất bại trong lần đầu tiên.
* **NFR6:** Hệ thống KDS phải có **độ tin cậy cực cao (ví dụ: uptime 99.99%)** vì nó thay thế hoàn toàn quy trình in giấy cốt lõi của bếp.

## 3. Tính Dễ sử dụng (Usability)

* **NFR7:** Giao diện "Cỗ máy Khuyến mãi" (Promotion Engine) phải **trực quan, đủ đơn giản** để bộ phận Marketing có thể tự thao tác mà không cần hỗ trợ kỹ thuật.
* **NFR8:** Giao diện KDS tại bếp phải có font chữ to, rõ ràng, tương phản cao, dễ đọc trong môi trường bếp nóng, ồn ào và nhiều dầu mỡ.
* **NFR9:** Luồng đặt hàng của khách hàng (đặc biệt là bước chọn Tùy chỉnh) phải rõ ràng, mượt mà, tránh gây nhầm lẫn.

## 4. Khả năng Tích hợp (Integration)

* **NFR10:** Hệ thống *phải* được xây dựng trên kiến trúc API-first để đảm bảo khả năng tích hợp linh hoạt với iPOS và các bên thứ ba (Grab, MoMo, ZaloPay...) hiện tại và trong tương lai.

## 5. Tính Bảo mật (Security)

* **NFR11:** Toàn bộ dữ liệu khách hàng (thông tin cá nhân, lịch sử đặt hàng, số điện thoại) phải được **mã hóa và bảo mật** theo quy định.
* **NFR12:** Các giao dịch thanh toán qua thẻ/ví phải tuân thủ các tiêu chuẩn bảo mật (ví dụ: PCI DSS nếu có lưu trữ thông tin thẻ).

## 6. Khả năng Mở rộng (Scalability)

* **NFR13:** Kiến trúc hệ thống phải cho phép **dễ dàng thêm mới các chi nhánh** (ví dụ: từ 15 lên 50 chi nhánh) mà không ảnh hưởng đến hiệu năng.
* **NFR14:** Hệ thống phải có khả năng mở rộng để xử lý lượng truy cập và đơn hàng tăng đột biến trong các chiến dịch khuyến mãi lớn.