from django.urls import path
from .views import  *


urlpatterns = [
    path('create-checkout-session/',  create_checkout_session, name='create_checkout_session'),
    path('stripe_webhooks/',  stripe_webhook, name='stripe_webhook'),
]
# https://docs.stripe.com/stripe-cli

# brew install stripe/stripe-cli/stripe
# stripe login

# stripe listen --forward-to localhost:8000/api/payment/stripe_webhooks/
# stripe listen --events=payment_intent.succeeded

 


 