// import React, { useContext, useEffect, useState } from 'react';
// import Config from '../../../../../../Authentication/config';
// import { CartContext } from '../../../../../../Context/CartContext';
// import { useTrackEvents } from '../../../../../../Pixels/hooks/useTrackEvents';
// import './RelatedProductsStyle.css';


// // util لتحويل أي نص لكود ISO صالح
// const normalizeCurrency = (currency) => {
//     const map = {
//         "ريال": "SAR",
//         "SAR": "SAR",
//         "درهم": "AED",
//         "AED": "AED",
//         "EGP": "EGP",
//         "USD": "USD",
//     };
//     return map[currency] || "SAR"; // fallback
// };
// const RelatedProducts = ({ product, currency }) => {
//     const [selectedProducts, setSelectedProducts] = useState([]);
//     const [successMessage, setSuccessMessage] = useState('');
//     const { addToCart } = useContext(CartContext);
//     const { trackEvent } = useTrackEvents();
//     const filterRelatedItems = () => {
//         return (product.related_products || []).filter(item => item.variant);
//     };

//     const relatedItems = filterRelatedItems();

//     const initializeSelectedProducts = () => {
//         if (relatedItems.length > 0 && selectedProducts.length === 0) {
//             setSelectedProducts(
//                 relatedItems
//                     .filter(item => item.variant.stock > 0)
//                     .map(item => item.id)
//             );
//         }
//     };

//     useEffect(initializeSelectedProducts, [relatedItems]);

//     const handleCheckboxChange = (productId) => {
//         setSelectedProducts((prev) =>
//             prev.includes(productId)
//                 ? prev.filter((id) => id !== productId)
//                 : [...prev, productId]
//         );
//     };
//     const calculateTotal = () => {
//         const selected = relatedItems.filter((p) => selectedProducts.includes(p.id));
//         const total = selected.reduce((sum, p) => {
//             const price = p.variant?.discounted_price !== undefined
//                 ? parseFloat(p.variant.discounted_price)
//                 : parseFloat(p.variant?.price || 0);
//             return sum + price;
//         }, 0);
//         return total.toFixed(2);
//     };

//     const handleAddToCart = async () => {
//         const selected = relatedItems.filter((p) => selectedProducts.includes(p.id));
//         if (selected.length === 0) {
//             alert('يرجى اختيار منتج واحد على الأقل من المنتجات المرتبطة');
//             return;
//         }

//         const outOfStock = selected.some(item => item.variant.stock === 0);
//         if (outOfStock) {
//             alert('لا يمكن إضافة منتجات غير متوفرة في المخزون');
//             return;
//         }

//         try {
//             for (const item of selected) {
//                 const cartData = {
//                     product_id: item.id,
//                     variant_id: item.variant.id,
//                     quantity: 1,
//                 };

//                 await addToCart(cartData, {
//                     headers: { 'Content-Type': 'application/json' },
//                 });

//                 // ✅ تتبع الحدث بالبيانات الصحيحة
//                 trackEvent('AddToCart', {
//                     id: item.id,
//                     name: item.title,
//                     variant_id: item.variant.id,
//                     price: price,
//                     currency: normalizeCurrency(currency),
//                     quantity: 1,
//                 });
//             }

//             setSuccessMessage('تم إضافة المنتجات بنجاح');
//             setTimeout(() => setSuccessMessage(''), 3000);
//         } catch (error) {
//             console.error('Error adding related products to cart:', error);
//             if (error.response) {
//                 alert(`خطأ: ${error.response.data.error || 'حدث خطأ أثناء إضافة المنتجات المرتبطة إلى السلة'}`);
//             } else {
//                 alert('خطأ في الاتصال بالخادم');
//             }
//         }
//     };

//     const isAddToCartDisabled = selectedProducts.length === 0;

//     if (relatedItems.length === 0) {
//         return null;
//     }

//     return (
//         <div className="related-products-container">
//             <div className="related-products-header">غالبًا ما يتم شراؤها معًا</div>
//             <div className="related-products-list">
//                 {relatedItems.map((item) => (
//                     <div key={`related-item-${item.id}`} className="related-product-item">
//                         <div className="related-product-image-wrapper">
//                             <input
//                                 type="checkbox"
//                                 checked={selectedProducts.includes(item.id)}
//                                 onChange={() => handleCheckboxChange(item.id)}
//                                 className="related-product-checkbox"
//                                 disabled={item.variant.stock === 0}
//                             />
//                             <img
//                                 src={`${Config.baseURL}${item.variant?.image || '/media/placeholder.jpg'}`}
//                                 alt={item.title}
//                                 className="related-product-image"
//                             />
//                         </div>
//                         <div className="related-product-info">
//                             <p className="related-product-title">{item.title}</p>
//                             <p className="related-product-price">
//                                 {(item.variant?.price * (1 - product.discount / 100)).toFixed(2) || '0.00'}

//                                 {currency}

//                             </p>



//                             {item.variant.stock === 0 && (
//                                 <p className="related-product-out-of-stock">غير متوفر في المخزون</p>
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <div className="related-product-actions">
//                 <div className="related-products-total">
//                     الإجمالي: <strong>{calculateTotal()} {currency}</strong>
//                 </div>
//                 <button
//                     className="related-products-add-btn"
//                     onClick={handleAddToCart}
//                     disabled={isAddToCartDisabled}
//                 >
//                     أضف إلى السلة
//                 </button>
//                 {successMessage && (
//                     <div className="related-products-success-notification">
//                         <span className="related-products-success-icon">✔</span>
//                         {successMessage}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default RelatedProducts;






import React, { useContext, useEffect, useState } from 'react';
import Config from '../../../../../../Authentication/config';
import { CartContext } from '../../../../../../Context/CartContext';
import { useTrackEvents } from '../../../../../../Pixels/hooks/useTrackEvents';
import './RelatedProductsStyle.css';

// تحويل العملة إلى كود ISO
const normalizeCurrency = (currency) => {
    const map = {
        "ريال": "SAR",
        "SAR": "SAR",
        "درهم": "AED",
        "AED": "AED",
        "EGP": "EGP",
        "USD": "USD",
    };
    return map[currency] || "SAR";
};

const RelatedProducts = ({ product, currency }) => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const { addToCart } = useContext(CartContext);
    const { trackEvent } = useTrackEvents();

    const relatedItems = (product.related_products || []).filter(item => item.variant);

    useEffect(() => {
        if (relatedItems.length > 0 && selectedProducts.length === 0) {
            const available = relatedItems
                .filter(item => item.variant.stock > 0)
                .map(item => item.id);
            setSelectedProducts(available);
        }
    }, [relatedItems]);

    const handleCheckboxChange = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const calculateTotal = () => {
        const selected = relatedItems.filter((p) => selectedProducts.includes(p.id));
        const total = selected.reduce((sum, p) => {
            const price = p.variant?.discounted_price !== undefined
                ? parseFloat(p.variant.discounted_price)
                : parseFloat(p.variant?.price || 0);
            return sum + price;
        }, 0);
        return total.toFixed(2);
    };

    const handleAddToCart = async () => {
        const selected = relatedItems.filter((p) => selectedProducts.includes(p.id));
        if (selected.length === 0) {
            alert('يرجى اختيار منتج واحد على الأقل من المنتجات المرتبطة');
            return;
        }

        const outOfStock = selected.some(item => item.variant.stock === 0);
        if (outOfStock) {
            alert('لا يمكن إضافة منتجات غير متوفرة في المخزون');
            return;
        }

        try {
            for (const item of selected) {
                const price = item.variant?.discounted_price !== undefined
                    ? parseFloat(item.variant.discounted_price)
                    : parseFloat(item.variant?.price || 0);

                const cartData = {
                    product_id: item.id,
                    variant_id: item.variant.id,
                    quantity: 1,
                };

                await addToCart(cartData, {
                    headers: { 'Content-Type': 'application/json' },
                });

                // تتبع الحدث بعد الإضافة
                trackEvent('AddToCart', {
                    id: item.id,
                    name: item.title,
                    variant_id: item.variant.id,
                    price: price,
                    currency: normalizeCurrency(currency),
                    quantity: 1,
                });
            }

            setSuccessMessage('تم إضافة المنتجات بنجاح');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error adding related products to cart:', error);
            if (error.response) {
                alert(`خطأ: ${error.response.data.error || 'حدث خطأ أثناء إضافة المنتجات المرتبطة إلى السلة'}`);
            } else {
                alert('خطأ في الاتصال بالخادم');
            }
        }
    };

    const isAddToCartDisabled = selectedProducts.length === 0;

    if (relatedItems.length === 0) return null;

    return (
        <div className="related-products-container">
            <div className="related-products-header">غالبًا ما يتم شراؤها معًا</div>

            <div className="related-products-list">
                {relatedItems.map((item) => {
                    const price = item.variant?.discounted_price !== undefined
                        ? parseFloat(item.variant.discounted_price)
                        : parseFloat(item.variant?.price || 0);

                    return (
                        <div key={`related-item-${item.id}`} className="related-product-item">
                            <div className="related-product-image-wrapper">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(item.id)}
                                    onChange={() => handleCheckboxChange(item.id)}
                                    className="related-product-checkbox"
                                    disabled={item.variant.stock === 0}
                                />
                                <img
                                    src={`${Config.baseURL}${item.variant?.image || '/media/placeholder.jpg'}`}
                                    alt={item.title}
                                    className="related-product-image"
                                />
                            </div>

                            <div className="related-product-info">
                                <p className="related-product-title">{item.title}</p>
                                <p className="related-product-price">
                                    {price.toFixed(2)} {currency}
                                </p>

                                {item.variant.stock === 0 && (
                                    <p className="related-product-out-of-stock">غير متوفر في المخزون</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="related-product-actions">
                <div className="related-products-total">
                    الإجمالي: <strong>{calculateTotal()} {currency}</strong>
                </div>
                <button
                    className="related-products-add-btn"
                    onClick={handleAddToCart}
                    disabled={isAddToCartDisabled}
                >
                    أضف إلى السلة
                </button>

                {successMessage && (
                    <div className="related-products-success-notification">
                        <span className="related-products-success-icon">✔</span>
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RelatedProducts;