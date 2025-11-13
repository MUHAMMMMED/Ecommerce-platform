import React, { useState } from 'react';
import { RiCoupon3Line } from 'react-icons/ri';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import './applyCoupon.css';

export default function ApplyCoupon({ total, updateTotal }) {
    const [couponCode, setCouponCode] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const applyCoupon = async () => {
        try {
            const response = await AxiosInstance.post('/cart/coupon/apply/', { code: couponCode, Total: total });
            if (response.data.valid) {
                const newDiscountedPrice = response.data.discounted_price;
                const percentage = response.data.percentage || 0;
                updateTotal(newDiscountedPrice);
                setSuccessMessage(
                    `تم تطبيق خصم ${percentage}% بنجاح!`
                );
                setErrorMessage('');
            } else {
                setErrorMessage('كود الخصم غير صحيح');
                setSuccessMessage('');
            }
        } catch (error) {
            setErrorMessage('كود الخصم غير صحيح');
            setSuccessMessage('');
        }
    };

    const handleCouponCodeChange = (e) => setCouponCode(e.target.value);

    return (
        <div className="acp-container">
            <div className="acp-section-card">
                <div className="acp-coupon-input-group">
                    <input
                        type="text"
                        className="acp-coupon-input"
                        placeholder={'أدخل كود الخصم'}
                        value={couponCode}
                        onChange={handleCouponCodeChange}
                    />
                    <button className="acp-coupon-btn" type="button" onClick={applyCoupon}>
                        <span className="acp-px-1"> إرسال</span>
                        <span className="acp-js-apply-coupon-icon"><RiCoupon3Line /></span>
                    </button>
                </div>
                <div className="acp-messages">
                    {successMessage && <div className="acp-success-message">{successMessage}</div>}
                    {errorMessage && <div className="acp-error-message">{errorMessage}</div>}
                </div>
            </div>
        </div>
    );
}