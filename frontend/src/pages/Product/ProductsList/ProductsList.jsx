import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import slugify from 'slugify';
import AxiosInstance from '../../../Authentication/AxiosInstance';
import Config from '../../../Authentication/config';
import { useTrackEvents } from '../../../Pixels/hooks/useTrackEvents';
import './ProductsList.css';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { trackEvent } = useTrackEvents();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await AxiosInstance.get('/products/products-list/');
                setProducts(response.data);
                setLoading(false);
            } catch (err) {
                setError('فشل في جلب المنتجات');
                setLoading(false);
                console.error('Error fetching products:', err);
            }
        };

        fetchProducts();
    }, []);

    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };



    const handleView = (product) => {
        trackEvent('ViewContent', {
            id: product.id,
            name: product.title,
            price: product.base_price,
            currency: product.currency,
        });
        navigate(`/products/${formatTitleForUrl(product.title)}/${product.id}`);
    };


    if (loading) return <div>جارٍ التحميل...</div>;
    if (error && !products.length) return <div>{error}</div>;

    return (
        <div className="related-wrapper">
            <div className="related-header">
                <div className="line" />
                <h2 className="related-title">المنتجات</h2>
                <div className="line" />
            </div>

            <div className="related-products">
                {products.length === 0 ? (
                    <p>لا توجد منتجات متاحة</p>
                ) : (
                    products.map((product) => (
                        <div className="rp-card" key={product.id}>
                            <div className="rp-image-wrapper">
                                <Link to={`/products/${formatTitleForUrl(product.title)}/${product.id}`}>
                                    <img
                                        src={`${Config.baseURL}${product?.image}`}
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
                                        <button
                                            onClick={() => handleView(product)}
                                            className="rp-more"
                                        >
                                            عرض المزيد
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


        </div>
    );
};

export default ProductsList;