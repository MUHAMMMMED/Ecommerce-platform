
import React, { useEffect, useState } from 'react';
import { FiEdit, FiPackage, FiTrash2 } from 'react-icons/fi';
import AxiosInstance from '../../Authentication/AxiosInstance';
import './Packages.css';

const Packaging = () => {
    const [packagings, setPackagings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: 0,
        stock_alarm: 0,
        image: null,
    });
    const [editingPackaging, setEditingPackaging] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clearImage, setClearImage] = useState(false);

    useEffect(() => {
        fetchPackagings();
    }, []);

    const fetchPackagings = async () => {
        try {
            const response = await AxiosInstance.get(`/orders/packages/`);
            setPackagings(response.data);
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في جلب التغليف');
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'quantity' || name === 'stock_alarm' ? parseInt(value) || 0 : value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
        setClearImage(false);
    };

    const handleClearImage = () => {
        setFormData({ ...formData, image: null });
        setClearImage(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('quantity', formData.quantity);
        data.append('stock_alarm', formData.stock_alarm);
        if (formData.image) {
            data.append('image', formData.image);
        } else if (clearImage && editingPackaging) {
            data.append('image', '');
        }

        try {
            if (editingPackaging) {
                const response = await AxiosInstance.patch(`/orders/packages/${editingPackaging.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setPackagings(packagings.map(pkg => (pkg.id === editingPackaging.id ? response.data : pkg)));
            } else {
                const response = await AxiosInstance.post(`/orders/packages/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setPackagings([...packagings, response.data]);
            }
            resetForm();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في حفظ التغليف');
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackaging(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || '',
            quantity: pkg.quantity,
            stock_alarm: pkg.stock_alarm,
            image: null,
        });
        setClearImage(false);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا التغليف؟')) {
            try {
                await AxiosInstance.delete(`/orders/packages/${id}/`);
                setPackagings(packagings.filter(pkg => pkg.id !== id));
            } catch (err) {
                setError(err.response?.data?.detail || 'فشل في حذف التغليف');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            quantity: 0,
            stock_alarm: 0,
            image: null,
        });
        setEditingPackaging(null);
        setClearImage(false);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    if (isLoading) return <div className="pkg-loading-spinner">جاري تحميل التغليف...</div>;
    if (error) return <div className="pkg-error-message">{error}</div>;

    return (
        <div className="pkg-dashboard">
            <div className="pkg-header">
                <h2>إدارة التغليف</h2>
                <button onClick={openModal} className="pkg-btn-add">
                    إضافة تغليف جديد
                </button>
            </div>

            <div className="pkg-list">
                {packagings.length > 0 ? (
                    packagings.map(pkg => (
                        <div key={pkg.id} className="pkg-card">
                            <div className="pkg-card-header">
                                <h3 className="pkg-card-title">{pkg.name}</h3>
                                <span className={`pkg-stock-status ${pkg.is_empty ? 'empty' : 'in-stock'}`}>
                                    <FiPackage className="pkg-stock-icon" />
                                    {pkg.is_empty ? 'نفد المخزون' : 'متوفر في المخزون'}
                                </span>
                            </div>
                            <div className="pkg-card-content">
                                {pkg.image ? (
                                    <div className="pkg-card-image">
                                        <img src={`${pkg.image}?t=${Date.now()}`} alt={pkg.name} />
                                    </div>
                                ) : (
                                    <div className="pkg-card-image pkg-card-image-placeholder">
                                        <span>لا توجد صورة</span>
                                    </div>
                                )}
                                <div className="pkg-card-details">
                                    <div className="pkg-detail-item">
                                        <span className="pkg-detail-label">الكمية:</span>
                                        <span className="pkg-detail-value pkg-badge">{pkg.quantity} وحدة</span>
                                    </div>
                                    <div className="pkg-detail-item">
                                        <span className="pkg-detail-label">تنبيه المخزون:</span>
                                        <span className="pkg-detail-value pkg-badge">{pkg.stock_alarm}</span>
                                    </div>
                                    <div className="pkg-detail-item pkg-description">
                                        <span className="pkg-detail-label">الوصف:</span>
                                        <span className="pkg-detail-value">{pkg.description || 'غير متوفر'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pkg-card-actions">
                                <button onClick={() => handleEdit(pkg)} className="pkg-btn-edit">
                                    <FiEdit className="pkg-btn-icon" /> تعديل
                                </button>
                                <button onClick={() => handleDelete(pkg.id)} className="pkg-btn-delete">
                                    <FiTrash2 className="pkg-btn-icon" /> حذف
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="pkg-no-packaging">لا يوجد تغليف</p>
                )}
            </div>

            {isModalOpen && (
                <div className="pkg-modal">
                    <div className="pkg-modal-content">
                        <div className="pkg-modal-header">
                            <h3>{editingPackaging ? 'تعديل التغليف' : 'إضافة تغليف جديد'}</h3>
                            <button onClick={closeModal} className="pkg-btn-close">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="pkg-form">
                            <div className="pkg-form-group">
                                <label htmlFor="name">الاسم*</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="pkg-form-group">
                                <label htmlFor="description">الوصف</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="أدخل وصف التغليف..."
                                />
                            </div>
                            <div className="pkg-form-group">
                                <label htmlFor="quantity">الكمية*</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="0"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="pkg-form-group">
                                <label htmlFor="stock_alarm">تنبيه المخزون</label>
                                <input
                                    type="number"
                                    id="stock_alarm"
                                    name="stock_alarm"
                                    min="0"
                                    value={formData.stock_alarm}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="pkg-form-group">
                                <label htmlFor="image">الصورة</label>
                                {editingPackaging && editingPackaging.image && !formData.image && !clearImage && (
                                    <div className="pkg-image-preview">
                                        <img
                                            src={editingPackaging.image}
                                            alt="التغليف الحالي"
                                            className="pkg-preview-image"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleClearImage}
                                            className="pkg-btn-clear-image"
                                        >
                                            إزالة الصورة
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {formData.image && (
                                    <div className="pkg-image-preview">
                                        <img
                                            src={URL.createObjectURL(formData.image)}
                                            alt="معاينة الصورة الجديدة"
                                            className="pkg-preview-image"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="pkg-form-actions">
                                <button type="submit" className="pkg-btn-save">
                                    {editingPackaging ? 'تحديث التغليف' : 'إضافة تغليف'}
                                </button>
                                <button type="button" onClick={closeModal} className="pkg-btn-cancel">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Packaging;