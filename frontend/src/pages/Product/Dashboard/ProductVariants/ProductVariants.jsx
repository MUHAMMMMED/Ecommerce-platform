
import React, { useCallback, useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';
import { FiEdit, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import styles from './ProductVariants.module.css';

const ProductVariants = ({ product, onClose }) => {
    const [variants, setVariants] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [newVariant, setNewVariant] = useState({
        size: '',
        color: '',
        price: '',
        stock: '',
        image: null,
    });
    const [newSize, setNewSize] = useState({ name: '', cost: 0 });
    const [newColor, setNewColor] = useState({ name: '', hex_code: '#000000', cost: 0 });
    const [editingVariant, setEditingVariant] = useState(null);
    const [editingSize, setEditingSize] = useState(null);
    const [editingColor, setEditingColor] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showSizeForm, setShowSizeForm] = useState(false);
    const [showColorForm, setShowColorForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Memoized fetch functions
    const fetchVariants = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await AxiosInstance.get(`/products/${product.id}/variants/`);
            setVariants(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            setError('فشل في جلب المتغيرات');
            console.error('Fetch variants error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    }, [product.id]);

    const fetchSizes = useCallback(async () => {
        try {
            const response = await AxiosInstance.get(`/products/sizes/?product=${product.id}`);
            setSizes(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            setError('فشل في جلب المقاسات');
            console.error('Fetch sizes error:', err.response?.data || err.message);
        }
    }, [product.id]);

    const fetchColors = useCallback(async () => {
        try {
            const response = await AxiosInstance.get(`/products/colors/?product=${product.id}`);
            const validColors = Array.isArray(response.data)
                ? response.data.map(color => ({
                    ...color,
                    hex_code: color.hex_code || '#000000',
                }))
                : [];
            setColors(validColors);
            setError('');
        } catch (err) {
            setError('فشل في جلب الألوان');
            console.error('Fetch colors error:', err.response?.data || err.message);
        }
    }, [product.id]);

    // Initial data fetch
    useEffect(() => {
        Promise.all([fetchVariants(), fetchSizes(), fetchColors()]).catch(err => {
            console.error('Initial fetch error:', err);
        });
    }, [fetchVariants, fetchSizes, fetchColors]);

    // Check if a variant with the same size and color exists
    const isDuplicateVariant = (size, color, excludeVariantId = null) => {
        return variants.some(v =>
            v.size?.id === (size || null) &&
            v.color?.id === (color || null) &&
            v.id !== excludeVariantId
        );
    };

    // Get available sizes and colors based on all existing variants
    const getAvailableSizes = () => {
        if (editingVariant) {
            // When editing, allow the current variant's size unless it's used with a different color
            return sizes.map(size => {
                const isUsed = variants.some(v =>
                    v.size?.id === size.id &&
                    v.color?.id === newVariant.color &&
                    v.id !== editingVariant.id
                );
                return {
                    ...size,
                    disabled: isUsed,
                };
            });
        } else {
            // When creating a new variant, disable sizes used in any existing variant
            return sizes.map(size => ({
                ...size,
                disabled: variants.some(v => v.size?.id === size.id),
            }));
        }
    };

    const getAvailableColors = () => {
        if (editingVariant) {
            // When editing, allow the current variant's color unless it's used with a different size
            return colors.map(color => {
                const isUsed = variants.some(v =>
                    v.color?.id === color.id &&
                    v.size?.id === newVariant.size &&
                    v.id !== editingVariant.id
                );
                return {
                    ...color,
                    disabled: isUsed,
                };
            });
        } else {
            // When creating a new variant, disable colors used in any existing variant
            return colors.map(color => ({
                ...color,
                disabled: variants.some(v => v.color?.id === color.id),
            }));
        }
    };

    const handleAddOrUpdateVariant = async (e) => {
        e.preventDefault();

        if (!newVariant.price || !newVariant.stock) {
            setError('السعر والمخزون مطلوبان');
            return;
        }

        // Check for duplicate size/color combination
        if (isDuplicateVariant(newVariant.size || null, newVariant.color || null, editingVariant?.id)) {
            setError('هذا المقاس واللون مستخدمان بالفعل لهذا المنتج');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('product', product.id);
            if (newVariant.size) formData.append('size', newVariant.size);
            if (newVariant.color) formData.append('color', newVariant.color);
            formData.append('price', newVariant.price);
            formData.append('stock', newVariant.stock);
            if (newVariant.image) formData.append('image', newVariant.image);

            let response;
            if (editingVariant) {
                response = await AxiosInstance.patch(`/products/variants/${editingVariant.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setVariants(variants.map(v => (v.id === editingVariant.id ? response.data : v)));
                setEditingVariant(null);
            } else {
                response = await AxiosInstance.post(`/products/${product.id}/variants/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setVariants(prev => [...prev, response.data]);
            }
            setNewVariant({ size: '', color: '', price: '', stock: '', image: null });
            setError('');
            await fetchVariants(); // Refresh variants
        } catch (err) {
            setError(`فشل في ${editingVariant ? 'تحديث' : 'إضافة'} المتغير: ${err.response?.data?.detail || err.message}`);
            console.error('Add/Update variant error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddOrUpdateSize = async (e) => {
        e.preventDefault();
        if (!newSize.name) {
            setError('اسم المقاس مطلوب');
            return;
        }
        try {
            const sizeData = { ...newSize, product: product.id };
            let response;
            if (editingSize) {
                response = await AxiosInstance.patch(`/products/sizes/${editingSize.id}/`, sizeData);
                setSizes(sizes.map(s => (s.id === editingSize.id ? response.data : s)));
                setEditingSize(null);
            } else {
                response = await AxiosInstance.post(`/products/sizes/`, sizeData);
                setSizes(prev => [...prev, response.data]);
                setNewVariant(prev => ({ ...prev, size: response.data.id }));
            }
            setNewSize({ name: '', cost: 0 });
            setShowSizeForm(false);
            setError('');
            await fetchSizes(); // Refresh sizes
        } catch (err) {
            setError(`فشل في ${editingSize ? 'تحديث' : 'إضافة'} المقاس: ${err.response?.data?.detail || err.message}`);
            console.error('Size error:', err.response?.data || err.message);
        }
    };

    const handleAddOrUpdateColor = async (e) => {
        e.preventDefault();
        if (!newColor.name || !newColor.hex_code) {
            setError('اسم اللون وكود الهيكس مطلوبان');
            return;
        }

        try {
            const colorData = { ...newColor, product: product.id };
            let response;
            if (editingColor) {
                response = await AxiosInstance.patch(`/products/colors/${editingColor.id}/`, colorData);
                setColors(colors.map(c => (c.id === editingColor.id ? response.data : c)));
                setEditingColor(null);
            } else {
                response = await AxiosInstance.post(`/products/colors/`, colorData);
                setColors(prev => [...prev, response.data]);
                setNewVariant(prev => ({ ...prev, color: response.data.id }));
            }
            setNewColor({ name: '', hex_code: '#000000', cost: 0 });
            setShowColorPicker(false);
            setShowColorForm(false);
            setError('');
            await fetchColors(); // Refresh colors
        } catch (err) {
            setError(`فشل في ${editingColor ? 'تحديث' : 'إضافة'} اللون: ${err.response?.data?.detail || err.message}`);
            console.error('Color error:', err.response?.data || err.message);
        }
    };

    const handleEditVariant = (variant) => {
        setEditingVariant(variant);
        setNewVariant({
            size: variant.size?.id || '',
            color: variant.color?.id || '',
            price: variant.price || '',
            stock: variant.stock || '',
            image: null,
        });
        setError('');
    };

    const handleEditSize = (size) => {
        setEditingSize(size);
        setNewSize({
            name: size.name || '',
            cost: size.cost || 0,
        });
        setShowSizeForm(true);
        setShowColorForm(false);
        setError('');
    };

    const handleEditColor = (color) => {
        setEditingColor(color);
        setNewColor({
            name: color.name || '',
            hex_code: color.hex_code || '#000000',
            cost: color.cost || 0,
        });
        setShowColorForm(true);
        setShowSizeForm(false);
        setError('');
    };

    const handleDeleteVariant = async (id) => {
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المتغير؟')) return;
        setIsLoading(true);
        try {
            await AxiosInstance.delete(`/products/variants/${id}/`);
            setVariants(variants.filter(v => v.id !== id));
            setError('');
            await fetchVariants(); // Refresh variants
        } catch (err) {
            setError('فشل في حذف المتغير');
            console.error('Delete variant error:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSize = async (id) => {
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المقاس؟')) return;
        try {
            await AxiosInstance.delete(`/products/sizes/${id}/`);
            setSizes(sizes.filter(s => s.id !== id));
            setNewVariant(prev => ({ ...prev, size: prev.size === id ? '' : prev.size }));
            setError('');
            await fetchSizes(); // Refresh sizes
        } catch (err) {
            setError('فشل في حذف المقاس');
            console.error('Delete size error:', err.response?.data || err.message);
        }
    };
    const handleDeleteColor = async (id) => {
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا اللون؟')) return;
        try {
            await AxiosInstance.delete(`/products/colors/${id}/`);
            setColors(colors.filter(c => c.id !== id));
            setNewVariant(prev => ({ ...prev, color: prev.color === id ? '' : prev.color }));
            setError('');
            await fetchColors(); // Refresh colors
        } catch (err) {
            setError('فشل في حذف اللون');
            console.error('Delete color error:', err.response?.data || err.message);
        }
    };

    if (isLoading) return <div className={styles.loadingSpinner}>جارٍ التحميل...</div>;

    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();

    return (
        <div className={styles.variantsModal}>
            <div className={styles.variantsContainer}>
                <div className={styles.modalHeader}>
                    <h3>متغيرات المنتج: {product.title}</h3>
                    <button onClick={onClose} className={styles.btnClose}>
                        <FiX size={20} />
                    </button>
                </div>

                {error && <div className={styles.formError}>{error}</div>}

                <form onSubmit={handleAddOrUpdateVariant} className={styles.addVariantForm}>
                    <h4>{editingVariant ? 'تعديل المتغير' : 'إضافة متغير جديد'}</h4>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>المقاس</label>
                            <div className={styles.selectWithAdd}>
                                <select
                                    value={newVariant.size}
                                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                                >
                                    <option value="">اختر المقاس (اختياري)</option>
                                    {availableSizes.map(size => (
                                        <option
                                            key={size.id}
                                            value={size.id}
                                            disabled={size.disabled}
                                            title={size.disabled ? 'هذا المقاس مستخدم في متغير موجود' : ''}
                                        >
                                            {size.name}{size.disabled ? ' (مستخدم)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className={styles.btnAddOption}
                                    onClick={() => {
                                        setNewSize({ name: '', cost: 0 });
                                        setEditingSize(null);
                                        setShowSizeForm(true);
                                    }}
                                    title="إدارة المقاسات"
                                >
                                    <FiEdit size={16} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>اللون</label>
                            <div className={styles.selectWithAdd}>
                                <select
                                    value={newVariant.color}
                                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                >
                                    <option value="">اختر اللون (اختياري)</option>
                                    {availableColors.map(color => (
                                        <option
                                            key={color.id}
                                            value={color.id}
                                            disabled={color.disabled}
                                            title={color.disabled ? 'هذا اللون مستخدم في متغير موجود' : ''}
                                        >
                                            {color.name}{color.disabled ? ' (مستخدم)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className={styles.btnAddOption}
                                    onClick={() => {
                                        setNewColor({ name: '', hex_code: '#000000', cost: 0 });
                                        setEditingColor(null);
                                        setShowColorForm(true);
                                    }}
                                    title="إدارة الألوان"
                                >
                                    <FiEdit size={16} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>السعر *</label>
                            <input
                                type="number"
                                value={newVariant.price}
                                onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>المخزون *</label>
                            <input
                                type="number"
                                value={newVariant.stock}
                                onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                                min="0"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>صورة</label>
                            <div className={styles.fileUpload}>
                                <label>
                                    {newVariant.image ? newVariant.image.name : 'اختر ملف (اختياري)'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewVariant({
                                            ...newVariant,
                                            image: e.target.files[0],
                                        })}
                                        hidden
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
                            {isLoading ? 'جارٍ الحفظ...' : (
                                <>
                                    {editingVariant ? (
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
                        {editingVariant && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewVariant({ size: '', color: '', price: '', stock: '', image: null });
                                    setEditingVariant(null);
                                    setError('');
                                }}
                                className={styles.btnSecondary}
                            >
                                إلغاء
                            </button>
                        )}
                    </div>
                </form>

                {showSizeForm && (
                    <div className={styles.addOptionForm}>
                        <div className={styles.optionFormHeader}>
                            <h5>{editingSize ? 'تعديل المقاس' : 'إضافة مقاس جديد'}</h5>
                            <button
                                onClick={() => setShowSizeForm(false)}
                                className={styles.btnCloseOption}
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddOrUpdateSize}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>اسم المقاس *</label>
                                    <input
                                        type="text"
                                        value={newSize.name}
                                        onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                                        required
                                    />
                                </div>
                                {/* <div className={styles.formGroup}>
                                    <label>المخزون</label>
                                    <input
                                        type="number"
                                        value={newSize.cost}
                                        onChange={(e) => setNewSize({ ...newSize, cost: e.target.value })}
                                        min="0"
                                    />
                                </div> */}
                            </div>

                            <div className={styles.formActions}>
                                <button type="submit" className={styles.btnPrimary}>
                                    <FiSave size={16} style={{ marginLeft: '8px' }} />
                                    {editingSize ? 'تحديث' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSizeForm(false)}
                                    className={styles.btnSecondary}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>

                        {sizes.length > 0 && (
                            <div className={styles.optionsList}>
                                <h6>المقاسات المتاحة</h6>
                                <div className={styles.optionsGrid}>
                                    {sizes.map(size => (
                                        <div key={size.id} className={styles.optionItem}>
                                            <span>{size.name}</span>
                                            <span>+{size.cost}  </span>
                                            <div className={styles.optionActions}>
                                                {/* <button
                                                    onClick={() => handleEditSize(size)}
                                                    className={styles.btnEditSmall}
                                                    title="تعديل"
                                                >
                                                    <FiEdit size={14} />
                                                </button> */}
                                                <button
                                                    onClick={() => handleDeleteSize(size.id)}
                                                    className={styles.btnDeleteSmall}
                                                    title="حذف"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showColorForm && (
                    <div className={styles.addOptionForm}>
                        <div className={styles.optionFormHeader}>
                            <h5>{editingColor ? 'تعديل اللون' : 'إضافة لون جديد'}</h5>
                            <button
                                onClick={() => setShowColorForm(false)}
                                className={styles.btnCloseOption}
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddOrUpdateColor}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>اسم اللون *</label>
                                    <input
                                        type="text"
                                        value={newColor.name}
                                        onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>كود اللون *</label>
                                    <div className={styles.colorPickerWrapper}>
                                        <input
                                            type="text"
                                            value={newColor.hex_code}
                                            onChange={(e) => setNewColor({ ...newColor, hex_code: e.target.value })}
                                            required
                                        />
                                        <div
                                            className={styles.colorSwatch}
                                            style={{ backgroundColor: newColor.hex_code || '#000000' }}
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                        />
                                        {showColorPicker && (
                                            <div className={styles.colorPicker}>
                                                <ChromePicker
                                                    color={newColor.hex_code}
                                                    onChange={(color) => setNewColor({ ...newColor, hex_code: color.hex })}
                                                />
                                                <button
                                                    type="button"
                                                    className={styles.btnClosePicker}
                                                    onClick={() => setShowColorPicker(false)}
                                                >
                                                    تم
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* <div className={styles.formGroup}>
                                    <label>المخزون</label>
                                    <input
                                        type="number"
                                        value={newColor.cost}
                                        onChange={(e) => setNewColor({ ...newColor, cost: e.target.value })}
                                        min="0"
                                    />
                                </div> */}
                            </div>
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.btnPrimary}>
                                    <FiSave size={16} style={{ marginLeft: '8px' }} />
                                    {editingColor ? 'تحديث' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowColorForm(false)}
                                    className={styles.btnSecondary}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>

                        {colors.length > 0 && (
                            <div className={styles.optionsList}>
                                <h6>الألوان المتاحة</h6>
                                <div className={styles.optionsGrid}>
                                    {colors.map(color => (
                                        <div key={color.id} className={styles.optionItem}>
                                            <div className={styles.colorOption}>
                                                <span>{color.name}</span>
                                                <div
                                                    className={styles.colorSwatchSmall}
                                                    style={{ backgroundColor: color.hex_code || '#000000' }}
                                                />
                                            </div>
                                            <span>+{color.cost}  </span>
                                            <div className={styles.optionActions}>
                                                {/* <button
                                                    onClick={() => handleEditColor(color)}
                                                    className={styles.btnEditSmall}
                                                    title="تعديل"
                                                >
                                                    <FiEdit size={14} />
                                                </button> */}
                                                <button
                                                    onClick={() => handleDeleteColor(color.id)}
                                                    className={styles.btnDeleteSmall}
                                                    title="حذف"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.variantsList}>
                    {variants.length > 0 ? (
                        <div className={styles.variantsGrid}>
                            {variants.map(variant => (
                                <div key={variant.id} className={styles.variantCard}>
                                    <div className={styles.variantImage}>
                                        {variant.image && (
                                            <img src={variant.image} alt="Variant" />
                                        )}
                                    </div>
                                    <div className={styles.variantDetails}>
                                        <div className={styles.variantRow}>
                                            <span className={styles.variantLabel}>السعر:</span>
                                            <span className={styles.variantValue}>{variant.price} </span>
                                        </div>
                                        <div className={styles.variantRow}>
                                            <span className={styles.variantLabel}>المخزون:</span>
                                            <span className={styles.variantValue}>{variant.stock}</span>
                                        </div>
                                        {variant.size && (
                                            <div className={styles.variantRow}>
                                                <span className={styles.variantLabel}>المقاس:</span>
                                                <span className={styles.variantValue}>{variant.size.name}</span>
                                            </div>
                                        )}
                                        {variant.color && (
                                            <div className={styles.variantRow}>
                                                <span className={styles.variantLabel}>اللون:</span>
                                                <div className={styles.colorDisplay}>
                                                    <span className={styles.variantValue}>{variant.color.name}</span>
                                                    <span
                                                        className={styles.colorSwatch}
                                                        style={{ backgroundColor: variant.color.hex_code || '#000000' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.variantActions}>
                                        <button
                                            onClick={() => handleEditVariant(variant)}
                                            className={styles.btnEdit}
                                            title="تعديل"
                                        >
                                            <FiEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteVariant(variant.id)}
                                            className={styles.btnDelete}
                                            title="حذف"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noVariants}>لم يتم العثور على متغيرات لهذا المنتج.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductVariants;