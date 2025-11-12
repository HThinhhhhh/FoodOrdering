// src/components/CustomerHeader.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    fontSize: '1em',
    fontFamily: 'inherit'
};

export const CustomerHeader = () => {
    const { currentUser, logout } = useAuth(); // Dùng hàm logout chung
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login'); // Đăng xuất khách về trang login của khách
    };

    const renderLinks = () => {
        // Chỉ render link cho Khách hàng
        if (currentUser && currentUser.role === 'DINER') {
            return (
                <>
                    <Link to="/" style={linkStyle}>Thực đơn</Link>
                    <Link to="/my-orders" style={linkStyle}>Đơn hàng của tôi</Link>
                </>
            );
        } else {
            // Chưa đăng nhập Khách (Đã sửa ở bước trước, chỉ giữ lại Đăng ký)
            return (
                <>
                    <Link to="/" style={linkStyle}>Thực đơn</Link>
                    <Link to="/login" style={linkStyle}>Đăng nhập</Link>
                </>
            );
        }
    };

    const renderLogoutButton = () => {
        // Chỉ hiện nút logout nếu là DINER
        if (currentUser && currentUser.role === 'DINER') {
            return (
                // --- BẮT ĐẦU SỬA ĐỔI ---
                <div>
                    {/* Thêm Link "Đổi mật khẩu" */}
                    <Link
                        to="/change-password"
                        style={{...linkStyle, fontSize: '0.9em', color: 'blue', textDecoration: 'underline'}}
                    >
                        Đổi mật khẩu
                    </Link>

                    <button onClick={handleLogout} style={buttonStyle}>
                        Đăng xuất ({currentUser.username})
                    </button>
                </div>
                // --- KẾT THÚC SỬA ĐỔI ---
            );
        }
        return null;
    };

    return (
        <nav style={navStyle}>
            <div>{renderLinks()}</div>
            <div>{renderLogoutButton()}</div>
        </nav>
    );
};