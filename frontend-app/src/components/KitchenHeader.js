// src/components/KitchenHeader.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './KitchenHeader.module.css';

export const KitchenHeader = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/restaurant/login');
    };

    const renderLinks = () => {
        if (!currentUser) {
            return <Link to="/restaurant/login" className={styles.linkStyle}>Đăng nhập Bếp/Admin/NV</Link>;
        }

        if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN' || currentUser.role === 'EMPLOYEE') {
            return (
                <>
                    {/* Link cho Bếp (KITCHEN, ADMIN) */}
                    {(currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') && (
                        <Link to="/restaurant" className={styles.linkStyle}>Màn hình Bếp</Link>
                    )}

                    {/* Link cho Quản lý Đơn hàng (EMPLOYEE, ADMIN) */}
                    {(currentUser.role === 'EMPLOYEE' || currentUser.role === 'ADMIN') && (
                        <Link to="/restaurant/admin/orders" className={styles.adminOrderLink}>
                            Quản lý Đơn hàng
                        </Link>
                    )}

                    {/* Link cho Quản lý (ADMIN only) */}
                    {currentUser.role === 'ADMIN' && (
                        <>
                            <Link to="/restaurant/admin/dashboard" className={styles.adminDashboardLink}>
                                Dashboard
                            </Link>
                            <Link to="/restaurant/admin/menu" className={styles.adminMenuLink}>
                                Quản lý Menu
                            </Link>
                            <Link to="/restaurant/admin/revenue" className={styles.adminRevenueLink}>
                                Báo cáo Doanh thu
                            </Link>
                            <Link to="/restaurant/admin/vouchers" className={styles.adminVoucherLink}>
                                Quản lý Voucher
                            </Link>
                            <Link to="/restaurant/admin/reviews" className={styles.adminReviewLink}>
                                Quản lý Đánh giá
                            </Link>

                            {/* --- THÊM LINK CÀI ĐẶT TẠI ĐÂY --- */}
                            <Link to="/restaurant/admin/settings" className={styles.linkStyle} style={{color: '#6c757d'}}>
                                Cài đặt
                            </Link>
                            {/* --- KẾT THÚC THÊM MỚI --- */}
                        </>
                    )}
                </>
            );
        }
        return null;
    };

    const renderLogoutButton = () => {
        if (currentUser && (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN' || currentUser.role === 'EMPLOYEE')) {
            return <button onClick={handleLogout} className={styles.buttonStyle}>Đăng xuất ({currentUser.username})</button>;
        }
        return null;
    };

    return (
        <nav className={styles.navStyle}>
            <div>{renderLinks()}</div>
            <div>{renderLogoutButton()}</div>
        </nav>
    );
};