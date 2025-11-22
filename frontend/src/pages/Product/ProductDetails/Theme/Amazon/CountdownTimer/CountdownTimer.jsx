import React, { useEffect, useState } from 'react';
import './CountdownTimer.css';

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date();

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="simple-countdown">
            <div className="countdown-message">
                🎁 تخفيض لمدة محدودة


                {/* // بدائل للجملة:
"⏰ الوقت المتبقي على العرض:"
"🔥 العرض ينتهي خلال:"
"💫 لا تفوت الفرصة:"
"🚀 سارع، ينتهي خلال:"
"🎁 تخفيض لمدة محدودة:" */}

            </div>

            <div className="countdown-timer">
                <div className="time-section">
                    <span className="time-number">{timeLeft.days}</span>
                    <span className="time-label">أيام</span>
                </div>

                <div className="time-separator">:</div>

                <div className="time-section">
                    <span className="time-number">
                        {timeLeft.hours.toString().padStart(2, '0')}
                    </span>
                    <span className="time-label">ساعات</span>
                </div>

                <div className="time-separator">:</div>

                <div className="time-section">
                    <span className="time-number">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="time-label">دقائق</span>
                </div>

                <div className="time-separator">:</div>

                <div className="time-section">
                    <span className="time-number">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="time-label">ثواني</span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;