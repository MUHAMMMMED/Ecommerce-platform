import React, { useEffect, useState } from 'react';
import img1 from "./1.png";
import img10 from "./10.png";
import img11 from "./11.png";
import img12 from "./12.png";
import img13 from "./13.png";
import img14 from "./14.png";
import img15 from "./15.png";
import img16 from "./16.png";
import img17 from "./17.png";
import img18 from "./18.png";
import img19 from "./19.png";
import img2 from "./2.png";
import img20 from "./20.png";
import img21 from "./21.png";
import img3 from "./3.png";
import img4 from "./4.png";
import img5 from "./5.png";
import img6 from "./6.png";
import img7 from "./7.png";
import img8 from "./8.png";
import img9 from "./9.png";
import './PaymentHeader.css';


const PaymentHeader = () => {
    const [currentGroup, setCurrentGroup] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    const paymentMethods = [
        { id: 1, name: 'Visa', logo: img1 },
        { id: 2, name: 'MasterCard', logo: img2 },
        { id: 3, name: 'PayPal', logo: img3 },
        { id: 4, name: 'Apple Pay', logo: img4 },
        { id: 5, name: 'Google Pay', logo: img5 },
        { id: 6, name: 'Stripe', logo: img6 },
        { id: 7, name: 'البنك الأهلي السعودي', logo: img7 },
        { id: 8, name: 'مصرف الراجحي', logo: img8 },
        { id: 9, name: 'بنك الرياض', logo: img9 },
        { id: 10, name: 'بنك ساب', logo: img10 },
        { id: 11, name: 'بنك البلاد', logo: img11 },
        { id: 12, name: 'بنك الجزيرة', logo: img12 },
        { id: 13, name: 'بنك الإنماء', logo: img13 },
        { id: 14, name: 'البنك العربي الوطني', logo: img14 },
        { id: 15, name: 'بنك الخليج الدولي', logo: img15 },
        { id: 16, name: 'بنك أبوظبي الأول', logo: img16 },
        { id: 17, name: 'البنك السعودي الفرنسي', logo: img17 },
        { id: 18, name: 'البنك السعودي للاستثمار', logo: img18 },
        { id: 19, name: 'بنك الإمارات دبي الوطني', logo: img19 },
        { id: 20, name: 'سيتي بنك', logo: img20 },
        { id: 21, name: 'HSBC السعودية', logo: img21 },
    ];

    // تحديد عدد الصور حسب حجم الشاشة
    const getGroupSize = () => {
        if (window.innerWidth < 768) return 5; // موبايل
        if (window.innerWidth < 1024) return 10; // تابلت
        return 8; // كمبيوتر
    };

    const [groupSize, setGroupSize] = useState(getGroupSize());

    // تحديث حجم المجموعة عند تغيير حجم الشاشة
    useEffect(() => {
        const handleResize = () => {
            setGroupSize(getGroupSize());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // تقسيم الصور إلى مجموعات حسب حجم الشاشة
    const groups = [];
    for (let i = 0; i < paymentMethods.length; i += groupSize) {
        groups.push(paymentMethods.slice(i, i + groupSize));
    }

    useEffect(() => {
        if (isPaused || groups.length <= 1) return;

        const cycleGroups = () => {
            setIsVisible(false);

            setTimeout(() => {
                setCurrentGroup((prev) => (prev + 1) % groups.length);
                setIsVisible(true);
            }, 400);
        };

        const interval = setInterval(cycleGroups, 2500);

        return () => clearInterval(interval);
    }, [isPaused, groups.length]);

    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    const currentGroupMethods = groups[currentGroup] || [];

    return (
        <div className="payment-header">


            {/* شريط وسائل الدفع */}
            <div className="payment-methods-bar">
                <div
                    className="payment-methods-wrapper"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* عنوان وسائل الدفع */}
                    <div className="payment-title">
                        <span className="payment-icon">💳</span>
                        وسائل الدفع المتاحة
                    </div>

                    <div className={`payment-group ${isVisible ? 'visible' : 'hidden'}`}>
                        {currentGroupMethods.map((method) => (
                            <div key={method.id} className="payment-method-item">
                                <img
                                    src={method.logo}
                                    alt={method.name}
                                    className="payment-method-logo"
                                    title={method.name}
                                />
                            </div>
                        ))}
                    </div>

                    {/* مؤشر التقدم - يظهر فقط إذا كان هناك أكثر من مجموعة */}
                    {groups.length > 1 && (
                        <div className="progress-indicator">
                            {groups.map((_, index) => (
                                <div
                                    key={index}
                                    className={`progress-dot ${index === currentGroup ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* شعار الموقع */}
            <div className="site-logo-container">
                <br />
                <h1 className="site-logo-text">ALTAUREA</h1>
            </div>
        </div>
    );
};

export default PaymentHeader;