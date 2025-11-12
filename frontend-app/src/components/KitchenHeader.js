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
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/kitchen/login');
    };

    const renderLinks = () => {
        if (!currentUser) {
            return <Link to="/kitchen/login" style={linkStyle}>Đăng nhập Bếp/Admin/NV</Link>;
        }

        // Tất cả nhân viên đã đăng nhập
        if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN' || currentUser.role === 'EMPLOYEE') {
            return (
                <>
                    {/* Link cho Bếp (KITCHEN, ADMIN) */}
                    {(currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') && (
                        <Link to="/kitchen" style={linkStyle}>Màn hình Bếp</Link>
                    )}

                    {/* Link cho Quản lý Đơn hàng (EMPLOYEE, ADMIN) */}
                    {(currentUser.role === 'EMPLOYEE' || currentUser.role === 'ADMIN') && (
                        <Link to="/kitchen/admin/orders" style={{...linkStyle, color: 'red'}}>
                            Quản lý Đơn hàng
                        </Link>
                    )}

                    {/* Link cho Quản lý Menu (ADMIN only) */}
                    {currentUser.role === 'ADMIN' && (
                        <Link to="/kitchen/admin/menu" style={{...linkStyle, color: 'red'}}>
                            Quản lý Menu
                        </Link>
                    )}
                </>
            );
        }

        // (Nếu là DINER, AuthContext sẽ tự động điều hướng, nhưng để dự phòng)
        return null;
    };

    const renderLogoutButton = () => {
        if (currentUser && (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN' || currentUser.role === 'EMPLOYEE')) {
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