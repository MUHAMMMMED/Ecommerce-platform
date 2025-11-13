import html2canvas from 'html2canvas';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiHash, FiMapPin, FiPhone, FiSave, FiShoppingCart } from 'react-icons/fi';
import AxiosInstance from '../../Authentication/AxiosInstance';
import { useTrackEvents } from '../../Pixels/hooks/useTrackEvents';
import Header from '../Header/Header';
import Loading from '../Loading/Loading';
import SuccessMessage from './components/SuccessMessage/SuccessMessage';
import './Success.css';

// util لتحويل أي نص لكود ISO صالح
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

const Success = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { trackEvent } = useTrackEvents();

    const isValidNumber = (value) => typeof value === 'number' && !isNaN(value) && value >= 0;

    const fetchOrder = useCallback(async () => {
        try {
            const response = await AxiosInstance.get(`/orders/invoice/`, { withCredentials: true });
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('بيانات الفاتورة غير صالحة');
            }
            setOrder(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'فشل في جلب الفاتورة');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // ✅ تتبع عملية الشراء بعد جلب الطلب
    useEffect(() => {
        if (order) {
            const total = parseFloat(order?.total) || 0;

            const items = order.items.map(item => ({
                id: item.id?.toString(),
                name: item.product_title?.title || 'منتج',
                price: parseFloat(item.price?.amount || 0),
                quantity: item.quantity || 1,
                currency: normalizeCurrency(order.currency),
            }));

            // تتبع كل منتج
            items.forEach((item) => {
                trackEvent("Purchase", {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    currency: item.currency,
                    value: item.price * item.quantity, // إجمالي المنتج
                });
            });

            // تتبع الطلب كامل
            trackEvent("Purchase", {
                id: order.id?.toString(),
                name: "Order Purchase",
                price: total,
                quantity: order.items.length,
                currency: normalizeCurrency(order.currency),
                value: total, // إجمالي الطلب
            });
        }
    }, [order, trackEvent]);

    const saveInvoiceAsImage = () => {
        const invoiceElement = document.querySelector('.invoice-container');
        if (!invoiceElement) {
            console.error('عنصر الفاتورة غير موجود');
            return;
        }
        html2canvas(invoiceElement, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `invoice-${order?.invoice_number || 'unknown'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('فشل في حفظ صورة الفاتورة:', err);
        });
    };

    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString))) return 'غير متوفر';
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    // ✅ حساب الملخصات باستخدام useMemo
    const { subtotal, tax, shipping, total, discount, hasSize, hasColor } = useMemo(() => {
        if (!order) return { subtotal: 0, tax: 0, shipping: 0, total: 0, discount: 0, hasSize: false, hasColor: false };

        const subtotal = order.items?.reduce((acc, item) => {
            const price = isValidNumber(parseFloat(item.price?.amount)) ? parseFloat(item.price.amount) : 0;
            const quantity = isValidNumber(item.quantity) ? item.quantity : 1;
            return acc + price * quantity;
        }, 0) || 0;

        const tax = parseFloat(order?.tax_amount) || 0;
        const shipping = parseFloat(order?.shipping) || 0;
        const total = parseFloat(order?.total) || 0;
        const calculatedTotal = subtotal + tax + shipping;
        const discount = calculatedTotal - total;

        const hasSize = order.items?.some(item => item.variant_size?.name && item.variant_size?.name !== 'غير محدد') || false;
        const hasColor = order.items?.some(item => item.variant_color?.name && item.variant_color?.name !== 'غير محدد') || false;

        return { subtotal, tax, shipping, total, discount, hasSize, hasColor };
    }, [order]);

    if (loading) return <Loading />;
    if (error) return <div className="invoice-error-message">{error}</div>;

    return (
        <>
            <Header />
            <div className="success-page">
                <SuccessMessage />
                <section className="invoice-container">
                    <div className="invoice-content">
                        <div className="invoice-header">
                            <div className="invoice-branding">
                                <h1>فاتورة</h1>
                                <div className="company-info">
                                    <p className="company-name">ALTAUREA</p>
                                    <p className="company-contact">
                                        <FiPhone /> {order.customer?.phone || 'غير متوفر'}
                                    </p>
                                </div>
                            </div>

                            <div className="invoice-meta">
                                <div className="invoice-number">
                                    <p><FiHash /> رقم الفاتورة: {order.invoice_number || 'غير متوفر'}</p>
                                </div>
                                <div className="invoice-date">
                                    <p><FiCalendar /> تاريخ الفاتورة: {formatDate(order.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-body">
                            <div className="customer-section">
                                <div className="section-title">
                                    <h3><FiMapPin /> معلومات العميل</h3>
                                </div>
                                <div className="customer-details">
                                    <p><strong>الاسم:</strong> {order.customer?.name || 'غير معروف'}</p>
                                    <p><FiPhone /> <strong>الهاتف:</strong> {order.customer?.phone || 'غير متوفر'}</p>
                                    <p><strong>الدولة:</strong> {order.customer?.country?.name || 'غير محدد'}</p>
                                    <p><strong>المحافظة:</strong> {order.customer?.governorate || 'غير محدد'}</p>
                                    <p><strong>المدينة:</strong> {order.customer?.city || 'غير محدد'}</p>
                                    <p><strong>الحي:</strong> {order.customer?.neighborhood || 'غير محدد'}</p>
                                    <p><strong>عنوان الشحن:</strong> {order.customer?.shipping_address || 'غير محدد'}</p>
                                </div>
                            </div>

                            <div className="products-section">
                                <div className="section-title">
                                    <h3><FiShoppingCart /> تفاصيل المنتجات</h3>
                                </div>
                                <div className="products-table">
                                    <div className="table-header">
                                        <div className="header-cell">#</div>
                                        <div className="header-cell">المنتج</div>
                                        {hasSize && <div className="header-cell">المقاس</div>}
                                        {hasColor && <div className="header-cell">اللون</div>}
                                        <div className="header-cell">الكمية</div>
                                        <div className="header-cell">السعر</div>
                                        <div className="header-cell">الإجمالي</div>
                                    </div>
                                    <div className="table-body">
                                        {order.items.map((item, index) => (
                                            <div key={item.id ?? index} className="table-row">
                                                <div className="table-cell" data-label="رقم">{index + 1}</div>
                                                <div className="table-cell product-name" data-label="المنتج">
                                                    {item.product_title?.title || 'غير معروف'}
                                                </div>
                                                {hasSize && <div className="table-cell" data-label="المقاس">
                                                    {item.variant_size?.name || 'غير محدد'}
                                                </div>}
                                                {hasColor && <div className="table-cell" data-label="اللون">
                                                    {item.variant_color?.name || 'غير محدد'}
                                                </div>}
                                                <div className="table-cell" data-label="الكمية">{item.quantity || 1}</div>
                                                <div className="table-cell" data-label="السعر">
                                                    {parseFloat(item.price?.amount || 0).toFixed(2)} {order.currency}
                                                </div>
                                                <div className="table-cell" data-label="الإجمالي">
                                                    {(parseFloat(item.price?.amount || 0) * (item.quantity || 1)).toFixed(2)} {order.currency}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="invoice-summary">
                                <div className="summary-row">
                                    <span>المجموع الفرعي:</span>
                                    <span>{subtotal.toFixed(2)} {order.currency}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="summary-row discount-row">
                                        <span>الخصم:</span>
                                        <span>-{discount.toFixed(2)} {order.currency}</span>
                                    </div>
                                )}

                                <div className="summary-row">
                                    <span>الشحن:</span>
                                    <span>{shipping.toFixed(2)} {order.currency}</span>
                                </div>

                                <div className="summary-row">
                                    <span>الضريبة:</span>
                                    <span>{tax.toFixed(2)} {order.currency}</span>
                                </div>

                                <div className="summary-row grand-total">
                                    <span>الإجمالي النهائي:</span>
                                    <span>{total.toFixed(2)} {order.currency}</span>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-footer">
                            <p className="thank-you">شكراً لاختياركم متجرنا</p>
                            <button onClick={saveInvoiceAsImage} className="download-btn">
                                <FiSave /> حفظ الفاتورة كصورة
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Success;