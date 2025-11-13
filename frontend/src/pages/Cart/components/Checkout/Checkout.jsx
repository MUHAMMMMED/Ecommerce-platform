import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Config from '../../../../Authentication/config';
import Header from '../../../../components/Header/Header';
import PaymentHeader from './components/PaymentHeader/PaymentHeader';

const stripePromise = loadStripe('pk_live_51PrGjb08z0yVWYfauWemGmGBL0Ut5qcTxOqH4hFUMQDMzxCC5wlUM2jN8b8oV5CAhgtv1ubJ6OGePBJ7DcCynkGU00PqB6MjWd"');

export default function Checkout() {
    const { id: orderId } = useParams();

    // 👇 يمكنك تغيير العملة حسب الحاجة (مثلاً من "egp" إلى "usd" أو "sar")
    const currency = 'SAR';

    // 📝 قائمة العملات والحد الأدنى لها في Stripe:
    /**
     * ✅ Stripe Minimum Amounts (by currency)
     * ---------------------------------------
     * USD: 0.50 دولار    → 50 cents
     * EGP: 26   جنيه     → 2600 قرش
     * SAR: 2    ريال      → 200 هللة
     * EUR: 0.50 يورو     → 50 cents
     * GBP: 0.30 جنيه     → 30 pence
     */

    const fetchClientSecret = useCallback(() => {
        if (!orderId) {
            throw new Error('Missing order data');
        }

        return fetch(`${Config.baseURL}/api/payment/create-checkout-session/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: orderId,
                currency: currency,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.clientSecret) {
                    throw new Error('مفقود clientSecret من الاستجابة');
                }
                return data.clientSecret;
            });
    }, [orderId, currency]);

    if (!orderId) return null;

    return (
        <>
            <Header />

            <br />
            <PaymentHeader />
            <div
                style={{
                    width: '500px',
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto',
                }}
            >
                <div id="checkout" style={{ width: '100%', background: '#fff' }}>
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{
                            fetchClientSecret,
                            locale: 'ar',
                        }}>
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>



                </div>
            </div>
        </>
    );
}