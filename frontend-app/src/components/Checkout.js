// src/components/Checkout.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { formatCurrency } from '../utils/formatCurrency';

const API_URL = process.env.REACT_APP_API_URL;
const SHIPPING_FEE = 30000;
const VAT_RATE = 0.15;

// (CSS styles giữ nguyên)
const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: 'auto' },
    section: { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
    h2: { marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' },
    h3: { marginTop: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    formField: { display: 'flex', flexDirection: 'column' },
    input: { padding: '8px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' },
    readOnlyInput: { padding: '8px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', background: '#eee' },
    radioGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    radioLabel: { cursor: 'pointer' },
    cardFields: { border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginTop: '10px' },
    walletButtons: { display: 'flex', gap: '10px', marginTop: '10px' },
    orderItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0' },
    grandTotal: { fontSize: '1.2em', fontWeight: 'bold', color: 'red' },
    checkoutButton: { width: '100%', padding: '15px', fontSize: '1.2em', fontWeight: 'bold', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    errorText: { color: 'red', fontSize: '0.8em', marginTop: '3px' }
};

// --- HÀM VALIDATION (Goal 1 & 3) ---
const isValidLuhn = (value) => {
    if (/[^0-9-\s]+/.test(value) || value.length < 13) return false;
    let nCheck = 0, bEven = false;
    value = value.replace(/\D/g, "");
    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
            nDigit = parseInt(cDigit, 10);
        if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) === 0;
};
const isValidExpiry = (expiry) => {
    if (expiry.length !== 5) return false; // Phải là mm/yy
    const [month, year] = expiry.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(`20${year}`, 10); // 25 -> 2025
    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS month là 0-11
    if (yearNum < currentYear) return false; // Năm đã qua
    if (yearNum === currentYear && monthNum < currentMonth) return false; // Tháng đã qua
    return true;
};
// --- KẾT THÚC HÀM VALIDATION ---

export const Checkout = () => {
    // --- SỬA ĐỔI: LẤY STATE VOUCHER TỪ CONTEXT ---
    const {
        cartItems,
        clearCart,
        updateCartItemNote,
        subtotal, // Lấy subtotal
        voucher,  // Lấy voucher đã áp dụng
        voucherError,
        applyVoucher,
        removeVoucher
    } = useCart();
    // --- KẾT THÚC SỬA ĐỔI ---
    const { getItemName } = useMenu();
    const navigate = useNavigate();
    const { currentUser, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // (State thông tin cơ bản)
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [shipperNote, setShipperNote] = useState('');

    // (State địa chỉ)
    const [apartmentNumber, setApartmentNumber] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [ward, setWard] = useState('');
    const [city, setCity] = useState('');
    const [fullAddress, setFullAddress] = useState('');

    // (State thanh toán)
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [eWallet, setEWallet] = useState('');

    const [isFirstOrder, setIsFirstOrder] = useState(false);

    // (State cho lỗi validation)
    const [validationErrors, setValidationErrors] = useState({});

    // --- STATE MỚI: Cho ô nhập liệu voucher ---
    const [voucherCodeInput, setVoucherCodeInput] = useState('');

    // Tải thông tin người dùng
    useEffect(() => {
        if (!currentUser) return;
        if (!currentUser.name) {
            setIsFirstOrder(true);
            setName('');
            setPhone(currentUser.phoneNumber);
            setApartmentNumber(''); setStreetAddress(''); setWard(''); setCity('');
        } else {
            setIsFirstOrder(false);
            setName(currentUser.name);
            setPhone(currentUser.phoneNumber);
            setApartmentNumber(currentUser.apartmentNumber || '');
            setStreetAddress(currentUser.streetAddress || '');
            setWard(currentUser.ward || '');
            setCity(currentUser.city || '');
        }
    }, [currentUser]);

    // Tự động cập nhật địa chỉ đầy đủ (Goal 5)
    useEffect(() => {
        const parts = [apartmentNumber, streetAddress, ward, city];
        setFullAddress(parts.filter(Boolean).join(', '));
    }, [apartmentNumber, streetAddress, ward, city]);

    // --- SỬA ĐỔI: TÍNH TOÁN TIỀN (Thêm Giảm giá) ---
    const discountAmount = voucher ? voucher.discountAmount : 0;
    const vatAmount = subtotal * VAT_RATE;
    const shippingFee = SHIPPING_FEE;
    const grandTotal = subtotal + vatAmount + shippingFee - discountAmount;
    // --- KẾT THÚC SỬA ĐỔI ---

    // --- HÀM MỚI: XỬ LÝ NHẬP LIỆU THẺ (Goal 1, 2, 3, 4) ---
    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'number') {
            processedValue = value.replace(/[^0-9]/g, '').slice(0, 16);
        }
        else if (name === 'name') {
            processedValue = value.replace(/[^a-zA-Z\s]/g, '');
        }
        else if (name === 'expiry') {
            processedValue = value.replace(/[^0-9]/g, '');
            if (processedValue.length > 2) {
                processedValue = processedValue.slice(0, 2) + '/' + processedValue.slice(2, 4);
            } else {
                processedValue = processedValue.slice(0, 2);
            }
        }
        else if (name === 'cvv') {
            processedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
        }

        setCardInfo(prev => ({ ...prev, [name]: processedValue }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    // --- KẾT THÚC HÀM MỚI ---

    // --- HÀM MỚI: Xử lý nút Áp dụng ---
    const handleApplyVoucher = () => {
        applyVoucher(voucherCodeInput);
    };

    const handleCheckout = async () => {
        if (!name || !phone || !streetAddress || !ward || !city) {
            alert("Vui lòng nhập đầy đủ Tên, SĐT và các trường địa chỉ.");
            return;
        }

        // --- VALIDATION THẺ (Goal 1 & 3) ---
        const newErrors = {};
        if (paymentMethod === 'CARD') {
            if (!isValidLuhn(cardInfo.number)) {
                newErrors.number = 'Số thẻ không hợp lệ.';
            }
            if (cardInfo.name.trim().length < 3) {
                newErrors.name = 'Tên chủ thẻ không hợp lệ.';
            }
            if (!isValidExpiry(cardInfo.expiry)) {
                newErrors.expiry = 'Ngày hết hạn không hợp lệ (phải là MM/YY và trong tương lai).';
            }
            if (cardInfo.cvv.length < 3) {
                newErrors.cvv = 'CVV không hợp lệ (ít nhất 3 số).';
            }
        }
        setValidationErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            alert("Thông tin thẻ không hợp lệ, vui lòng kiểm tra lại các ô màu đỏ!");
            return; // Dừng lại
        }
        // --- KẾT THÚC VALIDATION ---

        setIsLoading(true);

        try {
            // 1. Cập nhật thông tin User (Tên + Địa chỉ) (Goal 3 & 5)
            try {
                const updatedUser = await axios.put(`${API_URL}/api/users/me`, {
                    name,
                    apartmentNumber,
                    streetAddress,
                    ward,
                    city
                });
                updateUser(updatedUser.data); // Cập nhật state global
            } catch (e) {
                throw new Error("Không thể cập nhật thông tin người dùng.");
            }

            // 2. Gọi Mock Payment (Giữ nguyên)
            console.log("Đang giả lập thanh toán...");
            const paymentResponse = await axios.post(`${API_URL}/api/payments/mock`);

            if (paymentResponse.data.status === "SUCCESS") {
                console.log("Thanh toán thành công");

                // 3. Gửi đầy đủ OrderRequest lên backend
                const orderRequest = {
                    // --- BẮT ĐẦU SỬA ĐỔI ---
                    // Ánh xạ (map) giỏ hàng mới sang DTO
                    items: cartItems.map(item => ({
                        menuItemId: item.id, // ID món ăn gốc
                        quantity: item.quantity,
                        note: item.note,
                        pricePerUnit: item.finalPrice, // Giá 1 món (đã tính options)
                        selectedOptionsText: item.selectedOptionsText // Chuỗi options
                    })),

                    // --- KẾT THÚC SỬA ĐỔI ---
                    deliveryAddress: fullAddress, // (Goal 4)
                    shipperNote: shipperNote,       // (Goal 1)
                    paymentMethod: paymentMethod,   // (Goal 6)
                    subtotal: subtotal,
                    vatAmount: vatAmount,
                    shippingFee: shippingFee,

                    // --- THÊM DỮ LIỆU VOUCHER ---
                    discountAmount: discountAmount,
                    voucherCode: voucher ? voucher.code : null,
                    grandTotal: grandTotal, // Gửi tổng tiền cuối cùng
                    // --- KẾT THÚC ---

                    pickupWindow: new Date(Date.now() + 30 * 60000).toISOString() // Giả định 30p
                };

                await axios.post(`${API_URL}/api/orders`, orderRequest);
                console.log("Đơn hàng đã được tiếp nhận.");

                if (clearCart) { clearCart(); }
                alert("Đặt hàng thành công!");
                navigate('/my-orders');
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Phiên đăng nhập hết hạn.");
                navigate('/login');
            } else if (error.response && error.response.status === 409) { // (Xử lý lỗi 3 đơn hàng)
                alert(error.response.data);
            } else {
                alert("Đã xảy ra lỗi: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // (Xử lý giỏ hàng trống)
    if (cartItems.length === 0) {
        return (
            <div style={styles.container}>
                <h2>Giỏ hàng của bạn đang trống!</h2>
                <Link to="/">Quay lại trang chủ</Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2>Thanh toán Đơn hàng</h2>

            {/* 1. THÔNG TIN CƠ BẢN (Goal 1, 3, 4, 5) */}
            <section style={styles.section}>
                <h3 style={styles.h3}>Thông tin giao hàng</h3>
                <div style={styles.formGrid}>
                    <div style={styles.formField}>
                        <label>Tên người nhận:</label>
                        <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            disabled={!isFirstOrder} style={isFirstOrder ? styles.input : styles.readOnlyInput}
                        />
                    </div>
                    <div style={styles.formField}>
                        <label>Số điện thoại:</label>
                        <input
                            type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                            disabled={!isFirstOrder} style={isFirstOrder ? styles.input : styles.readOnlyInput}
                        />
                    </div>
                </div>
                {/* Địa chỉ chi tiết (Goal 4) */}
                <div style={styles.formGrid}>
                    <div style={styles.formField}>
                        <label>Số căn hộ/phòng (Nếu có):</label>
                        <input
                            type="text" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)}
                            style={styles.input} // Luôn cho phép sửa địa chỉ
                        />
                    </div>
                    <div style={styles.formField}>
                        <label>Số nhà & Tên đường:</label>
                        <input
                            type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)}
                            style={styles.input} // Luôn cho phép sửa địa chỉ
                        />
                    </div>
                </div>
                <div style={styles.formGrid}>
                    <div style={styles.formField}>
                        <label>Phường/Xã:</label>
                        <input
                            type="text" value={ward} onChange={(e) => setWard(e.target.value)}
                            style={styles.input} // Luôn cho phép sửa địa chỉ
                        />
                    </div>
                    <div style={styles.formField}>
                        <label>Tỉnh/Thành phố:</label>
                        <input
                            type="text" value={city} onChange={(e) => setCity(e.target.value)}
                            style={styles.input} // Luôn cho phép sửa địa chỉ
                        />
                    </div>
                </div>
                {/* Địa chỉ đầy đủ (Goal 5) */}
                <div style={{...styles.formField, marginTop: '15px'}}>
                    <label>Địa chỉ đầy đủ (Tự động cập nhật):</label>
                    <input
                        type="text"
                        value={fullAddress}
                        readOnly // Goal 5: Không cho sửa
                        style={styles.readOnlyInput}
                    />
                </div>
                {/* Ghi chú shipper (Goal 1) */}
                <div style={{...styles.formField, marginTop: '15px'}}>
                    <label>Ghi chú cho tài xế:</label>
                    <textarea
                        value={shipperNote} onChange={(e) => setShipperNote(e.target.value)}
                        style={{...styles.input, height: '60px'}}
                        placeholder="Ví dụ: Cổng màu xanh..."
                    />
                </div>
            </section>

            {/* 2. THÔNG TIN THANH TOÁN (Goal 6, 7, 8, 9) */}
            <section style={styles.section}>
                <h3 style={styles.h3}>Thông tin thanh toán</h3>
                <div style={styles.radioGroup}>
                    {/* (COD) */}
                    <label style={styles.radioLabel}>
                        <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                        Thanh toán khi nhận hàng (COD)
                    </label>

                    {/* (Thẻ) */}
                    <label style={styles.radioLabel}>
                        <input type="radio" name="payment" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                        Thẻ Tín dụng/Ghi nợ
                    </label>

                    {paymentMethod === 'CARD' && (
                        <div style={styles.cardFields}>
                            <div style={styles.formGrid}>
                                {/* Số thẻ (Goal 1) */}
                                <div style={styles.formField}>
                                    <input name="number" placeholder="Số thẻ" value={cardInfo.number}
                                           onChange={handleCardChange} style={styles.input} maxLength={16} />
                                    {validationErrors.number && <span style={styles.errorText}>{validationErrors.number}</span>}
                                </div>
                                {/* Tên chủ thẻ (Goal 2) */}
                                <div style={styles.formField}>
                                    <input name="name" placeholder="Tên chủ thẻ" value={cardInfo.name}
                                           onChange={handleCardChange} style={styles.input} />
                                    {validationErrors.name && <span style={styles.errorText}>{validationErrors.name}</span>}
                                </div>
                                {/* Ngày hết hạn (Goal 3) */}
                                <div style={styles.formField}>
                                    <input name="expiry" placeholder="Ngày hết hạn (MM/YY)" value={cardInfo.expiry}
                                           onChange={handleCardChange} style={styles.input} maxLength={5} />
                                    {validationErrors.expiry && <span style={styles.errorText}>{validationErrors.expiry}</span>}
                                </div>
                                {/* CVV (Goal 4) */}
                                <div style={styles.formField}>
                                    <input name="cvv" placeholder="CVV" value={cardInfo.cvv}
                                           onChange={handleCardChange} style={styles.input} maxLength={4} />
                                    {validationErrors.cvv && <span style={styles.errorText}>{validationErrors.cvv}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* (E-Wallet) */}
                    <label style={styles.radioLabel}>
                        <input type="radio" name="payment" value="EWALLET" checked={paymentMethod === 'EWALLET'} onChange={() => setPaymentMethod('EWALLET')} />
                        Ví điện tử
                    </label>
                    {paymentMethod === 'EWALLET' && (
                        <div style={styles.walletButtons}>
                            <button onClick={() => setEWallet('MOMO')} style={{background: eWallet === 'MOMO' ? '#AE2070' : '#ddd', color: eWallet === 'MOMO' ? 'white' : 'black', border: 'none', padding: '10px'}}>Momo</button>
                            <button onClick={() => setEWallet('ZALOPAY')} style={{background: eWallet === 'ZALOPAY' ? '#008FE5' : '#ddd', color: eWallet === 'ZALOPAY' ? 'white' : 'black', border: 'none', padding: '10px'}}>ZaloPay</button>
                        </div>
                    )}

                    {/* (QR) */}
                    <label style={styles.radioLabel}>
                        <input type="radio" name="payment" value="QR" checked={paymentMethod === 'QR'} onChange={() => setPaymentMethod('QR')} />
                        QR Code Online Banking
                    </label>
                </div>
            </section>

            {/* --- PHẦN 3: VOUCHER (MỚI) --- */}
            <section style={styles.section}>
                <h3 style={styles.h3}>Mã Giảm Giá</h3>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input
                        type="text"
                        placeholder="Nhập mã voucher"
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                        style={{...styles.input, flex: 1}}
                        disabled={!!voucher} // Vô hiệu hóa nếu đã áp dụng
                    />
                    {voucher ? (
                        <button onClick={removeVoucher} style={{...styles.checkoutButton, width: 'auto', background: 'gray'}}>Hủy</button>
                    ) : (
                        <button onClick={handleApplyVoucher} style={{...styles.checkoutButton, width: 'auto'}}>Áp dụng</button>
                    )}
                </div>
                {voucherError && <p style={{color: 'red'}}>{voucherError}</p>}
                {voucher && (
                    <p style={{color: 'green', fontWeight: 'bold'}}>
                        Áp dụng thành công [{voucher.code}]: {voucher.description}
                    </p>
                )}
            </section>
            {/* --- KẾT THÚC PHẦN 3 --- */}

            {/* (Phần 4: Thông tin đơn hàng - SỬA ĐỔI) */}
            <section style={styles.section}>
                <h3 style={styles.h3}>Thông tin đơn hàng</h3>

                {/* Sửa logic lặp qua cartItems (dùng cartItemId) */}
                {cartItems.map(item => (
                    <div key={item.cartItemId} style={styles.orderItem}>
                        <div>
                            <span style={{fontWeight: 'bold'}}>{item.quantity} x {getItemName(item.id)}</span>

                            {/* Hiển thị tùy chọn đã chọn */}
                            {item.selectedOptionsText && (
                                <div style={{fontSize: '0.9em', color: 'gray', paddingLeft: '10px'}}>
                                    ↳ {item.selectedOptionsText}
                                </div>
                            )}

                            <input
                                type="text"
                                placeholder="Ghi chú cho món ăn..."
                                value={item.note}
                                // (Sửa hàm gọi: dùng updateCartItemNote)
                                onChange={(e) => updateCartItemNote(item.cartItemId, e.target.value)}
                                style={{...styles.input, width: '100%', fontSize: '0.9em', marginTop: '5px'}}
                            />
                        </div>
                        {/* Giá cuối cùng (đã tính options) * số lượng */}
                        <span style={{fontWeight: 'bold'}}>{formatCurrency(item.finalPrice * item.quantity)}</span>
                    </div>
                ))}

                <hr />
                {/* (Các dòng Tạm tính, VAT, Phí VC, Giảm giá, Tổng thanh toán giữ nguyên) */}
                <div style={styles.totalRow}>
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={styles.totalRow}>
                    <span>VAT (15%):</span>
                    <span>{formatCurrency(vatAmount)}</span>
                </div>
                <div style={styles.totalRow}>
                    <span>Phí vận chuyển:</span>
                    <span>{formatCurrency(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                    <div style={{...styles.totalRow, color: 'green', fontWeight: 'bold'}}>
                        <span>Giảm giá ({voucher.code}):</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                )}
                <hr />
                <div style={{...styles.totalRow, ...styles.grandTotal}}>
                    <span>Tổng thanh toán:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>
            </section>

            {/* (Phần 5: Nút Thanh toán giữ nguyên) */}
            <button onClick={handleCheckout} disabled={isLoading} style={styles.checkoutButton}>
                {isLoading ? "Đang xử lý..." : `Thanh toán (${formatCurrency(grandTotal)})`}
            </button>
        </div>
    );
};