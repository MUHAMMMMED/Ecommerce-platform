
import React, { useEffect, useState } from 'react';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import styles from './LandingComponents.module.css';

const LandingComponents = ({ product, onClose }) => {
    const [details, setDetails] = useState([]);
    const [newDetail, setNewDetail] = useState({
        title: '',
        html_code: '',
        index: 0,
    });
    const [editingDetail, setEditingDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        fetchDetails();
    }, [product]);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const response = await AxiosInstance.get(`/products/${product.id}/components/`);
            setDetails(Array.isArray(response.data) ? response.data : []);
            setErrorText('');
        } catch (err) {
            setErrorText('فشل في جلب المكونات');
            console.error('Fetch details error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDetail = async (e) => {
        e.preventDefault();
        if (!newDetail.title || !newDetail.html_code) {
            setErrorText('يرجى إدخال العنوان وكود HTML');
            return;
        }

        setIsLoading(true);
        try {
            const response = await AxiosInstance.post(`/products/${product.id}/components/`, {
                ...newDetail,
                product: product.id,
            });
            setDetails([...details, response.data]);
            setNewDetail({ title: '', html_code: '', index: 0 });
            setErrorText('');
        } catch (err) {
            setErrorText('فشل في إضافة المكون');
            console.error('Add detail error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditDetail = (detail) => {
        setEditingDetail(detail);
        setNewDetail({
            title: detail.title,
            html_code: detail.html_code,
            index: detail.index,
        });
        setErrorText('');
    };

    const handleUpdateDetail = async (e) => {
        e.preventDefault();
        if (!newDetail.title || !newDetail.html_code || !editingDetail) {
            setErrorText('يرجى إدخال العنوان وكود HTML');
            return;
        }

        setIsLoading(true);
        try {
            const response = await AxiosInstance.patch(`/products/components/${editingDetail.id}/`, {
                ...newDetail,
                product: product.id,
            });
            setDetails(details.map(detail =>
                detail.id === editingDetail.id ? response.data : detail
            ));
            setNewDetail({ title: '', html_code: '', index: 0 });
            setEditingDetail(null);
            setErrorText('');
        } catch (err) {
            setErrorText('فشل في تحديث المكون');
            console.error('Update detail error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDetail = async (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا المكون؟ لا يمكن التراجع عن هذا الإجراء.');
        if (!confirmDelete) return;

        setIsLoading(true);
        try {
            await AxiosInstance.delete(`/products/components/${id}/`);
            setDetails(details.filter(detail => detail.id !== id));
            setErrorText('');
        } catch (err) {
            setErrorText('فشل في حذف المكون');
            console.error('Delete detail error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveUp = async (detail) => {
        if (detail.index <= 0) return;
        setIsLoading(true);
        try {
            const newIndex = detail.index - 1;
            await AxiosInstance.patch(`/products/components/${detail.id}/`, {
                title: detail.title,
                html_code: detail.html_code,
                index: newIndex,
                product: detail.product,
            });
            setDetails(details
                .map(d => (d.id === detail.id ? { ...d, index: newIndex } : d))
                .sort((a, b) => a.index - b.index));
            setErrorText('');
        } catch (err) {
            setErrorText('فشل في إعادة ترتيب المكونات');
            console.error('Move up error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveDown = async (detail) => {
        if (detail.index >= details.length - 1) return;
        setIsLoading(true);
        try {
            const newIndex = detail.index + 1;
            await AxiosInstance.patch(`/products/components/${detail.id}/`, {
                title: detail.title,
                html_code: detail.html_code,
                index: newIndex,
                product: detail.product,
            });
            setDetails(details
                .map(d => (d.id === detail.id ? { ...d, index: newIndex } : d))
                .sort((a, b) => a.index - b.index));
            setErrorText('');
        } catch (err) {
            setErrorText('فشل في إعادة ترتيب المكونات');
            console.error('Move down error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className={styles.loadingSpinner}>جارٍ التحميل...</div>;
    }

    return (
        <div className={styles.landingModal}>
            <div className={styles.landingContainer}>
                <div className={styles.modalHeader}>
                    <h3>مكونات الصفحة: {product.title}</h3>
                    <button onClick={onClose} className={styles.btnClose}>×</button>
                </div>

                {errorText && <div className={styles.formError}>{errorText}</div>}



                <form onSubmit={editingDetail ? handleUpdateDetail : handleAddDetail} className={styles.addComponentForm}>
                    <h4>{editingDetail ? 'تعديل المكون' : 'إضافة مكون جديد'}</h4>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">العنوان*</label>
                        <input
                            type="text"
                            id="title"
                            value={newDetail.title}
                            onChange={(e) => setNewDetail({ ...newDetail, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="html_code">كود HTML*</label>
                        <textarea
                            id="html_code"
                            value={newDetail.html_code}
                            onChange={(e) => setNewDetail({ ...newDetail, html_code: e.target.value })}
                            rows="6"
                            required
                            placeholder="أدخل كود HTML لتوضيح تفاصيل المنتج (مثال: قائمة، صورة، جدول)"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>معاينة HTML</label>
                        <div
                            className={styles.htmlPreview}
                            dangerouslySetInnerHTML={{ __html: newDetail.html_code }}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="index">ترتيب العرض</label>
                        <input
                            type="number"
                            id="index"
                            min="0"
                            value={newDetail.index}
                            onChange={(e) => setNewDetail({ ...newDetail, index: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btnAdd}>
                            {editingDetail ? 'تحديث المكون' : 'إضافة المكون'}
                        </button>
                        {editingDetail && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewDetail({ title: '', html_code: '', index: 0 });
                                    setEditingDetail(null);
                                    setErrorText('');
                                }}
                                className={styles.btnCancel}
                            >
                                إلغاء
                            </button>
                        )}
                    </div>
                </form>
                <div className={styles.componentsList}>
                    {details.length > 0 ? (
                        <div className={styles.componentsGrid}>
                            {details.map(detail => (
                                <div key={detail.id} className={styles.componentCard}>
                                    <div className={styles.componentHeader}>
                                        <h4>{detail.title}</h4>
                                        <span className={styles.componentIndex}>الترتيب: {detail.index}</span>
                                    </div>
                                    <div
                                        className={styles.componentPreview}
                                        dangerouslySetInnerHTML={{ __html: detail.html_code }}
                                    />
                                    <div className={styles.componentActions}>
                                        <button
                                            onClick={() => handleMoveUp(detail)}
                                            className={styles.btnMoveUp}
                                            disabled={detail.index === 0}
                                            title="نقل للأعلى"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(detail)}
                                            className={styles.btnMoveDown}
                                            disabled={detail.index === details.length - 1}
                                            title="نقل للأسفل"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => handleEditDetail(detail)}
                                            className={styles.btnEdit}
                                            title="تعديل"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDetail(detail.id)}
                                            className={styles.btnDelete}
                                            title="حذف"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noComponents}>لم يتم العثور على مكونات لهذا المنتج.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingComponents;