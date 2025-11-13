

import React, { useEffect, useState } from 'react';
import { AiOutlineOrderedList, AiOutlinePicLeft } from 'react-icons/ai';
import { CgOptions } from 'react-icons/cg';
import { FiEdit, FiEye, FiFilter, FiSearch, FiTrash2 } from 'react-icons/fi';
import slugify from 'slugify';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import ErrorPage from '../../../../components/Loading/ErrorPage';
import Loading from '../../../../components/Loading/Loading';
import LandingComponents from '../LandingComponents/LandingComponents';
import ProductAttributes from '../ProductAttributes/ProductAttributes';
import ProductDetails from '../ProductDetails/ProductDetails';
import ProductForm from '../ProductForm/ProductForm';
import ProductVariants from '../ProductVariants/ProductVariants';
import styles from './ProductsList.module.css';


const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewingAttributes, setViewingAttributes] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(null);
    const [viewingVariants, setViewingVariants] = useState(null);
    const [viewingComponents, setViewingComponents] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await AxiosInstance.get(`/products/products/`);

            const productsData = Array.isArray(response.data.results)
                ? response.data.results
                : Array.isArray(response.data)
                    ? response.data
                    : [];
            setProducts(productsData);
            setError(null);
        } catch (err) {
            setError('فشل في جلب المنتجات');
            console.error('Fetch products error:', err.response?.data || err.message);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await AxiosInstance.get('/products/categories/');

            const categoriesData = Array.isArray(response.data.results)
                ? response.data.results
                : Array.isArray(response.data)
                    ? response.data
                    : [];
            setCategories(categoriesData);
        } catch (err) {
            console.error('Fetch categories error:', err.response?.data || err.message);
            setCategories([]);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟');
        if (!confirmDelete) return;

        try {
            await AxiosInstance.delete(`/products/products/${id}/`); // Fixed endpoint to match ProductForm
            setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        } catch (err) {
            setError('فشل في حذف المنتج');
            console.error('Delete product error:', err.response?.data || err.message);
        }
    };

    const handleSaveSuccess = () => {
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const filteredProducts = Array.isArray(products)
        ? products.filter(product => {
            const matchesSearch =
                product.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const matchesCategory = selectedCategory
                ? Array.isArray(product.categories) &&
                product.categories.some(cat => cat.id === parseInt(selectedCategory))
                : true;
            const matchesStock =
                stockFilter === 'low'
                    ? product.totalstock <= product.stock_alarm
                    : stockFilter === 'out'
                        ? product.totalstock === 0
                        : true;
            return matchesSearch && matchesCategory && matchesStock;
        })
        : [];

    if (isLoading && !products.length) return <Loading />;
    if (error) return <ErrorPage head='فشل في جلب المنتجات' error={error} />;


    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };

    return (
        <div className={styles.productsDashboard}>
            <div className={styles.dashboardHeader}>
                <h2>إدارة المنتجات</h2>
                <button onClick={() => setShowForm(true)} className={styles.btnCreate}>
                    إضافة منتج جديد
                </button>
            </div>

            <div className={styles.searchFilterBar}>
                <div className={styles.searchBox}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <FiFilter className={styles.filterIcon} />
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="">جميع الفئات</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <FiFilter className={styles.filterIcon} />
                    <select
                        value={stockFilter}
                        onChange={e => setStockFilter(e.target.value)}
                    >
                        <option value="">جميع المخزون</option>
                        <option value="low">مخزون منخفض</option>
                        <option value="out">نفد المخزون</option>
                    </select>
                </div>
            </div>

            {(showForm || editingProduct) && (
                <ProductForm
                    product={editingProduct}
                    categories={categories}
                    products={products}
                    onSuccess={handleSaveSuccess}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                />
            )}

            {viewingAttributes && (
                <ProductAttributes
                    product={viewingAttributes}
                    onClose={() => setViewingAttributes(null)}
                />
            )}

            {viewingDetails && (
                <ProductDetails
                    product={viewingDetails}
                    onClose={() => setViewingDetails(null)}
                />
            )}

            {viewingVariants && (
                <ProductVariants
                    product={viewingVariants}
                    onClose={() => setViewingVariants(null)}
                />
            )}

            {viewingComponents && (
                <LandingComponents
                    product={viewingComponents}
                    onClose={() => setViewingComponents(null)}
                />
            )}

            <div className={styles.productsTableContainer}>
                <table className={styles.productsTable}>
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>العنوان</th>
                            <th>التكلفة</th>
                            <th >سعر الأساس</th>
                            <th>الخصم</th>
                            <th>المخزون</th>
                            <th>الفئات</th>
                            <th>تاريخ الإنشاء</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td>
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className={styles.productThumbnail}
                                        />
                                    )}
                                </td>
                                <td>
                                    <strong>{product.title}</strong>
                                    {product.description && (
                                        <p className={styles.productDescription}>
                                            {product.description.substring(0, 10)}...
                                        </p>
                                    )}
                                </td>
                                <td>${product.cost}</td>
                                <td>${product.base_price}</td>
                                <td>{product.discount}%</td>
                                <td
                                    className={
                                        product.totalstock <= product.stock_alarm
                                            ? styles.lowStock
                                            : ''
                                    }  >

                                    {product.totalstock}
                                </td>
                                <td>


                                    {Array.isArray(product.categories) && product.categories.length > 0 ? (
                                        <span className={styles.categoryTag}>
                                            {product.categories[0].name}
                                            {product.categories.length > 1 && (
                                                <span className={styles.moreCategories}> + {product.categories.length - 1} </span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className={styles.noCategory}>لا توجد فئات</span>
                                    )}

                                </td>
                                <td>{new Date(product.created_at).toLocaleDateString('ar-EG')}</td>
                                <td className={styles.actionsCell}>
                                    <button
                                        onClick={() => setEditingProduct(product)}
                                        className={styles.btnEdit}
                                        title="تعديل"
                                    >
                                        <FiEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className={styles.btnDelete}
                                        title="حذف"
                                    >
                                        <FiTrash2 />
                                    </button>
                                    <button
                                        onClick={() => setViewingAttributes(product)}
                                        className={styles.btnSecondary}
                                        title="السمات"
                                    >
                                        <AiOutlineOrderedList />
                                    </button>
                                    <button
                                        onClick={() => setViewingVariants(product)}
                                        className={styles.btnSecondary}
                                        title="المتغيرات"
                                    >
                                        <CgOptions />
                                    </button>
                                    <button
                                        onClick={() => setViewingComponents(product)}
                                        className={styles.btnSecondary}
                                        title="مكونات الصفحة"
                                    >
                                        <AiOutlinePicLeft />
                                    </button>

                                    {product && product.id && (
                                        <a
                                            href={`/products/${formatTitleForUrl(product.title)}/${product.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <button
                                                className={styles.btnSecondary}
                                                title="التفاصيل"
                                            >
                                                <FiEye />
                                            </button>
                                        </a>
                                    )}



                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsList;