import React from 'react';
import './ContinuousPaymentBar.css';

const ContinuousPaymentBar = () => {
    const paymentMethods = [
        { id: 1, name: 'Visa', logo: '/images/visa-logo.png' },
        { id: 2, name: 'MasterCard', logo: '/images/mastercard-logo.png' },
        { id: 3, name: 'PayPal', logo: '/images/paypal-logo.png' },
        { id: 4, name: 'Apple Pay', logo: '/images/apple-pay-logo.png' },
        { id: 5, name: 'Google Pay', logo: '/images/google-pay-logo.png' },
        { id: 6, name: 'Stripe', logo: '/images/stripe-logo.png' },
        { id: 7, name: 'American Express', logo: '/images/amex-logo.png' },
        { id: 8, name: 'Discover', logo: '/images/discover-logo.png' }
    ];

    // تكرار القائمة لإنشاء تأثير مستمر
    const duplicatedMethods = [...paymentMethods, ...paymentMethods];

    return (
        <div className="continuous-payment-header">
            <div className="site-logo-container">
                <h1 className="site-logo-text">ALTAUREA</h1>
            </div>

            <div className="continuous-payment-bar">
                <div className="continuous-payment-slider">
                    {duplicatedMethods.map((method, index) => (
                        <div key={`${method.id}-${index}`} className="payment-item">
                            <img
                                src={method.logo}
                                alt={method.name}
                                className="payment-logo"
                            />
                            <span className="payment-name">{method.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContinuousPaymentBar;