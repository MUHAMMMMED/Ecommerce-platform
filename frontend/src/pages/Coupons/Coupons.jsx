import React, { useEffect, useState } from 'react';
import { FiEdit, FiTag, FiTrash2 } from 'react-icons/fi';
import AxiosInstance from '../../Authentication/AxiosInstance';
import ErrorPage from '../../components/Loading/ErrorPage';
import Loading from '../../components/Loading/Loading';
import './Coupons.css';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        code: '',
        discount: 0,
        coupon_usage: 0,
        expiryDate: '',
    });
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await AxiosInstance.get(`/cart/coupons/`);
            setCoupons(response.data);
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في جلب الكوبونات');
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'discount' || name === 'coupon_usage' ? parseFloat(value) || 0 : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('code', formData.code);
        data.append('discount', formData.discount);
        data.append('coupon_usage', formData.coupon_usage);
        data.append('expiryDate', formData.expiryDate);

        try {
            if (editingCoupon) {
                const response = await AxiosInstance.patch(`/cart/coupons/${editingCoupon.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setCoupons(coupons.map(cpn => (cpn.id === editingCoupon.id ? response.data : cpn)));
            } else {
                const response = await AxiosInstance.post(`/cart/coupons/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setCoupons([...coupons, response.data]);
            }
            resetForm();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في حفظ الكوبون');
        }
    };

    const handleEdit = (cpn) => {
        setEditingCoupon(cpn);
        setFormData({
            code: cpn.code,
            discount: cpn.discount,
            coupon_usage: cpn.coupon_usage,
            expiryDate: cpn.expiryDate ? cpn.expiryDate.split('T')[0] : '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
            try {
                await AxiosInstance.delete(`/cart/coupons/${id}/`);
                setCoupons(coupons.filter(cpn => cpn.id !== id));
            } catch (err) {
                setError(err.response?.data?.detail || 'فشل في حذف الكوبون');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discount: 0,
            coupon_usage: 0,
            expiryDate: '',
        });
        setEditingCoupon(null);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // تحقق مما إذا كان الكوبون منتهي الصلاحية
    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        return expiry < today;
    };


    if (isLoading) return <Loading />;
    if (error) return <ErrorPage head='فشل في جلب الكوبونات' error={error} />;
    return (
        <div className="cpn-dashboard">
            <div className="cpn-header">
                <h2>إدارة الكوبونات</h2>
                <button onClick={openModal} className="cpn-btn-add">
                    إضافة كوبون جديد
                </button>
            </div>

            <div className="cpn-list">
                {coupons.length > 0 ? (
                    coupons.map(cpn => (
                        <div key={cpn.id} className="cpn-card">
                            <div className="cpn-card-header">
                                <h3 className="cpn-card-title">{cpn.code}</h3>
                                <span className={`cpn-status ${isExpired(cpn.expiryDate) ? 'expired' : 'active'}`}>
                                    <FiTag className="cpn-status-icon" />
                                    {isExpired(cpn.expiryDate) ? 'منتهي الصلاحية' : 'نشط'}
                                </span>
                            </div>
                            <div className="cpn-card-content">
                                <div className="cpn-card-details">
                                    <div className="cpn-detail-item">
                                        <span className="cpn-detail-label">الخصم:</span>
                                        <span className="cpn-detail-value cpn-badge">{cpn.discount}%</span>
                                    </div>
                                    <div className="cpn-detail-item">
                                        <span className="cpn-detail-label">عدد الاستخدامات:</span>
                                        <span className="cpn-detail-value cpn-badge">{cpn.coupon_usage}</span>
                                    </div>
                                    <div className="cpn-detail-item">
                                        <span className="cpn-detail-label">تاريخ الانتهاء:</span>
                                        <span className="cpn-detail-value cpn-badge">
                                            {cpn.expiryDate ? new Date(cpn.expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="cpn-card-actions">
                                <button onClick={() => handleEdit(cpn)} className="cpn-btn-edit">
                                    <FiEdit className="cpn-btn-icon" /> تعديل
                                </button>
                                <button onClick={() => handleDelete(cpn.id)} className="cpn-btn-delete">
                                    <FiTrash2 className="cpn-btn-icon" /> حذف
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="cpn-no-coupons">لا توجد كوبونات</p>
                )}
            </div>

            {isModalOpen && (
                <div className="cpn-modal">
                    <div className="cpn-modal-content">
                        <div className="cpn-modal-header">
                            <h3>{editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h3>
                            <button onClick={closeModal} className="cpn-btn-close">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="cpn-form">
                            <div className="cpn-form-group">
                                <label htmlFor="code">كود الكوبون*</label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="أدخل كود الكوبون..."
                                />
                            </div>
                            <div className="cpn-form-group">
                                <label htmlFor="discount">الخصم (%)*</label>
                                <input
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    min="0"
                                    step="0.1"
                                    value={formData.discount}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="أدخل نسبة الخصم..."
                                />
                            </div>
                            <div className="cpn-form-group">
                                <label htmlFor="coupon_usage">عدد الاستخدامات</label>
                                <input
                                    type="number"
                                    id="coupon_usage"
                                    name="coupon_usage"
                                    min="0"
                                    value={formData.coupon_usage}
                                    onChange={handleInputChange}
                                    placeholder="أدخل عدد الاستخدامات..."
                                />
                            </div>
                            <div className="cpn-form-group">
                                <label htmlFor="expiryDate">تاريخ الانتهاء</label>
                                <input
                                    type="date"
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="cpn-form-actions">
                                <button type="submit" className="cpn-btn-save">
                                    {editingCoupon ? 'تحديث الكوبون' : 'إضافة كوبون'}
                                </button>
                                <button type="button" onClick={closeModal} className="cpn-btn-cancel">
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

export default Coupons;