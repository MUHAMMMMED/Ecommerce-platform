from rest_framework import serializers
import logging
from django.db import transaction
from .models import Order, Settings
from .order_utils import *
from .models import  *
from shipping.models import  *
from cart.models import *
 
class PackageSerializer(serializers.ModelSerializer):
    is_empty = serializers.BooleanField(read_only=True)

    class Meta:
        model = Package
        fields = ['id', 'image', 'name', 'description', 'quantity', 'stock_alarm', 'is_empty']



class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'note']  

 
class Shipping_CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipping_Company
        fields = '__all__'


 
class ColorDictionarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorDictionary
        fields = '__all__'


 
class SizeDictionarySerializer(serializers.ModelSerializer):
    class Meta:
        model = SizeDictionary
        fields = '__all__'

 
class ProductNameDictionarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductNameDictionary
        fields = '__all__'

  
class PriceDictionarySerializer(serializers.ModelSerializer):
    class Meta:
        model =PriceDictionary
        fields = '__all__'
 
class ProductMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title','code']


class OrderItemSerializer(serializers.ModelSerializer):
    product_title = ProductNameDictionarySerializer(read_only=True)
    variant_size = SizeDictionarySerializer(read_only=True)
    variant_color = ColorDictionarySerializer(read_only=True)
    price = PriceDictionarySerializer(read_only=True)
    product = ProductMiniSerializer(read_only=True)  
    # variant = serializers.StringRelatedField(read_only=True)  
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

 
 
class Shipping_CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipping_Company
        fields = '__all__'

    def create(self, validated_data):
        # Retrieve Country ID from the context
        Country_id = self.context.get('Country_id')
        if not Country_id:
            raise serializers.ValidationError({"Country_id": "Country ID is required."})
        
        try:
            # Fetch the shipping_Country instance
            country = shipping_Country.objects.get(id=Country_id)
        except shipping_Country.DoesNotExist:
            raise serializers.ValidationError({"Country_id": "Invalid Country ID."})

        # Create the Shipping_Company instance
        shipping_company = Shipping_Company.objects.create(**validated_data)
        country.Shipping.add(shipping_company)  # Associate the shipping company with the country
        return shipping_company
 


 
 
  
class shipping_CountrySerializer(serializers.ModelSerializer):
    Shipping = Shipping_CompanySerializer(many=True, read_only=True)  # Make it read-only

    class Meta:
        model = shipping_Country
        fields = "__all__"

    def create(self, validated_data):
        # Remove 'Shipping' from validated_data if it exists
        validated_data.pop('Shipping', None)
        
        # Create the shipping_Country instance
        return shipping_Country.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Remove 'Shipping' from validated_data if it exists
        validated_data.pop('Shipping', None)
        
        # Update the instance with remaining data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class CustomerSerializer(serializers.ModelSerializer):
    country = shipping_CountrySerializer( read_only=True)  # Make it read-only

    class Meta:
        model = Customers
        fields = ['name', 'phone', 'email', 'country', 'governorate', 'city', 'neighborhood', 'street', 'shipping_address']
  
 
logger = logging.getLogger(__name__)
class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(required=False)
    # PackageSerializer
    items = OrderItemSerializer(many=True, required=False, read_only=True)
    cartItems = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    cartId = serializers.IntegerField(write_only=True, required=False)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=False)
    country = serializers.IntegerField(write_only=True, required=False)
    city = serializers.CharField(write_only=True, required=False)
    neighborhood = serializers.CharField(write_only=True, required=False)
    street = serializers.CharField(write_only=True, required=False, allow_blank=True)
    Shipping = serializers.IntegerField(write_only=True, required=False)
    shipping_company = Shipping_CompanySerializer(read_only=True)
    currency = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'created_at', 'tax_amount', 'shipping', 'total',
            'shipping_company', 'anticipation', 'tracking', 'invoice_number',
            'paid', 'status', 'package', 'customer', 'items',
            'cartId', 'cartItems', 'name', 'phone', 'country', 'city',
            'neighborhood', 'street', 'Shipping', 'currency', 'session_key'
        ]

    def create(self, validated_data):
        logger.info("📦 Starting order creation with data: %s", validated_data)

        with transaction.atomic():
            # Extract data
            name = validated_data.pop('name', '')
            phone = validated_data.pop('phone', None)
            country = validated_data.pop('country', None)
            city = validated_data.pop('city', None)
            neighborhood = validated_data.pop('neighborhood', None)
            street = validated_data.pop('street', '')
            shipping_company_id = validated_data.pop('Shipping', None)
            cart_items = validated_data.pop('cartItems', [])
            cart_id = validated_data.pop('cartId', None)
            customer_data = validated_data.pop('customer', None)

            logger.info("🔍 cartItems received: %s", cart_items)

            # Get session key from cart
            session_key = get_cart(cart_id)

            # Get shipping company
            shipping_company = get_shipping_company(shipping_company_id)

            # Get or create customer
            customer = get_or_create_customer(customer_data, name, phone, country, city, neighborhood, street)

            # Create order
            order = Order.objects.create(
                **validated_data,
                customer=customer,
                shipping_company=shipping_company,
                session_key=session_key
            )
            logger.info(f"✅ Order created: {order.id}")
            # ✅ Update customer metrics
            customer.purchase_count = (customer.purchase_count or 0) + 1
            customer.total_spending = (customer.total_spending or 0) + float(order.total)
            customer.save()
            # Create order items
            if cart_items:
                create_order_items(order, cart_items)
            else:
                logger.warning("⚠️ No cart items provided, order created without items.")

            return order

    def validate(self, data):
        request = self.context.get('request')
        if request and request.method in ['POST', 'PUT']:
            logger.info("🔍 Validating data: %s", data)
            if not data.get('customer') and not data.get('phone'):
                logger.error("❌ Validation failed: Phone field is required.")
                raise serializers.ValidationError({"customer": "Phone field is required."})
            if not data.get('cartItems') and not data.get('cartId'):
                logger.error("❌ Validation failed: Cart items or cartId is required.")
                raise serializers.ValidationError({"cartItems": "Cart items or cartId is required."})
        return data

    def get_currency(self, obj):
        settings = Settings.objects.first()
        return settings.currency if settings else None