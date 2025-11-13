import React, { useEffect, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import AxiosInstance from '../../../Authentication/AxiosInstance';
import ErrorPage from '../../../components/Loading/ErrorPage';
import Loading from '../../../components/Loading/Loading';
import './Categories.css';
import CategoryCreate from './CategoryCreate';
import CategoryEdit from './CategoryEdit';

const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await AxiosInstance.get(`/products/categories/`);
            setCategories(response.data || []); // Set categories to results array, fallback to empty array
            setIsLoading(false);
        } catch (err) {
            setError('فشل في جلب الفئات');
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
            try {
                await AxiosInstance.delete(`/products/categories/${id}/`);
                setCategories(categories.filter(category => category.id !== id));
            } catch (err) {
                setError('فشل في حذف الفئة');
            }
        }
    };

    const handleCreateSuccess = (newCategory) => {
        setCategories([...categories, newCategory]);
        setShowCreateForm(false);
    };

    const handleUpdateSuccess = (updatedCategory) => {
        setCategories(categories.map(cat =>
            cat.id === updatedCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
    };


    if (isLoading) return <Loading />;
    if (error) return <ErrorPage head='فشل في جلب الفئات' error={error} />;

    return (
        <div className="cat-dashboard">
            <div className="cat-header">
                <h2>إدارة الفئات</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="cat-btn-create"
                >
                    + إنشاء فئة جديدة
                </button>
            </div>

            {showCreateForm && (
                <CategoryCreate
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {editingCategory && (
                <CategoryEdit
                    category={editingCategory}
                    onSuccess={handleUpdateSuccess}
                    onCancel={() => setEditingCategory(null)}
                />
            )}

            <div className="cat-grid">
                {categories.map(category => (
                    <div key={category.id} className="cat-card">
                        {category.image ? (
                            <div className="cat-card-image">
                                <img
                                    src={`${category.image}`}
                                    alt={category.name}
                                />
                            </div>
                        ) : (
                            <div className="cat-card-image cat-card-image-placeholder">
                                <span>لا توجد صورة</span>
                            </div>
                        )}
                        <div className="cat-card-content">
                            <h3 className="cat-card-title">{category.name}</h3>
                            <p className="cat-card-description">
                                {category.description || 'لا يوجد وصف متاح'}
                            </p>
                            <div className="cat-card-meta">
                                <FiCalendar className="cat-card-meta-icon" />
                                <span>
                                    تاريخ الإنشاء: {category.created_at
                                        ? new Date(category.created_at).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'غير متوفر'}
                                </span>
                            </div>
                        </div>
                        <div className="cat-card-actions">
                            <button
                                onClick={() => setEditingCategory(category)}
                                className="cat-btn-edit"
                            >
                                <span>تعديل</span>
                            </button>
                            <button
                                onClick={() => handleDelete(category.id)}
                                className="cat-btn-delete"
                            >
                                <span>حذف</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesList;