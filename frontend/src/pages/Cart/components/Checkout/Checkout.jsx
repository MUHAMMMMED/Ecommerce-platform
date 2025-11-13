import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Config from '../../../../Authentication/config';
import Header from '../../../../components/Header/Header';
import './Checkout.css';
import ContinuousPayment from './components/PaymentHeader/ContinuousPayment';
import PaymentHeader from './components/PaymentHeader/PaymentHeader';

const stripePromise = loadStripe('pk_live_51PrGjb08z0yVWYfauWemGmGBL0Ut5qcTxOqH4hFUMQDMzxCC5wlUM2jN8b8oV5CAhgtv1ubJ6OGePBJ7DcCynkGU00PqB6MjWd');

export default function Checkout() {
    const { id: orderId } = useParams();
    const currency = 'SAR';

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
                currency,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.clientSecret) {
                    throw new Error('clientSecret is missing from response');
                }
                return data.clientSecret;
            });
    }, [orderId, currency]);

    if (!orderId) return null;

    return (
        <>
            <Header />
            <br />
            <ContinuousPayment />

            <div className="checkout-wrapper">
                <div id="checkout">
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{
                            fetchClientSecret,
                        }}>
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                </div>
            </div>

            <PaymentHeader />
        </>
    );
}