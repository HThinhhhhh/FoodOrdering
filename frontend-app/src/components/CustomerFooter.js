import React from 'react';
import { useSettings } from '../context/SettingsContext';
import styles from './CustomerFooter.module.css';

export const CustomerFooter = () => {
    const { settings } = useSettings();

    // Sẽ không render gì cho đến khi context tải xong (do logic trong SettingsProvider)
    if (!settings) return null;

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.column}>
                    <h4>{settings.restaurantName || "GourmetGo"}</h4>
                    <p>Trải nghiệm ẩm thực tuyệt vời, giao hàng nhanh chóng và tiện lợi.</p>
                </div>
                <div className={styles.column}>
                    <h4>Liên hệ</h4>
                    <p><strong>Địa chỉ:</strong> {settings.address || "Chưa cập nhật"}</p>
                    <p><strong>Hotline:</strong> {settings.contactPhone || "Chưa cập nhật"}</p>
                    <p><strong>Email:</strong> {settings.contactEmail || "Chưa cập nhật"}</p>
                </div>
                <div className={styles.column}>
                    <h4>Giờ mở cửa</h4>
                    <p>{settings.openingHours || "Chưa cập nhật"}</p>
                </div>
            </div>
            <div className={styles.copyright}>
                © {new Date().getFullYear()} {settings.restaurantName || "GourmetGo"}. All Rights Reserved.
            </div>
        </footer>
    );
};