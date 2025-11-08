// src/utils/formatCurrency.js

/**
 * Chuyển đổi một số thành định dạng tiền tệ VNĐ.
 * Ví dụ: 40000 -> "40.000 VNĐ"
 * @param {number} amount - Số tiền
 * @returns {string} - Số tiền đã định dạng
 */
export const formatCurrency = (amount) => {
    // Kiểm tra nếu amount không phải là số (ví dụ: null hoặc undefined)
    if (typeof amount !== 'number') {
        return "0 VNĐ";
    }

    // Sử dụng toLocaleString('vi-VN') để tự động thêm dấu chấm (.)
    // vào hàng ngàn.
    return amount.toLocaleString('vi-VN') + " VNĐ";
};