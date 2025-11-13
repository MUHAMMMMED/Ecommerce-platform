
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FaMinus, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { ImHeart } from 'react-icons/im';

import AxiosInstance from '../../../../../Authentication/AxiosInstance';
import { CartContext } from '../../../../../Context/CartContext';
import './Simple.css';

const Simple = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalZoom, setModalZoom] = useState(1);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [showLens, setShowLens] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false); // New: Loading state for favorite
    const [error, setError] = useState(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const imageRef = useRef(null);
    const lensRef = useRef(null);
    const containerRef = useRef(null);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/cart/favorites/check/?product_id=${product.id}`,
                    { withCredentials: true }
                );
                setIsFavorite(response.data.is_favorite);
            } catch (err) {
                console.error('Error checking favorite status:', err.response?.data || err.message);
                if (err.response && err.response.status === 404) {
                    setIsFavorite(false);
                } else {
                    setError('فشل في التحقق من حالة المفضلة');
                    setTimeout(() => setError(null), 3000);
                }
            }
        };
        checkFavoriteStatus();
    }, [product.id]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleQuantityChange = (value) => {
        const newQuantity = quantity + value;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleImageClick = () => {
        setShowModal(true);
    };

    const handleMouseMove = (e) => {
        if (!imageRef.current || !lensRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;

        setCursorPos({ x, y });

        const lensWidth = lensRef.current.offsetWidth;
        const lensHeight = lensRef.current.offsetHeight;

        let lensX = x - lensWidth / 2;
        let lensY = y - lensHeight / 2;

        lensX = Math.max(0, Math.min(lensX, imageRect.width - lensWidth));
        lensY = Math.max(0, Math.min(lensY, imageRect.height - lensHeight));

        lensRef.current.style.left = `${lensX}px`;
        lensRef.current.style.top = `${lensY}px`;

        const bgX = (lensX / imageRect.width) * 100;
        const bgY = (lensY / imageRect.height) * 100;

        imageRef.current.style.transformOrigin = `${bgX}% ${bgY}%`;
    };

    const handleMouseEnter = () => {
        setShowLens(true);
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setShowLens(false);
        setIsZoomed(false);
    };

    const handleModalZoom = (value) => {
        setModalZoom((prev) => Math.max(1, prev + value));
    };

    const toggleFavorite = async () => {
        setIsTogglingFavorite(true); // Start loading
        setError(null);

        try {
            const response = await AxiosInstance.post(
                '/cart/favorites/toggle/',
                { product_id: product.id },
                { withCredentials: true }
            );
            setIsFavorite(response.data.is_favorite);
        } catch (err) {
            console.error('Favorite error:', err.response?.data || err.message);
            let errorMsg = 'فشل في تحديث المفضلة';
            if (err.response) {
                if (err.response.status === 400) {
                    errorMsg = 'بيانات غير صالحة: ' + JSON.stringify(err.response.data);
                } else if (err.response.status === 401) {
                    errorMsg = 'يجب تسجيل الدخول أولاً';
                } else if (err.response.status === 404) {
                    errorMsg = 'المنتج غير موجود';
                }
            }
            setError(errorMsg);
        } finally {
            setIsTogglingFavorite(false); // End loading
        }
    };

    const handleAddToCart = async () => {
        setIsAddingToCart(true);
        setError(null);
        setSuccessMessage(null);

        if (!product?.id) {
            setError('معرف المنتج غير متوفر');
            setIsAddingToCart(false);
            return;
        }

        try {
            await addToCart(product.id, quantity, {
                title: product.title,
                price: product.price,
                image_url: product.image_url,
            });
            setSuccessMessage('تمت إضافة المنتج إلى السلة بنجاح!');
            setNotes('');
            setQuantity(1);
        } catch (err) {
            let errorMsg = 'فشل في إضافة المنتج إلى السلة';
            if (err.response) {
                console.error('Error response:', err.response);
                if (err.response.status === 400) {
                    errorMsg = 'بيانات غير صالحة: ' + JSON.stringify(err.response.data);
                } else if (err.response.status === 401) {
                    errorMsg = 'يجب تسجيل الدخول أولاً';
                } else if (err.response.status === 404) {
                    errorMsg = 'المنتج غير موجود';
                }
            } else if (err.message.includes('Cannot read properties of undefined')) {
                errorMsg = 'خطأ في بيانات المنتج من الخادم';
            }
            setError(errorMsg);
            console.error('Add to cart error:', err);
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <div className="pc-container">
            <div
                className="pc-product-image-container"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleImageClick}
            >
                <img
                    ref={imageRef}

                    src={product.image}
                    alt={product.title}
                    className={`pc-product-image ${isZoomed ? 'pc-zoomed' : ''}`}
                />
                <div className="pc-zoom-lens" ref={lensRef} style={{ display: showLens ? 'block' : 'none' }} />
                <div className="pc-magnifier-icon"><FaSearch /></div>
            </div>

            <div className="pc-product-details-container">
                <h2 className="pc-product-title">{product.title}</h2>
                <h3 className="pc-product-price">{product.price}  </h3>

                <div className="pc-add-to-cart-container">
                    <div className="pc-quantity">
                        <button onClick={() => handleQuantityChange(-1)}><FaMinus /></button>
                        <span>{quantity}</span>
                        <button onClick={() => handleQuantityChange(1)}><FaPlus /></button>
                    </div>

                    <div className="pc-cart-button-wrapper">
                        <button
                            className={`pc-cart-button ${error ? 'pc-error' : ''}`}
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                        >
                            {isAddingToCart ? 'جاري الإضافة...' : 'أضف إلى السلة'}
                        </button>
                    </div>

                    <button
                        className={`pc-favorite-button ${isFavorite ? 'pc-active' : ''}`}
                        onClick={toggleFavorite}
                        disabled={isTogglingFavorite}
                    >
                        {isTogglingFavorite ? 'جاري التحديث...' : <ImHeart />}
                    </button>
                </div>

                {successMessage && (
                    <div className="pc-success-message">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="pc-error-message">
                        {error}
                    </div>
                )}

                <div className="pc-product-description">
                    {product.description || 'لا يوجد وصف متاح'}
                </div>

                <div className="pc-product-specs">
                    {product.attributes?.length > 0 ? (
                        product.attributes.map((attr) => (
                            <div className="pc-spec-row" key={attr.id}>
                                <span className="pc-spec-title">{attr.key}</span>
                                <span className="pc-spec-value">{attr.value || 'غير محدد'}</span>
                            </div>
                        ))
                    ) : (
                        <div>لا توجد مواصفات متاحة</div>
                    )}
                </div>

                <p className="pc-category">
                    التصنيفات: {product.categories?.map((cat) => cat.name).join(', ') || 'لا توجد تصنيفات'}
                </p>
            </div>

            {showModal && (
                <div className="pc-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="pc-modal-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={product.image ? product.image : 'https://via.placeholder.com/150'}
                            alt={product.title}
                            className="pc-modal-image"
                            style={{ transform: `scale(${modalZoom})` }}
                        />
                        <button className="pc-close-button" onClick={() => setShowModal(false)}><FaTimes /></button>
                        <div className="pc-zoom-controls">
                            <button className="pc-zoom-button" onClick={(e) => { e.stopPropagation(); handleModalZoom(-0.2); }}>
                                <FaMinus />
                            </button>
                            <button className="pc-zoom-button" onClick={(e) => { e.stopPropagation(); handleModalZoom(0.2); }}>
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simple;