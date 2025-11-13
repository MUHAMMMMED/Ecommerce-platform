
import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import './LogoutButton.css';

const LogoutButton = () => {
    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await AxiosInstance.post(`Users/logout/`, {
                    refresh: refreshToken,
                });
            }

            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(';').forEach((cookie) => {
                const name = cookie.split('=')[0].trim();
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            });

            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error.response?.data || error.message);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <button className="logout-float-btn" onClick={handleLogout} title="تسجيل الخروج">
            <FiLogOut size={22} />
        </button>
    );
};

export default LogoutButton;