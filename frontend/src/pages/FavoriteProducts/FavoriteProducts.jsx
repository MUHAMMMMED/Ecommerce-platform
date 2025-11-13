import React, { useContext, useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import slugify from 'slugify';
import AxiosInstance from '../../Authentication/AxiosInstance';
import FloatingCart from '../../components/FloatingCart/FloatingCart';
import Header from '../../components/Header/Header';
import { CartContext } from '../../Context/CartContext';
import './FavoriteProducts.css';

const FavoriteProducts = () => {
    const { addFavorite, favorites } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteLoading, setFavoriteLoading] = useState({});

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setIsLoading(true);
                const response = await AxiosInstance.get('/cart/favorites/', { withCredentials: true });
                const favoriteProducts = response.data.results.map(fav => ({
                    id: fav.product.id,
                    title: fav.product.title,
                    price: fav.product.discount_price || fav.product.price || fav.product.base_price || 0,
                    image: fav.product.image,
                    is_special: fav.product.is_special || false,
                    variant: fav.product.variant || null,
                    currency: fav.product.currency,
                }));
                setProducts(favoriteProducts);
            } catch (err) {
                setError('فشل في جلب المنتجات المفضلة');
                setTimeout(() => setError(null), 3000);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const toggleFavorite = async (productId) => {
        setFavoriteLoading(prev => ({ ...prev, [productId]: true }));
        try {
            const isFavorite = await addFavorite(productId);
            if (!isFavorite) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success('تم إزالة المنتج من المفضلة');
            } else {
                toast.success('تم إضافة المنتج إلى المفضلة');
            }
        } catch (err) {
            setError('فشل في تحديث المفضلة');
            setTimeout(() => setError(null), 3000);
        } finally {
            setFavoriteLoading(prev => ({ ...prev, [productId]: false }));
        }
    };



    if (isLoading) {
        return <div className="fp-loading">جاري تحميل المنتجات المفضلة...</div>;
    }

    if (!products.length) {
        return (
            <>
                <Header />
                <FloatingCart />
                <div className="fp-empty">
                    <h2 className="fp-title">المنتجات المفضلة</h2>
                    <p>لا توجد منتجات مفضلة حاليًا.</p>
                </div>
            </>
        );
    }

    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true,
        });
    };




    return (
        <>
            <Header />
            <FloatingCart />
            <div className="fp-wrapper">
                <div className="fp-header">
                    <div className="fp-line" />
                    <h2 className="fp-title">المنتجات المفضلة</h2>
                    <div className="fp-line" />
                </div>
                <div className="fp-products">
                    {products.map((product) => (
                        <div className="fp-card" key={product.id}>
                            <div className="fp-image-wrapper">

                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="fp-image"
                                    />
                                )}

                                <button
                                    className={`fp-favorite ${favorites.includes(product.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(product.id)}
                                    disabled={favoriteLoading[product.id]}
                                >
                                    {favoriteLoading[product.id] ? '...' : <FaHeart />}
                                </button>

                            </div>
                            <div className="fp-details">
                                <h3 className="fp-name">{product.title}</h3>
                                {product.is_special && product.variant && (
                                    <div className="fp-variant-details">
                                        {product.variant.size && <span>المقاس: {product.variant.size}</span>}
                                        {product.variant.color && (
                                            <span className="fp-color-detail">
                                                اللون: {product.variant.color.name}
                                                <span
                                                    className="fp-color-swatch"
                                                    style={{ backgroundColor: product.variant.color.hex_code }}
                                                ></span>
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="fp-bottom">
                                    <span className="fp-price">
                                        {parseFloat(product.price).toLocaleString()} {product.currency}
                                    </span>
                                    <Link to={`/products/${formatTitleForUrl(product.title)}/${product.id}`} className="fp-more">
                                        عرض المزيد
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
};

export default FavoriteProducts;