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
// --- THÊM STYLE MỚI ---
const socialLinkStyle = {
    ...linkStyle,
    fontWeight: 'normal',
    color: 'blue',
    fontSize: '0.9em'
};
// --- KẾT THÚC THÊM ---
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
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const renderLinks = () => {
        if (currentUser && currentUser.role === 'DINER') {
            return (
                <>
                    <Link to="/" style={linkStyle}>Thực đơn</Link>
                    <Link to="/my-orders" style={linkStyle}>Đơn hàng của tôi</Link>
                </>
            );
        } else {
            return (
                <>
                    <Link to="/" style={linkStyle}>Thực đơn</Link>
                    <Link to="/login" style={linkStyle}>Đăng nhập</Link>
                    <Link to="/register" style={linkStyle}>Đăng ký</Link>
                </>
            );
        }
    };

    const renderUserActions = () => {
        if (currentUser && currentUser.role === 'DINER') {
            return (
                <div>
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
            );
        }
        return null;
    };

    return (
        <nav style={navStyle}>
            <div>
                {renderLinks()}
            </div>

            {/* --- THÊM PHÍM TẮT ZALO/FB (FR7.3) --- */}
            <div>
                <a href="https://zalo.me/your-zalo-id" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                    Hỗ trợ Zalo
                </a>
                <a href="https://facebook.com/your-page" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                    Facebook
                </a>
            </div>
            {/* --- KẾT THÚC THÊM --- */}

            <div>{renderUserActions()}</div>
        </nav>
    );
};