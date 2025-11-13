
import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import styles from './ProductAttributes.module.css';

const ProductAttributes = ({ product, onClose }) => {
    const [attributes, setAttributes] = useState([]);
    const [newAttribute, setNewAttribute] = useState({ key: '', value: '' });
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttributes();
    }, [product]);

    const fetchAttributes = async () => {
        setIsLoading(true);
        try {
            const response = await AxiosInstance.get(`/products/${product.id}/attributes/`);
            setAttributes(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            setError('فشل في جلب السمات');
            console.error('Fetch attributes error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddOrUpdateAttribute = async (e) => {
        e.preventDefault();
        if (!newAttribute.key || !newAttribute.value) {
            setError('الكلمة المفتاحية والقيمة مطلوبة');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { ...newAttribute, product: product.id };
            let response;
            if (editingAttribute) {
                response = await AxiosInstance.patch(`/products/attributes/${editingAttribute.id}/`, payload);
                setAttributes(attributes.map(attr =>
                    attr.id === editingAttribute.id ? response.data : attr
                ));
                setEditingAttribute(null);
            } else {
                response = await AxiosInstance.post(`/products/${product.id}/attributes/`, payload);
                setAttributes([...attributes, response.data]);
            }
            setNewAttribute({ key: '', value: '' });
            setError('');
        } catch (err) {
            setError(`فشل في ${editingAttribute ? 'تحديث' : 'إضافة'} السمة`);
            console.error('Add/Update attribute error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditAttribute = (attribute) => {
        setEditingAttribute(attribute);
        setNewAttribute({ key: attribute.key, value: attribute.value });
        setError('');
    };

    const handleDeleteAttribute = async (id) => {
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذه السمة؟')) return;
        setIsLoading(true);
        try {
            await AxiosInstance.delete(`/products/attributes/${id}/`);
            setAttributes(attributes.filter(attr => attr.id !== id));
            setError('');
        } catch (err) {
            setError('فشل في حذف السمة');
            console.error('Delete attribute error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className={styles.loadingSpinner}>جارٍ التحميل...</div>;

    return (
        <div className={styles.attributesModal}>
            <div className={styles.attributesContainer}>
                <div className={styles.modalHeader}>
                    <h3>سمات المنتج: {product.title}</h3>
                    <button onClick={onClose} className={styles.btnClose}>
                        <FiX size={20} />
                    </button>
                </div>

                {error && <div className={styles.formError}>{error}</div>}


                <form onSubmit={handleAddOrUpdateAttribute} className={styles.addAttributeForm}>
                    <h4>{editingAttribute ? 'تعديل السمة' : 'إضافة سمة جديدة'}</h4>
                    <div className={styles.formFields}>
                        <div className={styles.formGroup}>
                            <label>الكلمة المفتاحية</label>
                            <input
                                type="text"
                                placeholder="مثال: اللون"
                                value={newAttribute.key}
                                onChange={(e) => setNewAttribute({ ...newAttribute, key: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>القيمة</label>
                            <textarea
                                placeholder="مثال: أحمر"
                                value={newAttribute.value}
                                onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                                required
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btnAdd} disabled={isLoading}>
                            {isLoading ? (
                                'جارٍ الحفظ...'
                            ) : (
                                <>
                                    {editingAttribute ? (
                                        <>
                                            <FiSave size={18} style={{ marginLeft: '8px' }} />
                                            تحديث
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus size={18} style={{ marginLeft: '8px' }} />
                                            إضافة
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                        {editingAttribute && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewAttribute({ key: '', value: '' });
                                    setEditingAttribute(null);
                                    setError('');
                                }}
                                className={styles.btnCancel}
                            >
                                إلغاء
                            </button>
                        )}
                    </div>
                </form>


                <div className={styles.attributesList}>
                    {attributes.length > 0 ? (
                        <div className={styles.attributesContainer}>
                            {attributes.map(attr => (
                                <div key={attr.id} className={styles.attributeCard}>
                                    <div className={styles.attributeContent}>
                                        <div className={styles.attributeKey}>{attr.key}</div>
                                        <div className={styles.attributeValue}>{attr.value}</div>
                                    </div>
                                    <div className={styles.attributeActions}>
                                        <button
                                            onClick={() => handleEditAttribute(attr)}
                                            className={styles.btnEdit}
                                            title="تعديل"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAttribute(attr.id)}
                                            className={styles.btnDelete}
                                            title="حذف"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noAttributes}>لم يتم العثور على سمات لهذا المنتج.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProductAttributes;