import React from 'react';
import { useSettings } from '../context/SettingsContext';
import styles from './CoverImageBanner.module.css';

export const CoverImageBanner = () => {
    const { settings, loadingSettings } = useSettings();

    if (loadingSettings || !settings || !settings.coverImageUrl) {
        // Không hiển thị banner nếu đang tải hoặc không có ảnh bìa
        return null;
    }

    return (
        <div className={styles.bannerContainer}>
            <img
                src={settings.coverImageUrl}
                alt={settings.restaurantName || "Ảnh bìa nhà hàng"}
                className={styles.coverImage}
            />
            {/* Có thể thêm lớp phủ (overlay) hoặc text nếu muốn */}
            <div className={styles.bannerOverlay}>
                <h1>Chào mừng đến với {settings.restaurantName || "Nhà hàng của chúng tôi"}!</h1>
            </div>
        </div>
    );
};