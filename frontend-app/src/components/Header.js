// src/components/Header.js
import React from 'react';
// 1. Thêm useLocation và useNavigate
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// (CSS cho Header)
const navStyle = {
    padding: '10px 20px',
    background: '#eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};
const linkStyle = {
    marginRight: '15px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold'
};
const buttonStyle = {
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: 'blue',
    textDecoration: 'underline',
    fontSize: '1em'
};

export const Header = () => {
    const { currentUser, logout } = useAuth(); // Lấy hàm logout
    const navigate = useNavigate();
    const location = useLocation(); // Lấy vị trí (URL) hiện tại

    // 2. Kiểm tra xem người dùng đang ở khu vực Bếp hay không
    const isKitchenArea = location.pathname.startsWith('/kitchen');

    const handleLogout = async () => {
        await logout();
        // 3. Đăng xuất xong, về trang đăng nhập tương ứng
        if (isKitchenArea) {
            navigate('/kitchen/login');
        } else {
            navigate('/login');
        }
    };

    // 4. Render các link dựa trên khu vực và trạng thái đăng nhập
    const renderLinks = () => {
        if (isKitchenArea) {
            // === KHU VỰC BẾP (Goal 2) ===
            if (currentUser && currentUser.role === 'KITCHEN') {
                // Đã đăng nhập Bếp
                return <Link to="/kitchen" style={linkStyle}>Màn hình Bếp</Link>;
            } else {
                // Chưa đăng nhập Bếp
                return <Link to="/kitchen/login" style={linkStyle}>Đăng nhập Bếp</Link>;
            }
        } else {
            // === KHU VỰC KHÁCH HÀNG (Goal 1) ===
            if (currentUser && currentUser.role === 'DINER') {
                // Đã đăng nhập Khách
                return (
                    <>
                        <Link to="/" style={linkStyle}>Thực đơn</Link>
                        <Link to="/my-orders" style={linkStyle}>Đơn hàng của tôi</Link>
                    </>
                );
            } else {
                // Chưa đăng nhập Khách (Xóa link KDS khỏi đây)
                return (
                    <>
                        <Link to="/" style={linkStyle}>Thực đơn</Link>
                        <Link to="/login" style={linkStyle}>Đăng nhập</Link>
                    </>
                );
            }
        }
    };

    // 5. Render nút Đăng xuất (Goals 4 & 5)
    const renderLogoutButton = () => {
        if (!currentUser) return null;

        // Chỉ hiện nút logout nếu vai trò của user khớp với khu vực
        if (isKitchenArea && currentUser.role === 'KITCHEN') {
            return <button onClick={handleLogout} style={buttonStyle}>Đăng xuất ({currentUser.username})</button>;
        }
        if (!isKitchenArea && currentUser.role === 'DINER') {
            return <button onClick={handleLogout} style={buttonStyle}>Đăng xuất ({currentUser.username})</button>;
        }
        return null;
    };

    return (
        <nav style={navStyle}>
            <div>
                {renderLinks()}
            </div>
            <div>
                {renderLogoutButton()}
            </div>
        </nav>
    );
};