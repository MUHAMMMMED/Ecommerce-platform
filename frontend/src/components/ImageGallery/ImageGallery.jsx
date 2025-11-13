import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import AxiosInstance from '../../Authentication/AxiosInstance';
import ErrorPage from '../Loading/ErrorPage';
import Loading from '../Loading/Loading';
import './ImageGallery.css';


const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        image: null,
        category_id: '',
        id: null,
    });
    const [newCategoryForm, setNewCategoryForm] = useState({ name: '' });
    const [preview, setPreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch images and categories
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [imagesResponse, categoriesResponse] = await Promise.all([
                AxiosInstance.get(`/media/image-library/`),
                AxiosInstance.get(`/media/image-categories/`),

            ]);
            setImages(imagesResponse.data);
            setCategories(categoriesResponse.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter images based on search and category
    const filteredImages = useMemo(() => {
        let filtered = images;
        if (searchTerm.trim()) {
            filtered = filtered.filter((image) =>
                image.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategoryFilter !== 'all') {
            filtered = filtered.filter((image) => image.category?.id === parseInt(selectedCategoryFilter));
        }
        return filtered;
    }, [searchTerm, selectedCategoryFilter, images]);

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, image: file });

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    // Handle form submission for images
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('category_id', formData.category_id); // Fixed key
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (formData.id) {
                await AxiosInstance.put(`/media/image-library/${formData.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            } else {
                await AxiosInstance.post(`/media/image-library/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            resetForm();
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data
                ? Object.values(err.response.data).flat().join(', ')
                : err.message;
            setError(errorMsg);
        }
    };

    // Handle new category submission
    const handleNewCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await AxiosInstance.post(`/media/image-categories/`, newCategoryForm);
            setCategories([...categories, response.data]);
            setFormData({ ...formData, category_id: response.data.id });
            setIsCategoryModalOpen(false);
            setNewCategoryForm({ name: '' });
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
        }
    };

    // Reset image form
    const resetForm = () => {
        setFormData({ title: '', image: null, category_id: '', id: null });
        setPreview(null);
        setIsFormExpanded(false);
    };

    // Edit image
    const handleEdit = (image) => {
        setFormData({
            title: image.title || '',
            image: null,
            category_id: image.category?.id || '',
            id: image.id || '',
        });
        setPreview(image.image_url ? `${image.image_url}?t=${Date.now()}` : null);
        setIsFormExpanded(true);
    };

    // Delete image
    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            try {
                await AxiosInstance.delete(`/media/image-library/${id}/`);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.detail || err.message);
            }
        }
    };

    // Copy image URL
    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url);
        alert('تم نسخ رابط الصورة إلى الحافظة!');
    };

    // Open image preview
    const openPreview = (image) => {
        setSelectedImage({
            ...image,
            image_url: image.image_url.startsWith('data:')
                ? image.image_url
                : `${image.image_url}?t=${Date.now()}`,
        });
    };

    // Close image preview
    const closePreview = () => setSelectedImage(null);
    if (loading) return <Loading />;
    if (error) return <ErrorPage head="خطأ في تحميل الصور" error={error} />;


    return (
        <div className="gallery-container">
            <h1>معرض الصور</h1>

            {/* Controls: Search, Category Filter, Add/Cancel Button */}
            <div className="gallery-controls">
                <div className="gallery-search-container">
                    <FiSearch className="gallery-search-icon" />
                    <input
                        type="text"
                        placeholder="ابحث عن الصور بالعنوان..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="gallery-category-filter"
                >
                    <option value="all">جميع الفئات</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <button
                    className={`gallery-toggle-form-btn ${isFormExpanded ? 'active' : ''}`}
                    onClick={() => setIsFormExpanded(!isFormExpanded)}
                >
                    {isFormExpanded ? (
                        <>
                            <FiX /> إلغاء
                        </>
                    ) : (
                        <>
                            <FiPlus /> إضافة صورة
                        </>
                    )}
                </button>
            </div>

            {/* Image Upload/Edit Form */}
            {isFormExpanded && (
                <form onSubmit={handleSubmit} className="gallery-form">
                    <div className="gallery-form-row">
                        <div className="gallery-form-group">
                            <label>عنوان الصورة</label>
                            <input
                                type="text"
                                placeholder="أدخل عنوان الصورة..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="gallery-form-group">
                            <label>الفئة</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                required
                            >
                                <option value="">اختر الفئة</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                                <option value="new">+ إنشاء فئة جديدة</option>
                            </select>
                        </div>
                        {formData.category_id === 'new' && (
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="gallery-new-category-btn"
                            >
                                إنشاء فئة
                            </button>
                        )}
                        <div className="gallery-form-group">
                            <label>الصورة</label>
                            <div className="gallery-file-input-container">
                                <label className="gallery-file-input-label">
                                    {formData.image ? formData.image.name : 'اختر صورة'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required={!formData.id} // Optional for edit
                                        className="gallery-file-input"
                                    />
                                </label>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="gallery-submit-btn"
                            disabled={!formData.title || !formData.category_id}
                        >
                            {formData.id ? 'تحديث' : 'رفع'}
                        </button>
                    </div>
                    {preview && (
                        <div className="gallery-image-preview">
                            <img
                                src={preview}
                                alt="معاينة"
                                onClick={() => openPreview({ image_url: preview, title: formData.title })}
                            />
                        </div>
                    )}
                </form>
            )}

            {/* New Category Modal */}
            {isCategoryModalOpen && (
                <div className="gallery-modal">
                    <div className="gallery-modal-content">
                        <div className="gallery-modal-header">
                            <h3>إنشاء فئة جديدة</h3>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="gallery-close-modal"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleNewCategorySubmit} className="gallery-category-form">
                            <div className="gallery-form-group">
                                <label htmlFor="name">اسم الفئة*</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newCategoryForm.name}
                                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="gallery-form-actions">
                                <button type="submit" className="gallery-submit-btn">إنشاء</button>
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="gallery-cancel-btn"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Gallery Grid */}
            <div className="gallery-grid">
                {filteredImages.length > 0 ? (
                    filteredImages.map((image) => (
                        <div key={image.id} className="gallery-item">
                            <div className="gallery-image-container" onClick={() => openPreview(image)}>
                                <img
                                    src={`${image.image_url}?t=${Date.now()}`}
                                    alt={image.title || 'صورة'}
                                    loading="lazy"
                                    className="gallery-image"
                                />
                                <div className="gallery-image-overlay">
                                    <h3>{image.title || 'بدون عنوان'} ({image.category?.name || 'بدون فئة'})</h3>
                                    <div className="gallery-image-actions">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyUrl(`${image.image_url}`);
                                            }}
                                            className="gallery-action-btn"
                                            title="نسخ الرابط"
                                        >
                                            ⎘
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(image);
                                            }}
                                            className="gallery-action-btn"
                                            title="تعديل"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(image.id);
                                            }}
                                            className="gallery-action-btn delete"
                                            title="حذف"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="gallery-no-results">
                        {searchTerm || selectedCategoryFilter !== 'all'
                            ? 'لا توجد صور تطابق بحثك'
                            : 'لا توجد صور'}
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="gallery-image-modal" onClick={closePreview}>
                    <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="gallery-close-modal" onClick={closePreview}>
                            ×
                        </button>
                        <img
                            src={selectedImage.image_url}
                            alt={selectedImage.title || 'صورة'}
                            className="gallery-modal-image"
                        />
                        <div className="gallery-image-meta">
                            <h3>
                                {selectedImage.title || 'بدون عنوان'} ({selectedImage.category?.name || 'بدون فئة'})
                            </h3>
                            <button
                                onClick={() => {
                                    handleCopyUrl(selectedImage.image_url);
                                    closePreview();
                                }}
                                className="gallery-copy-url-btn"
                            >
                                نسخ رابط الصورة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;