package com.GourmetGo.foodorderingapp.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.http.HttpStatus;

import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    // Số request tối đa
    private static final int MAX_REQUESTS = 10;
    // Trong khoảng thời gian (ms)
    private static final long TIME_WINDOW_MS = 60000; // 10 requests mỗi 60 giây

    // Map lưu trữ: <IP Address, Hàng đợi các mốc thời gian (timestamp) request>
    private final ConcurrentHashMap<String, Queue<Long>> requestTimestamps = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String clientIp = request.getRemoteAddr();

        // Lấy hàng đợi timestamp cho IP này, hoặc tạo mới nếu chưa có
        Queue<Long> timestamps = requestTimestamps.computeIfAbsent(clientIp, k -> new ConcurrentLinkedQueue<>());

        long now = System.currentTimeMillis();

        // 1. Xóa các timestamp cũ (ngoài TIME_WINDOW)
        // (peek() xem phần tử đầu tiên, poll() lấy và xóa)
        while (!timestamps.isEmpty() && (now - timestamps.peek() > TIME_WINDOW_MS)) {
            timestamps.poll();
        }

        // 2. Kiểm tra số lượng request còn lại
        if (timestamps.size() >= MAX_REQUESTS) {
            // Nếu vượt quá, trả về lỗi 429 TOO_MANY_REQUESTS
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Quá nhiều yêu cầu, vui lòng thử lại sau.");
            return false; // Chặn request
        }

        // 3. Nếu chưa vượt quá, thêm timestamp mới và cho phép request
        timestamps.add(now);
        return true; // Cho phép request
    }
}