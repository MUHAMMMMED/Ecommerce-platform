import React from 'react';
import img1 from "./1.png";
import img2 from "./2.png";
import img21 from "./21.png";
import img4 from "./4.png";
import img5 from "./5.png";
import img6 from "./6.png";
import img8 from "./8.png";
import './ContinuousPayment.css';

const ContinuousPayment = () => {
    const paymentMethods = [
        { id: 1, name: 'Visa', logo: img1 },
        { id: 2, name: 'MasterCard', logo: img2 },
        { id: 4, name: 'Apple Pay', logo: img4 },
        { id: 5, name: 'Google Pay', logo: img5 },
        { id: 6, name: 'Stripe', logo: img6 },
        { id: 8, name: 'مصرف الراجحي', logo: img8 },
        { id: 21, name: 'HSBC السعودية', logo: img21 },
    ];

    // Duplicate the array to create seamless loop
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
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContinuousPayment;