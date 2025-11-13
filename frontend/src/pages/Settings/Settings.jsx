import React, { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import AxiosInstance from '../../Authentication/AxiosInstance';
import ErrorPage from '../../components/Loading/ErrorPage';
import Loading from '../../components/Loading/Loading';

import Config from '../../Authentication/config';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        site_name: '',
        logo: null,
        landing_cover: null,
        currency: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        address: '',
        about: '',
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await AxiosInstance.get(`/products/settings/`);
            if (Object.keys(response.data).length > 0) {
                setSettings(response.data);
                setFormData({
                    ...response.data,
                    logo: null,
                    landing_cover: null,
                });
            }
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في جلب الإعدادات');
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setFormData({ ...formData, [name]: files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = settings
                ? await AxiosInstance.put(`/products/settings/update/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                : await AxiosInstance.post(`/products/settings/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            setSettings(response.data);
            setFormData({
                ...response.data,
                logo: null,
                landing_cover: null,
            });
            alert('تم حفظ الإعدادات بنجاح!');
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في حفظ الإعدادات');
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorPage head='فشل في جلب الإعدادات' error={error} />;


    return (
        <div className="stg-dashboard">
            <div className="stg-header">
                <h2>إعدادات الموقع</h2>
            </div>
            <form onSubmit={handleSubmit} className="stg-form" encType="multipart/form-data">
                <div className="stg-form-section">
                    <h3>الإعدادات العامة</h3>

                    <div className="stg-form-group">
                        <label htmlFor="site_name">اسم الموقع</label>
                        <input
                            type="text"
                            id="site_name"
                            name="site_name"
                            value={formData.site_name}
                            onChange={handleInputChange}
                            placeholder="أدخل اسم الموقع..."
                        />
                    </div>

                    <div className="stg-form-group">
                        <label htmlFor="logo">الشعار (صورة)</label>
                        <input
                            type="file"
                            id="logo"
                            name="logo"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {formData.logo && typeof formData.logo === 'object' && (
                            <div className="stg-image-preview">
                                <img
                                    src={URL.createObjectURL(formData.logo)}
                                    alt="معاينة الشعار الجديد"
                                    className="stg-preview-image"
                                />
                            </div>
                        )}
                        {!formData.logo && settings?.logo && (
                            <div className="stg-image-preview">
                                <img

                                    src={`${Config.baseURL}${settings.logo}`}
                                    alt="الشعار الحالي"
                                    className="stg-preview-image"
                                />
                            </div>
                        )}
                    </div>

                    <div className="stg-form-group">
                        <label htmlFor="landing_cover">صورة الغلاف</label>
                        <input
                            type="file"
                            id="landing_cover"
                            name="landing_cover"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {formData.landing_cover && typeof formData.landing_cover === 'object' && (
                            <div className="stg-image-preview">
                                <img
                                    src={URL.createObjectURL(formData.landing_cover)}
                                    alt="معاينة الغلاف الجديد"
                                    className="stg-preview-image"
                                />
                            </div>
                        )}
                        {!formData.landing_cover && settings?.landing_cover && (
                            <div className="stg-image-preview">
                                <img
                                    src={`${Config.baseURL}${settings.landing_cover}`}
                                    alt="الغلاف الحالي"
                                    className="stg-preview-image"
                                />
                            </div>
                        )}
                    </div>

                    <div className="stg-form-group">
                        <label htmlFor="currency">العملة</label>
                        <input
                            type="text"
                            id="currency"
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            placeholder="أدخل العملة..."
                        />
                    </div>
                </div>

                <div className="stg-form-section">
                    <h3>معلومات التواصل</h3>
                    <div className="stg-form-group">
                        <label htmlFor="email">البريد الإلكتروني</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="أدخل البريد الإلكتروني..."
                        />
                    </div>
                    <div className="stg-form-group">
                        <label htmlFor="phone">رقم الهاتف</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="أدخل رقم الهاتف..."
                        />
                    </div>
                    <div className="stg-form-group">
                        <label htmlFor="whatsapp_number">رقم واتساب</label>
                        <input
                            type="text"
                            id="whatsapp_number"
                            name="whatsapp_number"
                            value={formData.whatsapp_number}
                            onChange={handleInputChange}
                            placeholder="أدخل رقم واتساب..."
                        />
                    </div>
                    <div className="stg-form-group">
                        <label htmlFor="address">العنوان</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="أدخل العنوان..."
                            rows="4"
                        />
                    </div>
                </div>

                <div className="stg-form-section">
                    <h3>معلومات عن الموقع</h3>
                    <div className="stg-form-group">
                        <label htmlFor="about">معلومات عن الموقع</label>
                        <textarea
                            id="about"
                            name="about"
                            value={formData.about}
                            onChange={handleInputChange}
                            placeholder="أدخل وصفًا عن الموقع..."
                            rows="6"
                        />
                    </div>
                </div>

                <div className="stg-form-section">
                    <h3>روابط السوشال ميديا</h3>
                    {['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin'].map((platform) => (
                        <div className="stg-form-group" key={platform}>
                            <label htmlFor={platform}>{platform}</label>
                            <input
                                type="url"
                                id={platform}
                                name={platform}
                                value={formData[platform]}
                                onChange={handleInputChange}
                                placeholder={`أدخل رابط ${platform}...`}
                            />
                        </div>
                    ))}
                </div>

                <div className="stg-form-actions">
                    <button type="submit" className="stg-btn-save">
                        <FiSave className="stg-btn-icon" />
                        {settings ? 'تحديث الإعدادات' : 'إنشاء الإعدادات'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;