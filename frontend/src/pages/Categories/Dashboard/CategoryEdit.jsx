
import React, { useEffect, useState } from 'react';
import AxiosInstance from '../../../Authentication/AxiosInstance';
import './Categories.css';

const CategoryEdit = ({ category, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData({
            name: category.name || '',
            description: category.description || '',
            image: null, // نبدأ بـ null لأننا ما بنرسل الصورة القديمة كنص
        });
    }, [category]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData(prev => ({ ...prev, image: files[0] })); // ملف حقيقي
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const response = await AxiosInstance.put(`/products/categories/${category?.id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onSuccess(response.data);
        } catch (err) {
            console.error('❌ Error:', err.response?.data || err.message);
            setError('فشل في تحديث الفئة. تأكد من البيانات أو الصورة.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cat-form-modal">
            <div className="cat-form-container">
                <h3>تعديل الفئة</h3>

                {error && <div className="cat-form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="cat-form-group">
                        <label htmlFor="name">اسم الفئة</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="description">الوصف</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="أدخل وصف الفئة..."
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="image">الصورة (اختياري)</label>
                        <input
                            type="file"
                            accept="image/*"
                            id="image"
                            name="image"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="cat-form-actions">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="cat-btn-cancel"
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="cat-btn-submit"
                            disabled={isSubmitting || !formData.name}
                        >
                            {isSubmitting ? 'جارٍ التحديث...' : 'تحديث الفئة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryEdit;