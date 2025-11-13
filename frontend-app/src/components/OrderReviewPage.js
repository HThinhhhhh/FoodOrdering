// src/components/OrderReviewPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';

// --- 1. IMPORT CSS MODULE ---
import styles from './DetailPage.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// --- 2. CẬP NHẬT StarRating (dùng className) ---
const StarRating = ({ rating, setRating }) => (
    <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map(star => (
            <span
                key={star}
                className={star <= rating ? styles.starActive : styles.star}
                onClick={() => setRating(star)}
            >
                ★
            </span>
        ))}
    </div>
);

export const OrderReviewPage = () => {
    // (State và logic (fetchOrder, handleItemReviewChange, handleSubmitReview) giữ nguyên)
    // ...
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { getItemName } = useMenu();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deliveryRating, setDeliveryRating] = useState(5);
    const [deliveryComment, setDeliveryComment] = useState('');
    const [itemReviews, setItemReviews] = useState({});

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                const allOrders = response.data;
                const currentOrder = allOrders.find(o => o.id.toString() === orderId);

                if (currentOrder) {
                    if (currentOrder.status !== 'COMPLETED') throw new Error("Đơn hàng chưa hoàn thành.");
                    if (currentOrder.isReviewed) throw new Error("Đơn hàng đã được đánh giá.");
                    setOrder(currentOrder);
                    const initialReviews = {};
                    currentOrder.items.forEach(item => {
                        initialReviews[item.menuItemId] = { rating: 5, comment: '' };
                    });
                    setItemReviews(initialReviews);
                } else {
                    throw new Error("Không tìm thấy đơn hàng.");
                }
            } catch (e) {
                setError(e.message);
            }
            setLoading(false);
        };
        fetchOrder();
    }, [orderId]);

    const handleItemReviewChange = (menuItemId, field, value) => {
        setItemReviews(prev => ({
            ...prev,
            [menuItemId]: {
                ...prev[menuItemId],
                [field]: value
            }
        }));
    };

    const handleSubmitReview = async () => {
        setLoading(true);
        setError('');
        const payload = {
            orderId: order.id,
            deliveryRating: deliveryRating,
            deliveryComment: deliveryComment,
            itemReviews: Object.entries(itemReviews).map(([menuItemId, review]) => ({
                menuItemId: parseInt(menuItemId),
                rating: review.rating,
                comment: review.comment
            }))
        };

        try {
            await axios.post(`${API_URL}/api/reviews/order`, payload);
            alert("Cảm ơn bạn đã đánh giá!");
            navigate('/my-orders');
        } catch (e) {
            setError(e.response?.data || e.message || "Đã xảy ra lỗi khi gửi đánh giá.");
            setLoading(false);
        }
    };
    // ...

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;
    if (!order) return <p>Không tìm thấy đơn hàng.</p>;

    return (
        // --- 3. SỬ DỤNG className ---
        <div className={styles.container}>
            <h2>Đánh giá Đơn hàng #{order.id}</h2>

            <section className={styles.reviewSection}>
                <h4>Bạn thấy việc giao hàng thế nào?</h4>
                <StarRating rating={deliveryRating} setRating={setDeliveryRating} />
                <textarea
                    placeholder="Để lại bình luận về tài xế..."
                    value={deliveryComment}
                    onChange={(e) => setDeliveryComment(e.target.value)}
                    className={styles.reviewTextarea}
                />
            </section>

            <section className={styles.reviewSection} style={{borderBottom: 'none'}}>
                <h4>Đánh giá các món ăn trong đơn hàng:</h4>
                {order.items.map(item => (
                    <div key={item.menuItemId} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                        <strong>{item.name || getItemName(item.menuItemId)}</strong>
                        <StarRating
                            rating={itemReviews[item.menuItemId]?.rating || 0}
                            setRating={(rating) => handleItemReviewChange(item.menuItemId, 'rating', rating)}
                        />
                        <textarea
                            placeholder="Để lại bình luận về món ăn này..."
                            value={itemReviews[item.menuItemId]?.comment || ''}
                            onChange={(e) => handleItemReviewChange(item.menuItemId, 'comment', e.target.value)}
                            className={styles.reviewTextarea}
                            style={{minHeight: '60px'}} // Ghi đè style
                        />
                    </div>
                ))}
            </section>

            <button
                onClick={handleSubmitReview}
                disabled={loading}
                className={styles.submitButton}
            >
                Gửi Đánh giá
            </button>
        </div>
    );
};