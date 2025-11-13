


import axios from "axios";
import Config from "./config";

const baseURL = `${Config.baseURL}/api`;

const AxiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Add Authorization header automatically
AxiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh when 401 happens
AxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                try {
                    const res = await axios.post(`${Config.baseURL}/Users/token/refresh/`, {
                        refresh: refreshToken,
                    }, { withCredentials: true });

                    localStorage.setItem("access_token", res.data.access);
                    AxiosInstance.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

                    return AxiosInstance(originalRequest);
                } catch (err) {
                    console.error("❌ Refresh token failed:", err);
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                }
            }
        }

        return Promise.reject(error);
    }
);

export default AxiosInstance;