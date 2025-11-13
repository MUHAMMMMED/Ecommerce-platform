


import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AxiosInstance from '../../Authentication/AxiosInstance';
import Header from '../../components/Header/Header';
import { CartContext } from '../../Context/CartContext';
import { useTrackEvents } from '../../Pixels/hooks/useTrackEvents';
import './Cart.css';
import CartItem from './components/CartItem/CartItem';
import ContactForm from './components/ContactForm/ContactForm';
import Invoice from './components/Invoice/Invoice';
import './FollowUpPayment.css';
const normalizeCurrency = (currency) => {
    const map = { "ريال": "SAR", "SAR": "SAR", "درهم": "AED", "AED": "AED", "EGP": "EGP", "USD": "USD" };
    return map[currency] || "SAR";
};

const Cart = () => {
    const { cartItems, loading, currency, cartId, clearCart } = useContext(CartContext);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [taxRate, setTax] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [finalAmount, setFinalAmount] = useState({
        amountToPay: 0, taxAmount: 0, total: 0, shipping: 0, discount: 0
    });

    // الحل الصح: useState هنا في الأب
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        country: '',
        city: '',
        neighborhood: '',
        street: '',
        Shipping: '',
        shippingPrice: 0,
    });

    // نستخدم key عشان نجبر ContactForm يعمل mount مرة واحدة فقط
    const formKey = cartItems.map(item => `${item.id}-${item.quantity}`).join('-');

    const contactFormRef = useRef();
    const navigate = useNavigate();
    const { trackEvent } = useTrackEvents();

    if (loading) return <div>جاري التحميل...</div>;

    const handleInitiateCheckout = () => {
        const items = cartItems.map(c => ({
            id: c.product_id,
            name: c.name,
            price: c.price,
            currency: currency,
            quantity: c.quantity,
        }));

        trackEvent('InitiateCheckout', {
            items,
            total: cartItems.reduce((sum, c) => sum + (c.price * c.quantity), 0),
            currency: normalizeCurrency(currency),
        });
    };

    const handleCheckout = async () => {
        const validatedData = contactFormRef.current?.getValidatedOrderData();
        if (!validatedData) {
            toast.error('يرجى تصحيح الأخطاء في النموذج قبل الإرسال.');
            return;
        }

        const validCartItems = cartItems.filter(item => item && item.product_id && item.price);
        if (validCartItems.length === 0) {
            toast.error('السلة فارغة أو تحتوي على بيانات غير صالحة.');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderPayload = {
                ...formData, // البيانات كاملة ومحدثة
                total: Number(finalAmount.amountToPay.toFixed(2)),
                tax_amount: Number(finalAmount.taxAmount.toFixed(2)),
                shipping: Number(finalAmount.shipping.toFixed(2)),
                cartItems: validCartItems.map(item => ({
                    product: item.product_id,
                    variant: item.variant?.id || null,
                    size: item.variant?.size || null,
                    color: item.variant?.color?.name || null,
                    quantity: item.quantity || 1,
                    price: Number(parseFloat(item.price)),
                    notes: Array.isArray(item.notes) ? item.notes.map(n => ({ id: n.id || null, text: n.text || '' })) : []
                })),
                cartId: cartId
            };

            const response = await AxiosInstance.post('/orders/create/', orderPayload);
            toast.success('تم إرسال الطلب بنجاح!');

            navigate(`/checkout/${response.data.order_id}`, {
                state: { amount: finalAmount.amountToPay, currency: currency }
            });

            clearCart();
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            toast.error('حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <div className="cartPageSection">
                {cartItems.length > 0 ? (
                    <div className="section-cart-products">
                        <div className="section-cart-products-row1">
                            {cartItems.map((item) => (
                                <CartItem key={item.id} item={item} currency={currency} />
                            ))}

                            {/* الحل السحري: key يتغير فقط لما الكميات تتغير، لكن formData في الأب */}
                            <ContactForm
                                key={formKey} // مهم جدًا: يمنع إعادة إنشاء الفورم من الصفر
                                ref={contactFormRef}
                                cartItems={cartItems}
                                cartId={cartId}
                                currency={currency}
                                onShippingPriceChange={setShippingPrice}
                                onTaxChange={setTax}
                                formData={formData}
                                set_FormData={setFormData}  // نرسل الـ setter
                            />
                        </div>

                        <div className="section-cart-products-row2">
                            <Invoice
                                cartItems={cartItems}
                                currency={currency}
                                shippingPrice={shippingPrice}
                                tax={taxRate}
                                onAmountChange={setFinalAmount}
                            />
                            <div className="payment-button-wrapper">
                                <button
                                    className={`payment-btn ${isSubmitting ? 'loading' : ''}`}
                                    onClick={() => {
                                        handleInitiateCheckout();
                                        handleCheckout();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'جاري المعالجة...' : '  الدفع'}
                                </button>
                                {/* 'متابعة الدفع' */}
                            </div>




                        </div>
                    </div>
                ) : (
                    <div className="empty-cart-message">
                        <div className="empty-message-card">
                            سلتك فارغة حاليًا!
                            <p>قم بإضافة بعض المنتجات للمتابعة إلى الدفع.</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;