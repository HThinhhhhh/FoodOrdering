// src/components/CustomerHeader.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CustomerHeader.module.css';

import { useSettings } from '../context/SettingsContext';

export const CustomerHeader = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const { settings } = useSettings();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const renderLinks = () => {
        if (currentUser && currentUser.role === 'DINER') {
            return (
                <>
                    <Link to="/" className={styles.linkStyle}>Thực đơn</Link>
                    <Link to="/my-orders" className={styles.linkStyle}>Đơn hàng của tôi</Link>
                </>
            );
        } else {
            return (
                <>
                    <Link to="/" className={styles.linkStyle}>Thực đơn</Link>
                    <Link to="/login" className={styles.linkStyle}>Đăng nhập</Link>
                    <Link to="/register" className={styles.linkStyle}>Đăng ký</Link>
                </>
            );
        }
    };

    const renderUserActions = () => {
        if (currentUser && currentUser.role === 'DINER') {
            return (
                <div className={styles.userActions}>
                    <span className={styles.username}>Chào, {currentUser.name || currentUser.username}!</span>
                    <Link
                        to="/change-password"
                        className={styles.userPasswordLink}
                    >
                        Đổi mật khẩu
                    </Link>
                    <button onClick={handleLogout} className={styles.buttonStyle}>
                        Đăng xuất
                    </button>
                </div>
            );
        }
        return null;
    };

    const restaurantName = settings?.restaurantName || "GourmetGo";

    return (
        <nav className={styles.navStyle}>
            <div className={styles.brand}>
                <Link to="/" className={styles.brandLink}>
                    {/* --- SỬA ĐỔI: Chỉ hiển thị tên hoặc logo nhỏ nếu có --- */}
                    {settings?.logoUrl ? ( // Giả định bạn sẽ thêm logoUrl riêng (xem ghi chú bên dưới)
                        <img src={settings.logoUrl} alt={restaurantName} className={styles.brandLogo} />
                    ) : (
                        <span>{restaurantName}</span>
                    )}
                </Link>
            </div>

            <div className={styles.navLinks}>
                {renderLinks()}
            </div>

            <div className={styles.contactLinks}>
                <a href="https://zalo.me/your-zalo-id" target="_blank" rel="noopener noreferrer" className={styles.socialLinkStyle}>
                    Hỗ trợ Zalo
                </a>
                <a href="https://facebook.com/your-page" target="_blank" rel="noopener noreferrer" className={styles.socialLinkStyle}>
                    Facebook
                </a>
            </div>

            <div className={styles.userSection}>{renderUserActions()}</div>
        </nav>
    );
};