// src/components/Checkout.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { formatCurrency } from '../utils/formatCurrency';

// --- 1. IMPORT CSS MODULE ---
import styles from './Checkout.module.css';

const API_URL = process.env.REACT_APP_API_URL;
const SHIPPING_FEE = 30000;
const VAT_RATE = 0.15;

// --- 2. XÓA BỎ HOÀN TOÀN 'const styles = { ... }' ---
// (Đã xóa)

// (Các hàm VALIDATION giữ nguyên)
// ...
const isValidLuhn = (value) => {
    // ... (logic giữ nguyên)
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
    // ... (logic giữ nguyên)
    if (expiry.length !== 5) return false;
    const [month, year] = expiry.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(`20${year}`, 10);
    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    return true;
};
// ---

export const Checkout = () => {
    // (Tất cả state và logic (hooks, useEffects, calculations) giữ nguyên)
    // ...
    const {
        cartItems, clearCart, updateCartItemNote,
        subtotal, voucher, voucherError,
        applyVoucher, removeVoucher
    } = useCart();
    const { getItemName } = useMenu();
    const navigate = useNavigate();
    const { currentUser, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [shipperNote, setShipperNote] = useState('');
    const [apartmentNumber, setApartmentNumber] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [ward, setWard] = useState('');
    const [city, setCity] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [eWallet, setEWallet] = useState('');
    const [isFirstOrder, setIsFirstOrder] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [voucherCodeInput, setVoucherCodeInput] = useState('');

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

    useEffect(() => {
        const parts = [apartmentNumber, streetAddress, ward, city];
        setFullAddress(parts.filter(Boolean).join(', '));
    }, [apartmentNumber, streetAddress, ward, city]);

    const discountAmount = voucher ? voucher.discountAmount : 0;
    const vatAmount = subtotal * VAT_RATE;
    const shippingFee = SHIPPING_FEE;
    const grandTotal = subtotal + vatAmount + shippingFee - discountAmount;

    // (Tất cả các hàm handler (handleCardChange, handleApplyVoucher, handleCheckout) giữ nguyên)
    // ...
    const handleCardChange = (e) => {
        // ... (logic giữ nguyên)
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

    const handleApplyVoucher = () => {
        applyVoucher(voucherCodeInput);
    };

    const handleCheckout = async () => {
        // ... (logic giữ nguyên)
        if (!name || !phone || !streetAddress || !ward || !city) {
            alert("Vui lòng nhập đầy đủ Tên, SĐT và các trường địa chỉ.");
            return;
        }

        const newErrors = {};
        if (paymentMethod === 'CARD') {
            if (!isValidLuhn(cardInfo.number)) newErrors.number = 'Số thẻ không hợp lệ.';
            if (cardInfo.name.trim().length < 3) newErrors.name = 'Tên chủ thẻ không hợp lệ.';
            if (!isValidExpiry(cardInfo.expiry)) newErrors.expiry = 'Ngày hết hạn không hợp lệ (phải là MM/YY và trong tương lai).';
            if (cardInfo.cvv.length < 3) newErrors.cvv = 'CVV không hợp lệ (ít nhất 3 số).';
        }
        setValidationErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            alert("Thông tin thẻ không hợp lệ, vui lòng kiểm tra lại các ô màu đỏ!");
            return;
        }

        setIsLoading(true);
        try {
            try {
                const updatedUser = await axios.put(`${API_URL}/api/users/me`, {
                    name, apartmentNumber, streetAddress, ward, city
                });
                updateUser(updatedUser.data);
            } catch (e) {
                throw new Error("Không thể cập nhật thông tin người dùng.");
            }

            console.log("Đang giả lập thanh toán...");
            const paymentResponse = await axios.post(`${API_URL}/api/payments/mock`);

            if (paymentResponse.data.status === "SUCCESS") {
                console.log("Thanh toán thành công");
                const orderRequest = {
                    items: cartItems.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                        note: item.note,
                        pricePerUnit: item.finalPrice,
                        selectedOptionsText: item.selectedOptionsText
                    })),
                    deliveryAddress: fullAddress,
                    shipperNote: shipperNote,
                    paymentMethod: paymentMethod,
                    subtotal: subtotal,
                    vatAmount: vatAmount,
                    shippingFee: shippingFee,
                    discountAmount: discountAmount,
                    voucherCode: voucher ? voucher.code : null,
                    grandTotal: grandTotal,
                    pickupWindow: new Date(Date.now() + 30 * 60000).toISOString()
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
            } else if (error.response && error.response.status === 409) {
                alert(error.response.data);
            } else {
                alert("Đã xảy ra lỗi: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className={`${styles.container} ${styles.emptyCart}`}>
                <h2>Giỏ hàng của bạn đang trống!</h2>
                <Link to="/">Quay lại trang chủ</Link>
            </div>
        );
    }

    return (
        // --- 3. SỬ DỤNG className ---
        <div className={styles.container}>
            <h2>Thanh toán Đơn hàng</h2>

            {/* 1. THÔNG TIN CƠ BẢN */}
            <section className={styles.section}>
                <h3 className={styles.h3}>Thông tin giao hàng</h3>
                <div className={styles.formGrid}>
                    <div className={styles.formField}>
                        <label>Tên người nhận:</label>
                        <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            disabled={!isFirstOrder}
                            className={isFirstOrder ? styles.input : styles.readOnlyInput}
                        />
                    </div>
                    <div className={styles.formField}>
                        <label>Số điện thoại:</label>
                        <input
                            type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                            disabled={!isFirstOrder}
                            className={isFirstOrder ? styles.input : styles.readOnlyInput}
                        />
                    </div>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formField}>
                        <label>Số căn hộ/phòng (Nếu có):</label>
                        <input
                            type="text" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formField}>
                        <label>Số nhà & Tên đường:</label>
                        <input
                            type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formField}>
                        <label>Phường/Xã:</label>
                        <input
                            type="text" value={ward} onChange={(e) => setWard(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formField}>
                        <label>Tỉnh/Thành phố:</label>
                        <input
                            type="text" value={city} onChange={(e) => setCity(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>
                <div className={styles.fullAddressField}>
                    <label>Địa chỉ đầy đủ (Tự động cập nhật):</label>
                    <input
                        type="text"
                        value={fullAddress}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </div>
                <div className={styles.fullAddressField}>
                    <label>Ghi chú cho tài xế:</label>
                    <textarea
                        value={shipperNote} onChange={(e) => setShipperNote(e.target.value)}
                        className={styles.textarea}
                        placeholder="Ví dụ: Cổng màu xanh..."
                    />
                </div>
            </section>

            {/* 2. THÔNG TIN THANH TOÁN */}
            <section className={styles.section}>
                <h3 className={styles.h3}>Thông tin thanh toán</h3>
                <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                        <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                        Thanh toán khi nhận hàng (COD)
                    </label>

                    <label className={styles.radioLabel}>
                        <input type="radio" name="payment" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                        Thẻ Tín dụng/Ghi nợ
                    </label>

                    {paymentMethod === 'CARD' && (
                        <div className={styles.cardFields}>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <input name="number" placeholder="Số thẻ" value={cardInfo.number}
                                           onChange={handleCardChange} className={styles.input} maxLength={16} />
                                    {validationErrors.number && <span className={styles.errorText}>{validationErrors.number}</span>}
                                </div>
                                <div className={styles.formField}>
                                    <input name="name" placeholder="Tên chủ thẻ" value={cardInfo.name}
                                           onChange={handleCardChange} className={styles.input} />
                                    {validationErrors.name && <span className={styles.errorText}>{validationErrors.name}</span>}
                                </div>
                                <div className={styles.formField}>
                                    <input name="expiry" placeholder="Ngày hết hạn (MM/YY)" value={cardInfo.expiry}
                                           onChange={handleCardChange} className={styles.input} maxLength={5} />
                                    {validationErrors.expiry && <span className={styles.errorText}>{validationErrors.expiry}</span>}
                                </div>
                                <div className={styles.formField}>
                                    <input name="cvv" placeholder="CVV" value={cardInfo.cvv}
                                           onChange={handleCardChange} className={styles.input} maxLength={4} />
                                    {validationErrors.cvv && <span className={styles.errorText}>{validationErrors.cvv}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <label className={styles.radioLabel}>
                        <input type="radio" name="payment" value="EWALLET" checked={paymentMethod === 'EWALLET'} onChange={() => setPaymentMethod('EWALLET')} />
                        Ví điện tử
                    </label>
                    {paymentMethod === 'EWALLET' && (
                        <div className={styles.walletButtons}>
                            <button
                                onClick={() => setEWallet('MOMO')}
                                className={eWallet === 'MOMO' ? styles.momoActive : ''}
                            >
                                Momo
                            </button>
                            <button
                                onClick={() => setEWallet('ZALOPAY')}
                                className={eWallet === 'ZALOPAY' ? styles.zaloActive : ''}
                            >
                                ZaloPay
                            </button>
                        </div>
                    )}

                    <label className={styles.radioLabel}>
                        <input type="radio" name="payment" value="QR" checked={paymentMethod === 'QR'} onChange={() => setPaymentMethod('QR')} />
                        QR Code Online Banking
                    </label>
                </div>
            </section>

            {/* 3: VOUCHER */}
            <section className={styles.section}>
                <h3 className={styles.h3}>Mã Giảm Giá</h3>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input
                        type="text"
                        placeholder="Nhập mã voucher"
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                        className={styles.input}
                        disabled={!!voucher}
                    />
                    {voucher ? (
                        <button onClick={removeVoucher} className={`${styles.voucherButton} ${styles.cancel}`}>Hủy</button>
                    ) : (
                        <button onClick={handleApplyVoucher} className={styles.voucherButton}>Áp dụng</button>
                    )}
                </div>
                {voucherError && <p className={styles.errorText}>{voucherError}</p>}
                {voucher && (
                    <p style={{color: 'green', fontWeight: 'bold'}}>
                        Áp dụng thành công [{voucher.code}]: {voucher.description}
                    </p>
                )}
            </section>

            {/* 4: Thông tin đơn hàng */}
            <section className={styles.section}>
                <h3 className={styles.h3}>Thông tin đơn hàng</h3>

                {cartItems.map(item => (
                    <div key={item.cartItemId} className={styles.orderItem}>
                        <div className={styles.itemDetails}>
                            <span style={{fontWeight: 'bold'}}>{item.quantity} x {getItemName(item.id)}</span>
                            {item.selectedOptionsText && (
                                <div className={styles.itemOptions}>
                                    ↳ {item.selectedOptionsText}
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Ghi chú cho món ăn..."
                                value={item.note}
                                onChange={(e) => updateCartItemNote(item.cartItemId, e.target.value)}
                                className={styles.itemNoteInput}
                            />
                        </div>
                        <span className={styles.itemPrice}>{formatCurrency(item.finalPrice * item.quantity)}</span>
                    </div>
                ))}

                <hr />
                <div className={styles.totalRow}>
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={styles.totalRow}>
                    <span>VAT (15%):</span>
                    <span>{formatCurrency(vatAmount)}</span>
                </div>
                <div className={styles.totalRow}>
                    <span>Phí vận chuyển:</span>
                    <span>{formatCurrency(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                    <div className={`${styles.totalRow} ${styles.voucher}`}>
                        <span>Giảm giá ({voucher.code}):</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                )}
                <hr />
                <div className={styles.grandTotal}>
                    <span>Tổng thanh toán:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>
            </section>

            {/* 5: Nút Thanh toán */}
            <button onClick={handleCheckout} disabled={isLoading} className={styles.checkoutButton}>
                {isLoading ? "Đang xử lý..." : `Thanh toán (${formatCurrency(grandTotal)})`}
            </button>
        </div>
    );
};