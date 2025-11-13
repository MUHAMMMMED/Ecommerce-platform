
import React, { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { TbBrandYoutubeFilled } from 'react-icons/tb';
import MediumZoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import Config from '../../../../../Authentication/config';
import { CartContext } from '../../../../../Context/CartContext';
import { useTrackEvents } from '../../../../../Pixels/hooks/useTrackEvents';
import './AmazonStyle.css';
import Categories from './Categories/Categories';
import RelatedProducts from './RelatedProducts/RelatedProducts';

const normalizeCurrency = (currency) => {
    const map = {
        "ريال": "SAR",
        "SAR": "SAR",
        "درهم": "AED",
        "AED": "AED",
        "EGP": "EGP",
        "USD": "USD",
    };
    return map[currency] || "SAR"; // fallback
};

const Amazon = ({ product }) => {
    const { trackEvent } = useTrackEvents();
    // أضف useEffect للتمرير إلى الأعلى عند تحميل الكومبوننت
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // تمرير سلس (اختياري)
        });
    }, []); // المصفوفة الفارغة تعني أن هذا يحدث مرة واحدة عند تحميل الكومبوننت




    const { addToCart, addFavorite, favorites } = useContext(CartContext);

    const createSafeProduct = () => ({
        id: null,
        image: '',
        title: 'منتج غير معروف',
        base_price: 0,
        variants: [],
        isNot: false,
        isSize: false,
        isColor: false,
        description: '',
        related_products: [],
        youtube_url: '',
        totalstock: 0,
        currency: 'درهم',
        product_original_price: 0,
        product_discounted_price: 0,
        product_discount_percentage: 0,
        product_saved_amount: 0,
        code: 'N/A',
    });

    const safeProduct = product || createSafeProduct();
    const [selectedVariant, setSelectedVariant] = useState(safeProduct.variants[0] || null);
    const [quantity, setQuantity] = useState(1);
    const [mainMedia, setMainMedia] = useState({ type: 'image', src: safeProduct.image });
    const [sizeMessage, setSizeMessage] = useState('');
    const [notes, setNotes] = useState(['']);
    const [successMessage, setSuccessMessage] = useState('');

    const initializeMediaItems = () => {
        const items = [{ type: 'image', src: safeProduct.image }];
        if (safeProduct.youtube_url) {
            items.push({ type: 'video', src: safeProduct.youtube_url });
        }
        if (safeProduct.variants?.length > 0) {
            const variantImages = safeProduct.variants
                .filter(v => v.image && v.image !== safeProduct.image)
                .map(v => ({ type: 'image', src: v.image }))
                .filter((item, index, self) =>
                    index === self.findIndex(t => t.src === item.src)
                );
            items.push(...variantImages);
        }
        return items;
    };

    const mediaItems = initializeMediaItems();

    const groupVariantsByColor = () => {
        return safeProduct.variants.reduce((acc, variant) => {
            if (safeProduct.isColor && variant.color?.name) {
                acc[variant.color.name] = acc[variant.color.name] || [];
                acc[variant.color.name].push(variant);
            }
            return acc;
        }, {});
    };

    const colorGroups = groupVariantsByColor();
    const uniqueColors = Object.keys(colorGroups);

    const updateMainMedia = () => {
        if (selectedVariant?.image) {
            setMainMedia({ type: 'image', src: selectedVariant.image });
        } else {
            setMainMedia({ type: 'image', src: safeProduct.image });
        }
    };

    useEffect(updateMainMedia, [selectedVariant, safeProduct.image]);

    const getStockStatus = () => {
        const stock = safeProduct.variants.length > 0 && selectedVariant
            ? selectedVariant.stock
            : safeProduct.totalstock;
        if (stock === 0) {
            return 'out-of-stock';
        }
        if (stock < 5) {
            return 'low-stock';
        }
        return 'in-stock';
    };

    const isOutOfStock = getStockStatus() === 'out-of-stock';

    const updateQuantityAndNotes = () => {
        const maxStock = safeProduct.variants.length > 0 && selectedVariant
            ? selectedVariant.stock
            : safeProduct.totalstock;
        const newQuantity = isOutOfStock ? 1 : Math.min(quantity, maxStock || 1);
        setQuantity(newQuantity);
        if (safeProduct.isNot && !isOutOfStock) {
            setNotes(prevNotes => {
                const newNotes = Array(newQuantity).fill('');
                for (let i = 0; i < Math.min(prevNotes.length, newQuantity); i++) {
                    newNotes[i] = prevNotes[i] || '';
                }
                return newNotes;
            });
        } else {
            setNotes(['']);
        }
    };

    useEffect(() => {
        setQuantity(1);
        updateQuantityAndNotes();
    }, [selectedVariant, safeProduct.totalstock, safeProduct.isNot]);

    const handleAddToCart = async () => {
        if (!safeProduct.id) {
            alert('معرف المنتج غير متوفر');
            return;
        }

        if (isOutOfStock) {
            alert('المنتج غير متوفر في المخزون');
            return;
        }

        const cartData = {
            product_id: safeProduct.id,
            variant_id: selectedVariant?.id || null,
            quantity: quantity,
        };

        if (safeProduct.isNot && notes.some(note => note.trim() !== '')) {
            cartData.notes = notes.filter(note => note.trim() !== '');
        }



        try {
            await addToCart(cartData);
            trackEvent("AddToCart", {
                id: safeProduct.id,
                name: safeProduct.title,
                variant_id: selectedVariant?.id || null,
                price: discountedPrice,
                currency: normalizeCurrency(currency),
                quantity: quantity,
            });
            setSuccessMessage('تم إضافة المنتج بنجاح');
            setTimeout(() => setSuccessMessage(''), 3000);
            setQuantity(1);
            if (safeProduct.isNot) {
                setNotes(['']);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.error || 'حدث خطأ أثناء إضافة المنتج إلى السلة');
        }
    };

    const handleBuyNow = async () => {
        if (!safeProduct.id) {
            alert('معرف المنتج غير متوفر');
            return;
        }

        if (isOutOfStock) {
            alert('المنتج غير متوفر في المخزون');
            return;
        }

        const cartData = {
            product_id: safeProduct.id,
            variant_id: selectedVariant?.id || null,
            quantity: quantity,
        };

        if (safeProduct.isNot && notes.some(note => note.trim() !== '')) {
            cartData.notes = notes.filter(note => note.trim() !== '');
        }

        try {
            await addToCart(cartData);
            trackEvent("AddToCart", {
                id: safeProduct.id,
                name: safeProduct.title,
                variant_id: selectedVariant?.id || null,
                price: discountedPrice,
                currency: normalizeCurrency(currency),
                quantity: quantity,
            });
            window.location.href = '/cart';
        } catch (error) {
            console.error('Error in buy now:', error);
            alert(error.response?.data?.error || 'حدث خطأ أثناء عملية الشراء');
        }
    };

    const handleColorSelect = (color) => {
        if (!colorGroups[color]) return;
        const variants = colorGroups[color];
        const availableVariant = variants.find(v => v.stock > 0) || variants[0];
        setSelectedVariant(availableVariant);
        setSizeMessage(`اللون المختار: ${color}. المقاسات المتاحة: ${variants.map(v => v.size?.name || 'غير متوفر').join(', ')}`);
    };

    const handleSizeSelect = (variant) => {
        if (!variant) return;
        setSelectedVariant(variant);
        setSizeMessage(`اللون المرتبط: ${variant.color?.name || 'غير متوفر'}. المقاسات المتاحة: ${colorGroups[variant.color?.name]?.map(v => v.size?.name || 'غير متوفر').join(', ') || 'غير متوفر'}`);
    };

    const handleQuantityChange = (delta) => {
        if (isOutOfStock) return;
        const maxStock = safeProduct.variants.length > 0 && selectedVariant
            ? selectedVariant.stock
            : safeProduct.totalstock;
        const newQuantity = Math.max(1, Math.min(quantity + delta, maxStock || 1));
        setQuantity(newQuantity);
    };

    const handleNoteChange = (index, value) => {
        if (isOutOfStock) return;
        const newNotes = [...notes];
        newNotes[index] = value;
        setNotes(newNotes);
    };

    const handleImageError = () => {
        console.error('Image failed to load:', mainMedia.src);
        setMainMedia({ type: 'image', src: '' });
    };

    const handleAddFavorite = async () => {
        try {
            await addFavorite(safeProduct.id);
            trackEvent('AddToWishlist', {
                id: safeProduct.id,
                name: safeProduct.title,
                variant_id: selectedVariant?.id || null,
                price: discountedPrice,
                currency: normalizeCurrency(currency),
                quantity: quantity,

            });





        } catch (err) {
            console.error('خطأ في الإضافة إلى المفضلة:', err);
        }
    };

    const isVariantSelected = selectedVariant && selectedVariant.id;
    const originalPrice = isVariantSelected
        ? parseFloat(selectedVariant.original_price) || 0.00
        : parseFloat(safeProduct.product_original_price) || 0.00;
    const discountedPrice = isVariantSelected
        ? parseFloat(selectedVariant.discounted_price) || originalPrice
        : parseFloat(safeProduct.product_discounted_price) || originalPrice;
    const discountPercentage = isVariantSelected
        ? parseFloat(selectedVariant.discount_percentage) || 0
        : parseFloat(safeProduct.product_discount_percentage) || 0;
    const savedAmount = isVariantSelected
        ? parseFloat(selectedVariant.saved_amount) || 0.00
        : parseFloat(safeProduct.product_saved_amount) || 0.00;
    const currency = safeProduct.currency;

    const isFavorite = favorites.includes(safeProduct.id);

    return (
        <>
            <div className="product-page">
                <div className="gallery-column">
                    <div className="main-image-container">
                        {mainMedia.type === 'image' ? (
                            <MediumZoom>
                                <img
                                    src={`${Config.baseURL}${mainMedia.src}`}
                                    alt={safeProduct.title}
                                    className="main-product-image"
                                    onError={handleImageError}
                                    loading="eager"
                                />
                            </MediumZoom>
                        ) : (
                            <iframe
                                className="product-video"
                                src={mainMedia.src}
                                title="Product Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                    <div className="thumbnail-row">
                        {mediaItems.map((item, i) => (
                            <div
                                key={`thumb-${i}`}
                                className={`thumbnail ${mainMedia.src === item.src ? 'active' : ''}`}
                                onClick={() => setMainMedia(item)}
                            >
                                {item.type === 'image' ? (
                                    <img
                                        src={`${Config.baseURL}${item.src}`}
                                        alt={`Thumbnail ${i}`}
                                        onError={handleImageError}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="video-thumb">
                                        <TbBrandYoutubeFilled />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="details-column">
                    <h1 className="product-title">{safeProduct.title}</h1>
                    <div className="product-code-section">
                        <span className="code-label">كود المنتج:</span>
                        <span className="code-value">{safeProduct.code}</span>
                    </div>
                    <div className="product-rating">
                        ★★★★☆ <span className="rating-text">(4.0 تقييم)</span>
                    </div>
                    <div className="amazon-priceSection">
                        {originalPrice > discountedPrice ? (
                            <>
                                <div className="amazon-originalRow">
                                    <span className="amazon-originalPrice">
                                        {originalPrice.toFixed(2)} <span className="currency">{currency}</span>
                                    </span>
                                </div>
                                <div className="amazon-priceRow">
                                    <span className="amazon-discountedPrice">
                                        {discountedPrice.toFixed(2)} <span className="currency">{currency}</span>
                                    </span>
                                    <span className="amazon-discountTag">
                                        خصم {discountPercentage.toFixed(0)}%
                                    </span>
                                    <span className="amazon-saveText flash">
                                        يوفر {savedAmount.toFixed(2)} {currency}!
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="amazon-priceRow">
                                <span className="amazon-discountedPrice">
                                    {discountedPrice.toFixed(2)} <span className="currency">{currency}</span>
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="product-description">
                        <h3>تفاصيل المنتج</h3>
                        <p>{safeProduct.description || 'لا يوجد وصف متاح للمنتج'}</p>
                    </div>
                    <Categories product={safeProduct} />
                    {safeProduct.isColor && uniqueColors.length > 0 && (
                        <div className="product-option-group">
                            <h4>اختر اللون:</h4>
                            <div className="color-options">
                                {uniqueColors.map((color, i) => (
                                    <div
                                        key={`color-${i}`}
                                        className={`color-option ${selectedVariant?.color?.name === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: colorGroups[color][0].color?.hex_code || '#000' }}
                                        onClick={() => handleColorSelect(color)}
                                        title={color}
                                    >
                                        {selectedVariant?.color?.name === color && (
                                            <span className="check-mark">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {safeProduct.isSize && (
                        <div className="product-option-group">
                            <h4>اختر المقاس:</h4>
                            <div className="size-options">
                                {(safeProduct.isColor ? colorGroups[selectedVariant?.color?.name] || [] : safeProduct.variants)
                                    .filter(v => v.size)
                                    .map((variant, i) => (
                                        <div
                                            key={`size-${i}`}
                                            className={`size-option ${selectedVariant?.id === variant.id ? 'selected' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                                            onClick={() => handleSizeSelect(variant)}
                                        >
                                            {variant.size?.name || 'غير متوفر'}
                                            {variant.stock === 0 && <span className="out-of-stock-label"> (غير متوفر)</span>}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                    {safeProduct.isNot && !isOutOfStock && (
                        <div className="product-option-group">
                            <h4>إضافة ملاحظات:</h4>
                            {notes.map((note, index) => (
                                <div key={`note-${index}`} className="note-input">
                                    <label>ملاحظة للمنتج #{index + 1}:</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => handleNoteChange(index, e.target.value)}
                                        placeholder={`أدخل ملاحظات للمنتج ${index + 1}`}
                                        rows={3}
                                        disabled={isOutOfStock}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="specs-section">
                        <h3>مواصفات المنتج</h3>
                        <div className="specs-grid">
                            {safeProduct.attributes?.length > 0 ? (
                                safeProduct.attributes.map((attr) => (
                                    <React.Fragment key={attr.id}>
                                        <div className="spec-name">{attr.key}</div>
                                        <div className="spec-value">{attr.value || 'غير محدد'}</div>
                                    </React.Fragment>
                                ))
                            ) : (
                                <div className="no-specs">لا توجد مواصفات متاحة</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="actions-column">
                    <div className="price-card">
                        <div className="price-display">
                            {originalPrice > discountedPrice ? (
                                <>
                                    <span className="original-price">{originalPrice.toFixed(2)} {currency}</span>
                                    <span className="current-price">{discountedPrice.toFixed(2)} {currency}</span>
                                    <span className="discount-badge">وفر {discountPercentage}%</span>
                                </>
                            ) : (
                                <span className="current-price">{discountedPrice.toFixed(2)} {currency}</span>
                            )}
                        </div>
                        <div className={`stock-status ${getStockStatus()}`}>
                            {getStockStatus() === 'out-of-stock' ? 'غير متوفر' :
                                getStockStatus() === 'low-stock' ? `آخر ${selectedVariant?.stock || safeProduct.totalstock} قطع` :
                                    'متوفر في المخزون'}
                        </div>
                        <div className="quantity-control">
                            <label>الكمية:</label>
                            <div className="quantity-selector">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1 || isOutOfStock}
                                >
                                    −
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= (selectedVariant?.stock || safeProduct.totalstock || 1) || isOutOfStock}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="action-buttons">
                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                            >
                                <FaShoppingCart /> أضف إلى السلة
                            </button>
                            <button
                                className="buy-now-btn"
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                            >
                                اشتري الآن
                            </button>
                        </div>
                        <div className="delivery-info">
                            <span>🚚 توصيل سريع خلال 2-5 أيام عمل</span>
                        </div>
                    </div>
                    <button className="wishlist-btn" onClick={handleAddFavorite}>
                        {isFavorite ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />}
                        {isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    </button>
                    {successMessage && (
                        <div className="success-message">
                            <span>✓</span> {successMessage}
                        </div>
                    )}
                </div>
            </div>
            <div className="related-product-pag" style={{ borderRadius: '0px 0px 12px 12px' }}>
                {Array.isArray(safeProduct.related_products) && safeProduct.related_products.length > 0 && (
                    <RelatedProducts product={safeProduct} currency={currency} />
                )}
            </div>
        </>
    );
};

export default Amazon;