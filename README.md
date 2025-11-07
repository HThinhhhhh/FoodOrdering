# 🚀 MVP Ứng dụng Đặt đồ ăn (GourmetGo)
Dự án này là một sản phẩm khả thi tối thiểu (MVP) cho một hệ thống đặt đồ ăn nhà hàng, được xây dựng với kiến trúc hiện đại, tập trung vào hiệu suất và trải nghiệm real-time.

Hệ thống sử dụng **Redis Queue** để xử lý đơn hàng bất đồng bộ, đảm bảo hệ thống không bị quá tải khi có lượng truy cập cao. **WebSocket** được sử dụng để giao tiếp hai chiều, cho phép màn hình bếp (KDS) nhận đơn hàng mới ngay lập tức và khách hàng có thể theo dõi trạng thái đơn hàng của họ trong thời gian thực.

## ✨ Tính năng chính
+ **Backend (Spring Boot)**:
    + API RESTful để quản lý Thực đơn, Đánh giá, và Đơn hàng.
    + **Redis Caching**: Tăng tốc độ phản hồi API thực đơn (`/api/menu`).
    + **Redis Queue**: Xử lý đơn hàng bất đồng bộ, giảm tải cho CSDL.
    + **WebSocket (STOMP)**:
        + Thông báo real-time cho nhà bếp khi có đơn hàng mới (`/topic/kitchen`).
        + Thông báo real-time cho khách hàng khi trạng thái đơn hàng thay đổi (`/topic/order-status/{id}`).
    + **Rate Limiting**: Hạn chế tần suất gọi API đặt hàng.
    + **Hỗ trợ** `data.sql`: Tự động "gieo" (seed) dữ liệu món ăn khi khởi động.
+ **Frontend (React)**:
    + **Luồng Khách hàng (Diner)**: Xem thực đơn, lọc món (chay, cay), thêm vào giỏ hàng, thanh toán, và theo dõi trạng thái đơn hàng real-time.
    + **Luồng Nhà bếp (KDS)**: Màn hình hiển thị bếp (KDS) nhận đơn hàng mới real-time, chia cột (Đã nhận, Đang chuẩn bị, Sẵn sàng), và cho phép nhân viên bếp cập nhật trạng thái đơn hàng.
    + **Quản lý State**: Sử dụng React Context API cho giỏ hàng.

## 🛠️ Công nghệ sử dụng
|Lĩnh vực|Công nghệ|
|:-------|:--------|
|**Backend**|Java 17, Spring Boot 3+, Spring Data JPA, Spring WebSocket, Spring Cache|
|**Frontend**|React 18, React Hooks, React Router, Context API, Axios|
|**CSDL**|PostgreSQL
|**Caching / Queue**|Redis|
|**Real-time**|WebSocket (với STOMP)|
|**Build Tool**|Apache Maven (Backend), NPM (Frontend)|
|**Testing**|JUnit 5, Mockito|
|**Môi trường**|Docker Desktop (khuyên dùng cho Redis)|

### 📡 Các API và Kênh WebSocket chính
**API Endpoints**
|Phương thức|Endpoint|Mô tả|
|:-------|:--------|:--------|
|`GET`|`/api/menu`|Lấy danh sách thực đơn. Hỗ trợ query params: `?is_vegetarian=true`, `?is_spicy=true`.|
|`POST`|`/api/payments/mock`|Giả lập cổng thanh toán, luôn trả về `{"status": "SUCCESS"}`.|
|`POST`|`/api/orders`|Nhận yêu cầu đơn hàng. Đẩy vào Redis Queue và trả về `202 ACCEPTED`.|

**Kênh WebSocket**
|Kênh|Hướng|Mô tả|
|:-------|:--------|:--------|
`/ws`|-|Endpoint chính để kết nối SockJS (do `WebSocketConfig` thiết lập).|
|`/topic/kitchen`|**Sub (Lắng nghe)**|KDS lắng nghe kênh này. `OrderBatchProcessor` gửi Đơn hàng (DTO) đã lưu vào đây.|
|`/app/kitchen/update-status`|**Pub (Gửi)**|(Chưa hoàn thiện) KDS sẽ gửi cập nhật trạng thái (PREPARING, READY) đến đây.|

## 📋 Yêu cầu hệ thống
Trước khi bắt đầu, cần cài đặt các công cụ sau:
1. **Java JDK 17** (hoặc mới hơn).
2. **Apache Maven** (đã thêm vào `PATH`).
3. **Node.js** và **NPM** (phiên bản LTS).
4. **Docker Desktop** (khuyên dùng) HOẶC cài đặt **Redis** và **PostgreSQL** thủ công.

## ⚙️ Cài đặt & Cấu hình
Dự án này bao gồm 2 phần: `backend-app` (Backend) và `frontend-app` (Frontend).

### 1. 🐘 PostgreSQL (Cơ sở dữ liệu)
Cần một CSDL PostgreSQL đang chạy.
+ **Tên CSDL (Database)**: ``food_ordering_app`` (hoặc tên bạn muốn)
    + **Username**: ``postgres``
    + **Password**: ``[mật khẩu superuser của bạn]``
    + **Port**: ``5432``

Ta có thể tạo CSDL này bằng **pgAdmin** (Chuột phải vào Databases -> Create -> Database...) hoặc bằng lệnh ``psql``:
```SQL
CREATE DATABASE food_ordering_app;
```

### 2. ⚡ Redis (Cache & Queue)
Cần một máy chủ Redis đang chạy trên cổng `6379`. Cách dễ nhất là dùng Docker:
```Bash
# Mở PowerShell/Terminal và chạy lệnh này
docker run -d -p 6379:6379 --name my-redis-server redis
```
(Để dừng: `docker stop my-redis-server`)

### 3. ☕ Backend (Spring Boot - `backend-app`)
1. **Cấu hình CSDL:** Mở file `FoodOrderiing/src/main/resources/application.properties.`
    + Sửa `spring.datasource.url` để trỏ đến CSDL của bạn (ví dụ: `food_ordering_app`).
    + Sửa `spring.datasource.password` thành mật khẩu PostgreSQL của ta.
    
```Properties
# Cấu hình PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/food_ordering_app
spring.datasource.username=postgres
spring.datasource.password=your_password_here

# Cấu hình Redis
spring.redis.host=localhost
spring.redis.port=6379

# Tự động tạo bảng từ @Entity và chạy data.sql
spring.jpa.hibernate.ddl-auto=update
```

2. **(Tùy chọn) Thêm món ăn:** Thêm các lệnh `INSERT` vào file `backend-app/src/main/resources/data.sql` để tự động có dữ liệu món ăn khi khởi động.

### 4. ⚛️ Frontend (React - `frontend-app`)
1. **Cài đặt thư viện:**
```Bash
cd frontend-app
npm install
```

2. **Cấu hình Proxy (Chống lỗi CORS):** Mở file `frontend-app/package.json` và thêm dòng `"proxy"`:
```JSON
{
  "name": "frontend-app",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:8080",
  "dependencies": {
    // ...
  }
}
```

3. **Sửa URL:** Đảm bảo tất cả các lệnh gọi API (`axios`) và WebSocket (`StompJS`) trong các file `.js` không chứa `http://localhost:8080`.
    + **Đúng:** `axios.get("/api/menu")` và `const WS_URL = 'ws://localhost:3000/ws'` (nó sẽ tự proxy).
    + **Sai:** `axios.get("http://localhost:8080/api/menu")`.

    
## 🏃 Cách Chạy Chương trình
Phải cần chạy **4 Dịch vụ** cùng lúc (mỗi dịch vụ trong một Terminal riêng).

1. **Terminal 1: Chạy PostgreSQL** (Đã chạy tự động nếu đã cài đặt)

2. **Terminal 2: Chạy Redis** (Nếu dùng Docker):
```Bash
docker start my-redis-server
```

3. **Terminal 3: Chạy Backend (Spring Boot)**
```Bash
cd D:\HomeworkProject\FoodOrderiing
mvn spring-boot:run
```
*Chờ đến khi thấy "Started FoodOrderingAppApplication..."*

4. **Terminal 4: Chạy Frontend (React)**
```Bash
cd D:\HomeworkProject\frontend-app
npm start
```
*Trình duyệt sẽ tự động mở trang `http://localhost:3000`.*

## 🗺️ Cách Sử dụng
Sau khi chạy tất cả các bước, ta có thể truy cập:
+ **Trang Khách hàng (Diner):** `http://localhost:3000`
    + *Xem menu, đặt hàng và theo dõi trạng thái.*
+ **Trang Nhà bếp (KDS):** `http://localhost:3000/kitchen`
    + *Mở trang này ở một tab khác để xem đơn hàng mới nhảy vào real-time và cập nhật trạng thái.*
+ **API Backend (Chỉ dữ liệu):** `http://localhost:8080`
    + *(Truy cập trực tiếp sẽ báo lỗi 404, nhưng API đã sẵn sàng ở `/api/...`)*

## 🌳 Cây Thư mục Dự án
```plaintext
📂 FoodOrdering/
├── 📂 backend-app/
│   ├── ⚙️ pom.xml                      # Phụ thuộc Maven (Spring, JPA, Redis, WS)
│   └── 📂 src/
│       ├── 📂 main/
│       │   ├── 📂 java/
│       │   │   └── 📦 com/GourmetGo/foodorderingapp/
│       │   │       ├── 📂 config/
│       │   │       │   ├── 📄 RateLimitingInterceptor.java # Bộ chặn giới hạn request
│       │   │       │   ├── 📄 WebMvcConfig.java          # Áp dụng bộ chặn
│       │   │       │   └── 📄 WebSocketConfig.java    # Cấu hình WebSocket, STOMP, và CORS
│       │   │       ├── 📂 controller/
│       │   │       │   ├── 📄 KitchenController.java   # Nhận cập nhật trạng thái từ KDS
│       │   │       │   ├── 📄 MenuController.java     # API GET /api/menu (dùng DTO)
│       │   │       │   ├── 📄 OrderController.java    # API POST /api/orders (đẩy vào queue)
│       │   │       │   ├── 📄 PaymentController.java  # API POST /api/payments/mock
│       │   │       │   └── 📄 ReviewController.java   # API POST /api/reviews
│       │   │       ├── 📂 dto/
│       │   │       │   ├── 📄 MenuItemDTO.java        # DTO cho Menu (tránh lỗi Lazy)
│       │   │       │   ├── 📄 OrderItemRequest.java   
│       │   │       │   ├── 📄 OrderRequest.java       # DTO nhận yêu cầu từ client
│       │   │       │   ├── 📄 PaymentResponse.java
│       │   │       │   ├── 📄 ReviewRequest.java
│       │   │       │   └── 📄 UpdateStatusRequest.java # DTO cho KDS cập nhật status
│       │   │       ├── 📂 model/
│       │   │       │   ├── 📄 MenuItem.java           # Entity Menu (liên kết Lazy)
│       │   │       │   ├── 📄 Order.java              # Entity Đơn hàng
│       │   │       │   ├── 📄 OrderItem.java
│       │   │       │   ├── 📄 OrderStatus.java        # Enum (RECEIVED, PREPARING, ...)
│       │   │       │   ├── 📄 Review.java
│       │   │       │   ├── 📄 Role.java               # Enum (DINER, KITCHEN)
│       │   │       │   └── 📄 User.java
│       │   │       ├── 📂 repository/
│       │   │       │   ├── 📄 MenuItemRepository.java # Giao diện Spring Data JPA
│       │   │       │   ├── 📄 OrderRepository.java
│       │   │       │   ├── 📄 ReviewRepository.java
│       │   │       │   └── 📄 UserRepository.java
│       │   │       ├── 📂 service/
│       │   │       │   ├── 📄 KitchenService.java     # Logic cập nhật status, gửi WS cho khách
│       │   │       │   ├── 📄 MenuService.java        # Logic lấy và chuyển đổi Menu -> DTO
│       │   │       │   ├── 📄 OrderBatchProcessor.java # Logic @Scheduled lấy từ Queue, lưu CSDL, gửi WS
│       │   │       │   ├── 📄 OrderService.java       # Logic đẩy vào Redis Queue (ĐÃ XÓA WS)
│       │   │       │   └── 📄 ReviewService.java
│       │   │       └── 📄 FoodOrderingAppApplication.java # Lớp chính (@EnableScheduling)
│       │   └── 📂 resources/
│       │       ├── ⚙️ application.properties          # Cấu hình Spring, CSDL, Redis
│       │       └── 🛢️ data.sql                        # Dữ liệu mẫu ban đầu
│       └── 📂 test/
│           └── 📂 java/
│               └── 📦 .../
│                   └── 📄 OrderServiceTest.java
└── 📂 frontend-app/
    ├── 📂 public/
    │   └── 🌐 index.html
    ├── 📂 src/
    │   ├── 📂 components/
    │   │   ├── 📜 Cart.js                 # Component Giỏ hàng
    │   │   ├── 📜 Checkout.js             # Logic thanh toán, gửi đơn hàng (async, finally)
    │   │   ├── 📜 KitchenDisplay.js       # Màn hình bếp, kết nối WebSocket (STOMP + SockJS)
    │   │   ├── 📜 Menu.js                 # Hiển thị thực đơn (gọi API /api/menu)
    │   │   └── 📜 OrderStatus.js          # Trang khách hàng xem status real-time
    │   ├── 📂 context/
    │   │   └── 📜 CartContext.js          # Quản lý state giỏ hàng (useCart, clearCart)
    │   ├── 📜 App.js                      # Bộ định tuyến (React Router)
    │   └── 📜 index.js                    # Điểm vào, bọc <BrowserRouter> và <CartProvider>
    └── ⚙️ package.json                    # Phụ thuộc NPM (axios, stompjs, sockjs)
    
```