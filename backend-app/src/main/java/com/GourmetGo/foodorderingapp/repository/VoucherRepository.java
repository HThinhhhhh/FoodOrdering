package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Voucher;
import jakarta.persistence.LockModeType; // <-- THÊM IMPORT
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock; // <-- THÊM IMPORT
import org.springframework.data.jpa.repository.Query; // <-- THÊM IMPORT
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    // --- THÊM HÀM MỚI ---
    /**
     * Tìm voucher bằng code và KHÓA (lock) nó ở mức PESSIMISTIC_WRITE.
     * Điều này ngăn chặn 2 đơn hàng cùng lúc sử dụng voucher cuối cùng.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Voucher v WHERE v.code = :code")
    Optional<Voucher> findByCodeAndLock(String code);
    // --- KẾT THÚC THÊM MỚI ---
}