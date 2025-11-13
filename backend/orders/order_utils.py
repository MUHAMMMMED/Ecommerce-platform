import logging
from rest_framework import serializers
from decimal import Decimal, ROUND_HALF_UP
from .models import  *
from shipping.models import  *
from cart.models import *
from products.models import *

 
logger = logging.getLogger(__name__)

def get_cart(cart_id):
    """Retrieve cart by ID and return session key."""
    if not cart_id:
        return None
    try:
        cart = Cart.objects.get(id=cart_id)
        logger.info(f"🛒 Cart found with session key: {cart.session_id}")
        return cart.session_id
    except Cart.DoesNotExist:
        logger.error(f"❌ Cart with ID {cart_id} does not exist.")
        raise serializers.ValidationError({"cartId": f"Cart with ID {cart_id} does not exist."})

def get_shipping_company(shipping_company_id):
    """Retrieve shipping company by ID."""
    if not shipping_company_id:
        return None
    try:
        shipping_company = Shipping_Company.objects.get(id=shipping_company_id)
        logger.info(f"🚚 Shipping company found: {shipping_company}")
        return shipping_company
    except Shipping_Company.DoesNotExist:
        logger.error("❌ Invalid Shipping Company ID.")
        raise serializers.ValidationError({"Shipping": "Invalid Shipping Company ID."})

def get_or_create_customer(customer_data, name, phone, country, city, neighborhood, street):
    """Get or create customer based on provided data."""
    if not phone and not customer_data:
        logger.error("❌ Phone field is required.")
        raise serializers.ValidationError({"customer": "Phone field is required."})

    if customer_data:
        phone = customer_data.get('phone')
        customer, created = Customers.objects.get_or_create(phone=phone, defaults=customer_data)
        if not created:
            updated = False
            for field in ['name', 'country', 'city', 'neighborhood', 'street']:
                new_value = customer_data.get(field)
                if new_value and getattr(customer, field, None) != new_value:
                    setattr(customer, field, new_value)
                    updated = True
            if updated:
                customer.save()
                logger.info(f"👤 Updated existing customer: {phone}")
    else:
        try:
            customer_data = {
                'name': name,
                'phone': phone,
                'country': Customers.country.field.remote_field.model.objects.get(id=country) if country else None,
                'city': city,
                'neighborhood': neighborhood,
                'street': street,
            }
        except Exception as e:
            logger.error("❗ Failed to get country object: %s", e)
            customer_data['country'] = None

        customer, created = Customers.objects.get_or_create(phone=phone, defaults=customer_data)
        if not created:
            updated = False
            for field, value in customer_data.items():
                if value and getattr(customer, field, None) != value:
                    setattr(customer, field, value)
                    updated = True
            if updated:
                customer.save()
                logger.info(f"👤 Updated customer fields for phone: {phone}")
    return customer

   




logger = logging.getLogger(__name__)

 
def create_order_items(order, cart_items):
    """Create order items for the given order using only the final price from the request."""
    if not cart_items:
        logger.warning("⚠️ No cart items provided, skipping order item creation.")
        return

    for index, item in enumerate(cart_items, start=1):
        logger.info("🧩 Processing item #%s: %s", index, item)
        try:
            product_id = item.get('product')
            variant_id = item.get('variant')
            size = item.get('size')
            color = item.get('color')
            quantity = item.get('quantity', 1)
            raw_price = item.get('price')  # ❗ السعر القادم من الواجهة فقط
            notes_data = item.get('notes', [])

            logger.info("🔍 Step 1 - Raw values: product_id=%s, variant_id=%s, size=%s, color=%s, quantity=%s, price=%s", 
                        product_id, variant_id, size, color, quantity, raw_price)

            # ✅ تأكد من وجود المنتج والسعر
            if not product_id or raw_price is None:
                logger.error("❌ Missing required fields (product, price) in item: %s", item)
                raise serializers.ValidationError({"cartItems": "Missing required fields (product, price)."})

            # ✅ تحويل السعر إلى Decimal مضبوط
            try:
                price = Decimal(str(raw_price)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                logger.info(f"💰 Step 2 - Final price (Decimal): {price}")
            except Exception as e:
                logger.error("❌ Invalid price format: %s", raw_price)
                raise serializers.ValidationError({"cartItems": "Invalid price format."})

            # ✅ استدعاء المنتج
            try:
                product = Product.objects.get(id=product_id)
                logger.info(f"📦 Step 3 - Product retrieved: {product.title}")
            except Product.DoesNotExist:
                logger.error(f"❌ Product with ID {product_id} does not exist.")
                raise serializers.ValidationError({"cartItems": f"Product with ID {product_id} does not exist."})

            # ✅ التحقق من الـ variant (إن وجد فقط)
            variant = None
            if variant_id:
                try:
                    variant = ProductVariant.objects.get(id=variant_id, product=product)
                    logger.info(f"🧬 Step 4 - Variant found: {variant_id}")
                except ProductVariant.DoesNotExist:
                    logger.error(f"❌ Variant with ID {variant_id} does not exist.")
                    raise serializers.ValidationError({
                        "cartItems": f"Variant with ID {variant_id} does not exist or not linked to product {product_id}."
                    })

            # ✅ القيم المرتبطة بالقواميس
            product_title_obj, _ = ProductNameDictionary.objects.get_or_create(title=product.title)
            size_obj = SizeDictionary.objects.get_or_create(name=size)[0] if size else None
            color_name = None
            if isinstance(color, dict):
                color_name = color.get('name')
            elif isinstance(color, str) and color.strip():
                color_name = color.strip()
            color_obj = ColorDictionary.objects.get_or_create(name=color_name)[0] if color_name else None
            price_obj, created_price = PriceDictionary.objects.get_or_create(amount=price)

            logger.info(f"📖 Step 5 - Dictionaries: product_title={product_title_obj}, size={size_obj}, color={color_obj}, price={price_obj.amount} (created: {created_price})")

            # ✅ إنشاء عنصر الطلب
            order_item = OrderItem.objects.create(
                order=order,
                product=product,
                variant=variant,
                quantity=quantity,
                product_title=product_title_obj,
                variant_size=size_obj,
                variant_color=color_obj,
                price=price_obj
            )
            logger.info(f"✅ Step 6 - Order item created: ID {order_item.id}")

            # ✅ إضافة الملاحظات (إن وجدت)
            if notes_data:
                notes_to_add = []
                for note_data in notes_data:
                    note_text = note_data.get('text')
                    note_id = note_data.get('id')
                    if note_text:
                        note = Note.objects.filter(id=note_id, note=note_text).first() if note_id else None
                        if not note:
                            note, _ = Note.objects.get_or_create(note=note_text)
                        notes_to_add.append(note)
                if notes_to_add:
                    order_item.notes.add(*notes_to_add)
                    logger.info(f"📝 Step 7 - Notes added to order item ID {order_item.id}")

        except Exception as e:
            logger.error("❌ Error while creating order item #%s: %s", index, str(e))
            raise serializers.ValidationError({"cartItems": f"Error creating order item #{index}: {str(e)}"})