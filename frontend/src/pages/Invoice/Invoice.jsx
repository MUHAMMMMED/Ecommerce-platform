import html2canvas from 'html2canvas';
import React from 'react';
import { FiCalendar, FiCreditCard, FiHash, FiMapPin, FiPhone, FiSave, FiShoppingCart, FiX } from 'react-icons/fi';
import './Invoice.css';

const Invoice = ({ order, closeModal }) => {
    const isValidNumber = (value) => {
        return typeof value === 'number' && !isNaN(value) && value >= 0;
    };

    const saveInvoiceAsImage = () => {
        const invoiceElement = document.querySelector('.invoice-popup-container');
        if (!invoiceElement) {
            console.error('عنصر الفاتورة غير موجود');
            return;
        }
        html2canvas(invoiceElement, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowWidth: document.querySelector('.invoice-popup-content').scrollWidth,
            windowHeight: document.querySelector('.invoice-popup-content').scrollHeight
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

    const calculateSubtotal = () => {
        if (!order?.items || !Array.isArray(order.items)) return 0;
        return order.items.reduce((acc, item) => {
            const price = isValidNumber(parseFloat(item.price)) ? parseFloat(item.price) : 0;
            const quantity = isValidNumber(item.quantity) ? item.quantity : 1;
            return acc + price * quantity;
        }, 0);
    };

    const hasSize = order?.items?.some(item => item.variant_size?.name && item.variant_size?.name !== 'غير محدد') || false;
    const hasColor = order?.items?.some(item => item.variant_color?.name && item.variant_color?.name !== 'غير محدد') || false;

    const subtotal = parseFloat(calculateSubtotal());
    const tax = parseFloat(order?.tax_amount) || 0;
    const shipping = parseFloat(order?.shipping) || 0;
    const total = parseFloat(order?.total) || 0;

    const calculatedTotal = subtotal + tax + shipping;
    const discount = calculatedTotal - total;

    return (
        <div className="invoice-popup-modal">
            <div className="invoice-popup-modal-content">
                <button onClick={closeModal} className="invoice-popup-close-btn">
                    <FiX />
                </button>

                <div className="invoice-popup-container">
                    <div className="invoice-popup-content">
                        <div className="invoice-popup-header">
                            <div className="invoice-popup-branding">
                                <h1>فاتورة ضريبية</h1>
                                <div className="invoice-popup-company-info">

                                    <p className="invoice-popup-company-name">ALTAUREA</p>
                                    <p className="invoice-popup-company-contact">
                                        <FiPhone /> {order?.customer?.phone || 'غير متوفر'}

                                    </p>
                                </div>
                            </div>

                            <div className="invoice-popup-meta">
                                <div className="invoice-popup-number">
                                    <p><FiHash /> رقم الفاتورة: {order?.invoice_number || 'غير متوفر'}</p>
                                </div>
                                <div className="invoice-popup-date">
                                    <p><FiCalendar /> تاريخ الفاتورة: {formatDate(order?.created_at)}</p>
                                </div>
                                <div className={`invoice-popup-status ${order?.paid ? 'paid' : 'unpaid'}`}>
                                    <p><FiCreditCard /> حالة الدفع: {order?.paid ? 'تم الدفع' : 'لم يتم الدفع'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-popup-body">
                            <div className="invoice-popup-customer-section">
                                <div className="invoice-popup-section-title">
                                    <h3><FiMapPin /> معلومات العميل</h3>
                                </div>
                                <div className="invoice-popup-customer-details">
                                    <p><strong>الاسم:</strong> {order?.customer?.name || 'غير معروف'}</p>
                                    <p><FiPhone /> <strong>الهاتف:</strong> {order?.customer?.phone || 'غير متوفر'}</p>
                                    <p><strong>الدولة:</strong> {order?.customer?.country?.name || 'غير محدد'}</p>
                                    <p><strong>المحافظة:</strong> {order?.customer?.governorate || 'غير محدد'}</p>
                                    <p><strong>المدينة:</strong> {order?.customer?.city || 'غير محدد'}</p>
                                    <p><strong>الحي:</strong> {order?.customer?.neighborhood || 'غير محدد'}</p>
                                    <p><strong>عنوان الشحن:</strong> {order?.customer?.shipping_address || 'غير محدد'}</p>
                                </div>
                            </div>

                            <div className="invoice-popup-products-section">
                                <div className="invoice-popup-section-title">
                                    <h3><FiShoppingCart /> تفاصيل المنتجات</h3>
                                </div>
                                <div className="invoice-popup-products-table">
                                    <div className="invoice-popup-table-header">
                                        <div className="invoice-popup-header-cell">#</div>
                                        <div className="invoice-popup-header-cell">المنتج</div>
                                        {hasSize && <div className="invoice-popup-header-cell">المقاس</div>}
                                        {hasColor && <div className="invoice-popup-header-cell">اللون</div>}
                                        <div className="invoice-popup-header-cell">الكمية</div>
                                        <div className="invoice-popup-header-cell">السعر</div>
                                        <div className="invoice-popup-header-cell">الإجمالي</div>
                                    </div>
                                    <div className="invoice-popup-table-body">
                                        {order?.items?.map((item, index) => (
                                            <div key={item.id || index} className="invoice-popup-table-row">
                                                <div className="invoice-popup-table-cell" data-label="رقم">{index + 1}</div>
                                                <div className="invoice-popup-table-cell invoice-popup-product-name" data-label="المنتج">
                                                    {item.product_title?.title || 'غير معروف'}
                                                </div>
                                                {hasSize && <div className="invoice-popup-table-cell" data-label="المقاس">
                                                    {item.variant_size?.name || 'غير محدد'}
                                                </div>}
                                                {hasColor && <div className="invoice-popup-table-cell" data-label="اللون">
                                                    {item.variant_color?.name || 'غير محدد'}
                                                </div>}
                                                <div className="invoice-popup-table-cell" data-label="الكمية">{item.quantity || 1}</div>
                                                <div className="invoice-popup-table-cell" data-label="السعر">
                                                    {parseFloat(item.price.amount || 0).toFixed(2)} {order?.currency || 'EGP'}

                                                </div>
                                                <div className="invoice-popup-table-cell" data-label="الإجمالي">
                                                    {(parseFloat(item.price.amount || 0) * item.quantity).toFixed(2)} {order?.currency || 'EGP'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="invoice-popup-summary">
                                <div className="invoice-popup-summary-row">
                                    <span>المجموع الفرعي:</span>
                                    <span>{subtotal.toFixed(2)} {order?.currency || 'EGP'}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="invoice-popup-summary-row invoice-popup-discount-row">
                                        <span>الخصم:</span>
                                        <span>-{discount.toFixed(2)} {order?.currency || 'EGP'}</span>
                                    </div>
                                )}

                                <div className="invoice-popup-summary-row">
                                    <span>الشحن:</span>
                                    <span>{shipping.toFixed(2)} {order?.currency || 'EGP'}</span>
                                </div>

                                <div className="invoice-popup-summary-row">
                                    <span>الضريبة:</span>
                                    <span>{tax.toFixed(2)} {order?.currency || 'EGP'}</span>
                                </div>

                                <div className="invoice-popup-summary-row invoice-popup-grand-total">
                                    <span>الإجمالي النهائي:</span>
                                    <span>{total.toFixed(2)} {order?.currency || 'EGP'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-popup-footer">
                            <p className="invoice-popup-thank-you">شكراً لاختياركم متجرنا</p>
                            <div className="invoice-popup-actions">
                                <button onClick={saveInvoiceAsImage} className="invoice-popup-download-btn">
                                    <FiSave /> حفظ الفاتورة كصورة
                                </button>
                                <button onClick={closeModal} className="invoice-popup-close-btn-secondary">
                                    إغلاق الفاتورة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;