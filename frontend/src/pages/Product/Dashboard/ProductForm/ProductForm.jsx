import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import styles from './ProductForm.module.css';

const ProductForm = ({ product, categories = [], products = [], onSuccess, onCancel }) => {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        id: product?.id || null,
        title: product?.title || '',
        description: product?.description || '',
        theme: product?.theme || 'amazon',
        code: product?.code || '',
        isNot: product?.isNot || false,
        isSize: product?.isSize || false,
        isColor: product?.isColor || false,
        youtube_url: product?.youtube_url || '',
        base_price: product?.base_price || 0,
        discount: product?.discount || 0,
        cost: product?.cost || 0,
        totalstock: product?.totalstock || 0,
        stock_alarm: product?.stock_alarm || 0,
        categories: product?.categories?.map(c => c.id) || [],
        related_products: product?.related_products || [],
    });

    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (product) {
            setFormData({
                id: product.id,
                title: product.title,
                description: product.description,
                theme: product.theme,
                code: product.code,
                isNot: product.isNot,
                isSize: product.isSize,
                isColor: product.isColor,
                youtube_url: product.youtube_url || '',
                base_price: product.base_price || 0,
                discount: product.discount,
                cost: product.cost,
                totalstock: product.totalstock,
                stock_alarm: product.stock_alarm,
                categories: product.categories?.map(c => c.id) || [],
                related_products: product.related_products || [],
            });
        }
    }, [product]);

    useEffect(() => {
        const filtered = products
            .filter(p => p.id !== formData.id && p.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(p => ({
                value: p.id,
                label: `${p.title} (${p.code})`,
                ...p
            }));
        setFilteredProducts(filtered);
    }, [searchTerm, products, formData.id]);

    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleCategoriesChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            categories: selectedOptions ? selectedOptions.map(option => option.value) : [],
        }));
    };

    const handleRelatedProductsChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            related_products: selectedOptions ? selectedOptions.map(option => option.value) : [],
        }));
    };

    const handleSearchChange = (inputValue) => {
        setSearchTerm(inputValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('العنوان مطلوب');
            return;
        }
        if (formData.base_price < 0) {
            setError('سعر الأساس يجب أن يكون أكبر من أو يساوي 0');
            return;
        }
        if (!formData.cost || formData.cost < 0) {
            setError('التكلفة يجب أن تكون أكبر من أو تساوي 0');
            return;
        }
        if (!formData.totalstock || formData.totalstock < 0) {
            setError('إجمالي المخزون يجب أن يكون أكبر من أو يساوي 0');
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            const fields = [
                'title', 'description', 'theme', 'isNot', 'isSize', 'isColor',
                'youtube_url', 'base_price', 'discount', 'cost', 'totalstock', 'stock_alarm'
            ];
            fields.forEach(field => {
                formDataToSend.append(field, formData[field]);
            });

            formData.categories.forEach(id => {
                formDataToSend.append('categories_ids', id);
            });

            formData.related_products.forEach(id => {
                formDataToSend.append('related_products', id);
            });

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            if (isEditing) {
                formDataToSend.append('id', formData.id);
                formDataToSend.append('code', formData.code);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            };

            let response;
            if (isEditing) {
                response = await AxiosInstance.patch(`/products/products/${formData.id}/`, formDataToSend, config);
            } else {
                response = await AxiosInstance.post(`/products/products/`, formDataToSend, config);
            }


            onSuccess(response.data);
        } catch (err) {
            const errorDetail = err.response?.data?.details || err.response?.data;
            if (typeof errorDetail === 'object') {
                const errorMessages = Object.entries(errorDetail)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('; ');
                setError(errorMessages);
            } else {
                setError(errorDetail || 'فشل في حفظ المنتج');
            }
            console.error('Submit error:', err.response?.data || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSelectedRelatedProducts = () => {
        return products.filter(p => formData.related_products.includes(p.id) && p.id !== formData.id);
    };

    const categoryOptions = categories.map(category => ({
        value: category.id,
        label: category.name,
    }));

    return (
        <div className={styles.productFormModal}>
            <div className={styles.productFormContainer}>
                <div className={styles.modalHeader}>
                    <h3>{isEditing ? 'تعديل المنتج' : 'إنشاء منتج جديد'}</h3>
                    <button onClick={onCancel} className={styles.btnClose}>×</button>
                </div>

                {error && <div className={styles.formError}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title">العنوان*</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="theme">الثيم*</label>
                            <select
                                id="theme"
                                name="theme"
                                value={formData.theme}
                                onChange={handleChange}
                                required
                                className={styles.selectField}
                            >
                                <option value="amazon">أمازون</option>
                                {/* <option value="simple">بسيط</option>
                                <option value="modern">مودرن</option>
                                <option value="classic">كلاسيك</option> */}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="base_price">سعر الأساس*</label>
                            <input
                                type="number"
                                id="base_price"
                                name="base_price"
                                min="0"
                                step="0.01"
                                value={formData.base_price}
                                onChange={handleChange}
                                required
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="cost">التكلفة*</label>
                            <input
                                type="number"
                                id="cost"
                                name="cost"
                                min="0"
                                step="0.01"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="discount">الخصم (%)</label>
                            <input
                                type="number"
                                id="discount"
                                name="discount"
                                min="0"
                                max="100"
                                value={formData.discount}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="totalstock">إجمالي المخزون*</label>
                            <input
                                type="number"
                                id="totalstock"
                                name="totalstock"
                                min="0"
                                value={formData.totalstock}
                                onChange={handleChange}
                                required
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="stock_alarm">تنبيه المخزون</label>
                            <input
                                type="number"
                                id="stock_alarm"
                                name="stock_alarm"
                                min="0"
                                value={formData.stock_alarm}
                                onChange={handleChange}
                                className={styles.inputField}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">الوصف</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className={styles.textareaField}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="youtube_url">رابط يوتيوب</label>
                        <input
                            type="url"
                            id="youtube_url"
                            name="youtube_url"
                            value={formData.youtube_url}
                            onChange={handleChange}
                            placeholder="https://youtube.com/..."
                            className={styles.inputField}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image">صورة المنتج</label>
                        <div className={styles.fileUploadContainer}>
                            <label htmlFor="image" className={styles.fileUploadLabel}>
                                {imageFile ? imageFile.name : 'اختر ملف'}
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={styles.fileInput}
                                />
                            </label>
                        </div>
                        {product?.image && !imageFile && (
                            <div className={styles.currentImage}>
                                <img src={product.image} alt="Current product" />
                            </div>
                        )}
                    </div>

                    <div className={styles.formSection}>
                        <h4 className={styles.sectionTitle}>خيارات المنتج</h4>
                        <div className={styles.checkboxGroup}>
                            <div className={styles.checkboxContainer}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        id="isNot"
                                        name="isNot"
                                        checked={formData.isNot}
                                        onChange={handleChange}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.checkboxCustom}></span>
                                    يحتوي على ملاحظة
                                </label>
                            </div>
                            <div className={styles.checkboxContainer}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        id="isSize"
                                        name="isSize"
                                        checked={formData.isSize}
                                        onChange={handleChange}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.checkboxCustom}></span>
                                    يحتوي على متغيرات المقاس
                                </label>
                            </div>
                            <div className={styles.checkboxContainer}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        id="isColor"
                                        name="isColor"
                                        checked={formData.isColor}
                                        onChange={handleChange}
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.checkboxCustom}></span>
                                    يحتوي على متغيرات اللون
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h4 className={styles.sectionTitle}>الفئات</h4>
                        <div className={styles.formGroup}>
                            <Select
                                isMulti
                                options={categoryOptions}
                                value={categoryOptions.filter(option => formData.categories.includes(option.value))}
                                onChange={handleCategoriesChange}
                                placeholder="اختر الفئات..."
                                noOptionsMessage={() => "لا توجد فئات متاحة"}
                                className={styles.reactSelectContainer}
                                classNamePrefix="react-select"
                                getOptionLabel={option => option.label}
                                getOptionValue={option => option.value}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h4 className={styles.sectionTitle}>المنتجات المرتبطة</h4>
                        <div className={styles.formGroup}>
                            <Select
                                isMulti
                                options={filteredProducts}
                                value={filteredProducts.filter(option => formData.related_products.includes(option.value))}
                                onChange={handleRelatedProductsChange}
                                onInputChange={handleSearchChange}
                                inputValue={searchTerm}
                                placeholder="ابحث عن المنتجات المرتبطة..."
                                noOptionsMessage={() => "لا توجد منتجات متاحة"}
                                className={styles.reactSelectContainer}
                                classNamePrefix="react-select"
                                getOptionLabel={option => option.label}
                                getOptionValue={option => option.value}
                            />
                            {formData.related_products.length > 0 && (
                                <div className={styles.selectedRelatedProducts}>
                                    <h5 className={styles.selectedTitle}>المنتجات المختارة:</h5>
                                    <ul className={styles.selectedList}>
                                        {getSelectedRelatedProducts().map(product => (
                                            <li key={product.id} className={styles.selectedItem}>
                                                {product.title} ({product.code})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="submit"
                            className={styles.btnSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className={styles.buttonLoader}></span>
                            ) : isEditing ? 'تحديث المنتج' : 'إنشاء المنتج'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className={styles.btnCancel}
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;