import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FloatingCart from '../../../components/FloatingCart/FloatingCart';
import Header from '../../../components/Header/Header';
import Loading from '../../../components/Loading/Loading';

import AxiosInstance from '../../../Authentication/AxiosInstance';
import Config from '../../../Authentication/config';
import './ProductsList.css';

const Category = () => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch category and products
    useEffect(() => {
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const response = await AxiosInstance.get(`/products/category/${id}/`);
                setCategory(response.data);
                setProducts(response.data.products || []);

            } catch (err) {
                setError('حدث خطأ أثناء تحميل البيانات');
                console.error('Error fetching category:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id]);





    const formatTitleForUrl = (title) => {
        return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    };

    if (loading) return <Loading />;


    return (
        <>
            <Header />
            <FloatingCart />
            <div>
                <img width={"100%"}
                    src={`${Config.baseURL}${category?.image}`}
                    alt={category?.name} />
            </div>

            <div className="related-wrapper">
                <div className="related-header">
                    <div className="line" />
                    <h2 className="related-title">{category?.name || 'التصنيف'}</h2>
                    <div className="line" />
                </div>

                <div className="related-products">
                    {products.length === 0 ? (
                        <p style={{ textAlign: "center" }}>لا توجد منتجات متاحة</p>
                    ) : (
                        products.map((product) => (
                            <div className="rp-card" key={product.id}>
                                <div className="rp-image-wrapper">
                                    <Link to={`/products/${formatTitleForUrl(product.title)}/${product.id}`} className="rp-more">

                                        <img
                                            src={`${Config.MEDIA_URL}${product?.image}`}
                                            alt={product.title}
                                            className="rp-image"
                                        />
                                    </Link>
                                    {/* <button
                                        className={`rp-favorite ${favorites.includes(product.id) ? 'active' : ''}`}
                                        onClick={() => toggleFavorite(product.id)}
                                    >
                                        <FaHeart />
                                    </button> */}
                                    {/* <button
                                        className="rp-add-to-cart"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isAdding[product.id]}
                                    >
                                        {isAdding[product.id] ? 'جاري الإضافة...' : <TbShoppingBagPlus />}
                                    </button> */}
                                </div>
                                <div className="rp-details">
                                    <h3 className="rp-name">{product.title}</h3>
                                    <div className="rp-bottom">
                                        <div className="rp-price-wrapper">
                                            {product.discount > 0 ? (
                                                <>
                                                    <span className="rp-old-price">
                                                        {parseFloat(product.base_price).toLocaleString()} {product.currency}
                                                    </span>
                                                    <span className="rp-price">
                                                        {(product.base_price * (1 - product.discount / 100)).toFixed(2)} {product.currency}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="rp-price">
                                                    {parseFloat(product.base_price).toLocaleString()} {product.currency}
                                                </span>
                                            )}
                                        </div>
                                        {product && product.id && (
                                            <Link to={`/products/${formatTitleForUrl(product.title)}/${product.id}`} className="rp-more">

                                                عرض المزيد
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    );
};

export default Category;