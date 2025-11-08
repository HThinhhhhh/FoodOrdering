// src/components/OrderReviewPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';

const API_URL = process.env.REACT_APP_API_URL;

// Component Rating (1-5 sao)
const StarRating = ({ rating, setRating }) => (
    <div>
        {[1, 2, 3, 4, 5].map(star => (
            <span
                key={star}
                style={{ cursor: 'pointer', color: star <= rating ? 'gold' : 'gray', fontSize: '2em' }}
                onClick={() => setRating(star)}
            >
                ★
            </span>
        ))}
    </div>
);

export const OrderReviewPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { getItemName } = useMenu(); // Lấy tên món ăn

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho đánh giá
    const [deliveryRating, setDeliveryRating] = useState(5);
    const [deliveryComment, setDeliveryComment] = useState('');

    // State cho đánh giá món ăn
    // Ví dụ: { 1: { rating: 0, comment: '' }, 4: { rating: 0, comment: '' } }
    const [itemReviews, setItemReviews] = useState({});

    // Tải thông tin đơn hàng cần đánh giá
    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                const allOrders = response.data;
                const currentOrder = allOrders.find(o => o.id.toString() === orderId);

                if (currentOrder) {
                    // Kiểm tra logic (Backend cũng kiểm tra, nhưng frontend nên kiểm tra trước)
                    if (currentOrder.status !== 'COMPLETED') throw new Error("Đơn hàng chưa hoàn thành.");
                    if (currentOrder.isReviewed) throw new Error("Đơn hàng đã được đánh giá.");

                    setOrder(currentOrder);

                    // Khởi tạo state cho đánh giá món ăn
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

    // Hàm cập nhật state cho đánh giá món ăn
    const handleItemReviewChange = (menuItemId, field, value) => {
        setItemReviews(prev => ({
            ...prev,
            [menuItemId]: {
                ...prev[menuItemId],
                [field]: value
            }
        }));
    };

    // Gửi đánh giá
    const handleSubmitReview = async () => {
        setLoading(true);
        setError('');

        // Chuẩn bị payload (DTO)
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

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;
    if (!order) return <p>Không tìm thấy đơn hàng.</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
            <h2>Đánh giá Đơn hàng #{order.id}</h2>

            {/* Đánh giá Giao hàng (Goal 1) */}
            <section style={{ marginBottom: '20px' }}>
                <h4>Bạn thấy việc giao hàng thế nào?</h4>
                <StarRating rating={deliveryRating} setRating={setDeliveryRating} />
                <textarea
                    placeholder="Để lại bình luận về tài xế..."
                    value={deliveryComment}
                    onChange={(e) => setDeliveryComment(e.target.value)}
                    style={{ width: '100%', minHeight: '80px', marginTop: '10px' }}
                />
            </section>

            <hr />

            {/* Đánh giá Món ăn (Goal 2) */}
            <section style={{ marginTop: '20px' }}>
                <h4>Đánh giá các món ăn trong đơn hàng:</h4>
                {order.items.map(item => (
                    <div key={item.menuItemId} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                        <strong>{getItemName(item.menuItemId)}</strong>
                        <StarRating
                            rating={itemReviews[item.menuItemId]?.rating || 0}
                            setRating={(rating) => handleItemReviewChange(item.menuItemId, 'rating', rating)}
                        />
                        <textarea
                            placeholder="Để lại bình luận về món ăn này..."
                            value={itemReviews[item.menuItemId]?.comment || ''}
                            onChange={(e) => handleItemReviewChange(item.menuItemId, 'comment', e.target.value)}
                            style={{ width: '100%', minHeight: '60px', marginTop: '10px' }}
                        />
                    </div>
                ))}
            </section>

            <button
                onClick={handleSubmitReview}
                disabled={loading}
                style={{ width: '100%', padding: '15px', fontSize: '1.2em', fontWeight: 'bold', background: 'green', color: 'white', border: 'none' }}
            >
                Gửi Đánh giá
            </button>
        </div>
    );
};