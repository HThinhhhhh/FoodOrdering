package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.model.DiscountType; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.model.Voucher;
import com.GourmetGo.foodorderingapp.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal; // <-- THÊM IMPORT
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    // (Các hàm CRUD: getAllVouchers, getVoucherById, createVoucher, updateVoucher, deleteVoucher giữ nguyên)
    // ...
    @Transactional(readOnly = true)
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Voucher ID: " + id));
    }

    @Transactional
    public Voucher createVoucher(Voucher voucher) {
        Optional<Voucher> existing = voucherRepository.findByCode(voucher.getCode().toUpperCase());
        if (existing.isPresent()) {
            throw new IllegalStateException("Mã voucher này đã tồn tại.");
        }
        voucher.setCode(voucher.getCode().toUpperCase());

        // Logic: Nếu không phải PERCENTAGE, maxDiscountAmount phải là null
        if (voucher.getDiscountType() != com.GourmetGo.foodorderingapp.model.DiscountType.PERCENTAGE) {
            voucher.setMaxDiscountAmount(null);
        }

        return voucherRepository.save(voucher);
    }

    @Transactional
    public Voucher updateVoucher(Long id, Voucher updatedVoucher) {
        Voucher existingVoucher = getVoucherById(id);

        if (!existingVoucher.getCode().equals(updatedVoucher.getCode().toUpperCase())) {
            Optional<Voucher> otherVoucher = voucherRepository.findByCode(updatedVoucher.getCode().toUpperCase());
            if (otherVoucher.isPresent()) {
                throw new IllegalStateException("Mã voucher này đã tồn tại.");
            }
        }

        existingVoucher.setCode(updatedVoucher.getCode().toUpperCase());
        existingVoucher.setDescription(updatedVoucher.getDescription());
        existingVoucher.setDiscountType(updatedVoucher.getDiscountType());
        existingVoucher.setDiscountValue(updatedVoucher.getDiscountValue());
        existingVoucher.setMinimumSpend(updatedVoucher.getMinimumSpend());
        existingVoucher.setUsageLimit(updatedVoucher.getUsageLimit());
        existingVoucher.setStartDate(updatedVoucher.getStartDate());
        existingVoucher.setEndDate(updatedVoucher.getEndDate());
        existingVoucher.setActive(updatedVoucher.isActive());

        // --- CẬP NHẬT TRƯỜNG MỚI ---
        if (updatedVoucher.getDiscountType() == com.GourmetGo.foodorderingapp.model.DiscountType.PERCENTAGE) {
            existingVoucher.setMaxDiscountAmount(updatedVoucher.getMaxDiscountAmount());
        } else {
            existingVoucher.setMaxDiscountAmount(null); // Reset nếu đổi sang FIXED_AMOUNT
        }
        // --- KẾT THÚC CẬP NHẬT ---

        return voucherRepository.save(existingVoucher);
    }

    @Transactional
    public void deleteVoucher(Long id) {
        if (!voucherRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Voucher ID: " + id);
        }
        voucherRepository.deleteById(id);
    }

    // --- BẮT ĐẦU: LOGIC ÁP DỤNG VOUCHER ---

    /**
     * Được gọi bởi OrderBatchProcessor SAU KHI đơn hàng đã được lưu
     */
    @Transactional
    public void incrementVoucherUsage(String code) {
        // Khóa voucher để cập nhật an toàn
        Voucher voucher = voucherRepository.findByCodeAndLock(code.toUpperCase())
                .orElse(null); // Bỏ qua nếu voucher đã bị xóa

        if (voucher != null) {
            voucher.setCurrentUsage(voucher.getCurrentUsage() + 1);
            voucherRepository.save(voucher);
        }
    }

    /**
     * Được gọi bởi VoucherController (API /api/vouchers/apply)
     * Kiểm tra tính hợp lệ và tính toán số tiền giảm giá
     */
    @Transactional(readOnly = true)
    public BigDecimal applyVoucher(String code, BigDecimal subtotal) {
        Voucher voucher = voucherRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new IllegalStateException("Mã giảm giá không tồn tại."));

        // 1. Kiểm tra Active
        if (!voucher.isActive()) {
            throw new IllegalStateException("Mã giảm giá đã bị vô hiệu hóa.");
        }
        // 2. Kiểm tra Ngày
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate())) {
            throw new IllegalStateException("Mã giảm giá chưa đến ngày bắt đầu.");
        }
        if (now.isAfter(voucher.getEndDate())) {
            throw new IllegalStateException("Mã giảm giá đã hết hạn.");
        }
        // 3. Kiểm tra Lượt sử dụng
        if (voucher.getUsageLimit() != null && voucher.getCurrentUsage() >= voucher.getUsageLimit()) {
            throw new IllegalStateException("Mã giảm giá đã hết lượt sử dụng.");
        }
        // 4. Kiểm tra Đơn tối thiểu
        if (voucher.getMinimumSpend() != null && subtotal.compareTo(voucher.getMinimumSpend()) < 0) {
            throw new IllegalStateException("Đơn hàng chưa đủ giá trị tối thiểu " + voucher.getMinimumSpend() + " VNĐ.");
        }

        // --- Hợp lệ, tiến hành tính toán ---
        BigDecimal discountAmount = BigDecimal.ZERO;

        if (voucher.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discountAmount = voucher.getDiscountValue();
        } else if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            // discount = subtotal * (value / 100)
            discountAmount = subtotal.multiply(voucher.getDiscountValue().divide(new BigDecimal(100)));

            // Kiểm tra Giảm tối đa
            if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discountAmount = voucher.getMaxDiscountAmount();
            }
        }

        // Đảm bảo không giảm giá nhiều hơn tạm tính
        if (discountAmount.compareTo(subtotal) > 0) {
            return subtotal;
        }

        return discountAmount;
    }
    // --- KẾT THÚC: LOGIC ÁP DỤNG VOUCHER ---
}