


import React, { useEffect, useState } from 'react';
import ApplyCoupon from '../ApplyCoupon/ApplyCoupon';
import './Invoice.css';

const Invoice = ({ cartItems, currency, shippingPrice, tax, onAmountChange }) => {
    const [discountAmount, setDiscountAmount] = useState(0);

    const total = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseFloat(item.quantity) || 1;
        return sum + price * quantity;
    }, 0);

    const taxRate = parseFloat(tax) || 0;
    const taxAmount = total * (taxRate / 100);
    const shipping = parseFloat(shippingPrice) || 0;
    const finalTotal = total + taxAmount + shipping;
    const amountToPay = Math.max(finalTotal - discountAmount, 0);

    useEffect(() => {
        onAmountChange({
            amountToPay,
            taxAmount,
            total,
            shipping,
            discount: discountAmount
        });
    }, [amountToPay, taxAmount, total, shipping, discountAmount, onAmountChange]);

    return (
        <div className="invoice-container">
            <div className="invoice-box">
                <ApplyCoupon total={finalTotal} updateTotal={(newTotal) => {
                    const calculatedDiscount = finalTotal - newTotal;
                    setDiscountAmount(calculatedDiscount > 0 ? calculatedDiscount : 0);
                }} />

                <div className="invoice-row">
                    <span className="invoice-label">عدد المنتجات</span>
                    <span className="invoice-value">({cartItems.length || 0})</span>
                </div>

                <div className="invoice-row">
                    <span className="invoice-label">الكمية</span>
                    <span className="invoice-value">
                        ({cartItems.reduce((sum, item) => sum + item.quantity, 0) || 0})
                    </span>
                </div>

                <div className="invoice-row">
                    <span className="invoice-label">المجموع الفرعي</span>
                    <span className="invoice-value">
                        {total.toFixed(2)} <span className="currency">{currency}</span>
                    </span>
                </div>

                <div className="invoice-row">
                    <span className="invoice-label">الضريبة ({taxRate}%)</span>
                    <span className="invoice-value">
                        {taxAmount.toFixed(2)} <span className="currency">{currency}</span>
                    </span>
                </div>

                <div className="invoice-row">
                    <span className="invoice-label">رسوم التوصيل</span>
                    <span className="invoice-value">
                        {shipping.toFixed(2)} <span className="currency">{currency}</span>
                    </span>
                </div>

                {discountAmount > 0 && (
                    <div className="invoice-row">
                        <span className="invoice-label">الخصم</span>
                        <span className="invoice-value">
                            -{discountAmount.toFixed(2)} <span className="currency">{currency}</span>
                        </span>
                    </div>
                )}

                <div className="invoice-row total">
                    <span className="invoice-label bold">المجموع</span>
                    <span className="invoice-value bold">
                        {amountToPay.toFixed(2)} <span className="currency">{currency}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Invoice;