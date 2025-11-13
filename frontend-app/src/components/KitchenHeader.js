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
        navigate('/restaurant/login'); // SỬA: kitchen -> restaurant
    };

    const renderLinks = () => {
        if (!currentUser) {
            return <Link to="/restaurant/login" style={linkStyle}>Đăng nhập Bếp/Admin/NV</Link>; // SỬA
        }

        if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN' || currentUser.role === 'EMPLOYEE') {
            return (
                <>
                    {/* Link cho Bếp (KITCHEN, ADMIN) */}
                    {(currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') && (
                        <Link to="/restaurant" style={linkStyle}>Màn hình Bếp</Link> // SỬA
                    )}

                    {/* Link cho Quản lý Đơn hàng (EMPLOYEE, ADMIN) */}
                    {(currentUser.role === 'EMPLOYEE' || currentUser.role === 'ADMIN') && (
                        <Link to="/restaurant/admin/orders" style={{...linkStyle, color: 'red'}}>
                            Quản lý Đơn hàng
                        </Link> // SỬA
                    )}

                    {/* Link cho Quản lý (ADMIN only) */}
                    {currentUser.role === 'ADMIN' && (
                        <>
                            {/* --- THÊM LINK DASHBOARD TẠI ĐÂY --- */}
                            <Link to="/restaurant/admin/dashboard" style={{...linkStyle, color: 'green', fontWeight: 'bold'}}>
                                Dashboard
                            </Link>
                            {/* --- KẾT THÚC THÊM MỚI --- */}

                            <Link to="/restaurant/admin/menu" style={{...linkStyle, color: 'red'}}>
                                Quản lý Menu
                            </Link>
                            <Link to="/restaurant/admin/revenue" style={{...linkStyle, color: 'blue'}}>
                                Báo cáo Doanh thu
                            </Link>
                            <Link to="/restaurant/admin/vouchers" style={{...linkStyle, color: 'purple'}}>
                                Quản lý Voucher
                            </Link>
                            <Link to="/restaurant/admin/reviews" style={{...linkStyle, color: 'orange'}}>
                                Quản lý Đánh giá
                            </Link>
                        </>
                    )}
                </>
            );
        }

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