// src/components/KitchenHeader.js
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

export const KitchenHeader = () => {
    const { currentUser, logout } = useAuth(); // Dùng hàm logout chung
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/kitchen/login'); // Đăng xuất bếp về login bếp
    };

    const renderLinks = () => {
        // Chỉ render link cho Bếp
        if (currentUser && (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN')) {
            return (
                <>
                    <Link to="/kitchen" style={linkStyle}>Màn hình Bếp</Link>
                    {/* (Bạn có thể thêm Link '/admin' ở đây nếu currentUser.role === 'ADMIN') */}
                </>
            );
        } else {
            return <Link to="/kitchen/login" style={linkStyle}>Đăng nhập Bếp/Admin</Link>;
        }
    };

    const renderLogoutButton = () => {
        // Chỉ hiện nút logout nếu là KITCHEN hoặc ADMIN
        if (currentUser && (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN')) {
            return <button onClick={handleLogout} style={buttonStyle}>Đăng xuất ({currentUser.username})</button>;
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