import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/settings`);
                setSettings(response.data);
            } catch (error) {
                console.error("Lỗi khi tải cài đặt nhà hàng:", error);
                // Đặt cài đặt mặc định nếu API lỗi để tránh crash app
                setSettings({
                    restaurantName: "GourmetGo",
                    address: "Chưa cập nhật",
                    openingHours: "Chưa cập nhật",
                    contactPhone: "Chưa cập nhật"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const value = {
        settings,
        loadingSettings: loading
    };

    return (
        <SettingsContext.Provider value={value}>
            {/* Chỉ render các component con khi đã tải xong */}
            {!loading && children}
        </SettingsContext.Provider>
    );
};