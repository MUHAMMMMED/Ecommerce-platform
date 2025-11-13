 
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from orders.models import Order, OrderItem
from cart.models import Cart
from customers.models import Customers
from .utils import generate_invoice_number, generate_tracking_number
import stripe
import json
import logging
from orders.views import order_detail

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY
DOMAIN = settings.DOMAIN

@csrf_exempt
def create_checkout_session(request):
    try:
        # print("📦 Step 1: Received request to create checkout session.")
        data = json.loads(request.body)
        # print("✅ Step 2: Parsed JSON:", data)

        order_id = data.get("order_id")
     
        currency = data.get("currency", "usd").lower()  # default to usd if not provided

        if not order_id:
            return JsonResponse({"error": "order_id is required"}, status=400)

        # ✅ تحقق من الأوردر
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found"}, status=404)

        if not order.total or order.total <= 0:
            return JsonResponse({"error": "Invalid order total amount"}, status=400)

        amount = int(order.total * 100)  # تحويل إلى أصغر وحدة للعملة

        # ✅ تحقق من الحد الأدنى لكل عملة حسب Stripe
        min_amounts = {
            'usd': 0.5,
            'sar': 2,
            'egp': 26
        }
        min_required = min_amounts.get(currency, 0.5)

        if order.total < min_required:
            return JsonResponse({
                "error": f"Stripe لا يقبل أقل من {min_required} {currency.upper()} تقريبًا."
            }, status=400)

        # ✅ اسم العملة الجميل
        currency_labels = {
            'usd': 'الدولار الأمريكي',
            'sar': 'ريال سعودي',
            'egp': 'جنيه مصري'
        }
        currency_label = currency_labels.get(currency, currency.upper())

        # print(f"🔎 Step 3: order_id={order_id}, amount={amount} ({currency})")

        session = stripe.checkout.Session.create(
            ui_mode='embedded',
             payment_method_types=["card"],
            line_items=[{
                'price_data': {
                    'currency': currency,
                    'unit_amount': amount,
                    'product_data': {
                        'name': f'إجمالي المبلغ المطلوب دفعه ({currency_label})',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            return_url=f'{DOMAIN}/success',
            customer_creation='if_required',
            metadata={
                'order_id': order_id,
                'currency': currency
            },
        )

        # print("✅ Step 4: Session created successfully.")
        return JsonResponse({
            'clientSecret': session.client_secret,
            'sessionId': session.id
        })

    except Exception as e:
        # print("🔥 ERROR occurred while creating session.")
        # print(f"❗ Exception: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)

 
 

@csrf_exempt
def stripe_webhook(request):
    # print("📩 Webhook received.")
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        # print("✅ Webhook verified successfully.")
    except ValueError as e:
        # print("❌ Invalid payload:", e)
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        # print("❌ Invalid signature:", e)
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    # print("📦 Event type:", event['type'])

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # print("✅ checkout.session.completed received")
        # print("📦 Session content:", session)

        order_id = session.get("metadata", {}).get("order_id")
        email = session.get('customer_details', {}).get('email')
        # print("🆔 order_id:", order_id)
        # print("📧 email:", email)

        if order_id:
            complete_order_payment(order_id, email)

    return JsonResponse({'status': 'success'})





def complete_order_payment(order_id, email):
    # print(f"🚀 Starting payment completion for order: {order_id}")
    try:
        order = Order.objects.get(id=order_id)
        # print(f"✅ Order found: #{order.id}")

        if order.paid:
            print("💳 Order is already marked as paid. Skipping.")
            return

        invoice_number = generate_invoice_number()
        tracking_number = generate_tracking_number()

        order.paid = True
        order.invoice_number = invoice_number
        order.tracking = tracking_number
        # order.session_key = ''
        order.save()
        # print(f"💾 Order updated: paid=True, invoice={invoice_number}, tracking={tracking_number}")

        customer = Customers.objects.get(id=order.customer.id)
        # print(f"👤 Customer found: {customer.name}")

        customer.email = email
        customer.save()
        # print(f"📧 Customer email updated to: {email}")

        items = OrderItem.objects.filter(order_id=order_id)
        # print(f"📦 Found {items.count()} order items. Marking as paid...")
        for item in items:
            item.paid = True
            item.save()
            # print(f"   ✅ Item {item.id} marked as paid")

        try:
            cart = Cart.objects.get(session_id=order.session_key)
            cart.delete()
            # print(f"🗑️ Cart with session_key {order.session_key} deleted.")
        except Cart.DoesNotExist:
            print(f"⚠️ Cart with session_key {order.session_key} does not exist")
        order_detail(order.id)

        # logger.info(f"Order {order_id} completed successfully.")
        # print(f"✅ Order {order_id} payment processing completed.")

    except Order.DoesNotExist:
        # logger.error(f"Order with id {order_id} does not exist.")
        print(f"❌ Order with id {order_id} does not exist.")



