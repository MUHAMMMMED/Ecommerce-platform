from rest_framework import serializers
from .models import *


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields ="__all__"
 
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'note']  

  
class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name']

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code']

 
class ProductVariantSerializer(serializers.ModelSerializer):
    size = SizeSerializer(read_only=True)
    color = ColorSerializer(read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'color', 'price', 'stock', 'image']


class ProductSerializer(serializers.ModelSerializer):
    currency = serializers.SerializerMethodField()  
    class Meta:
        model = Product
        fields = ['id', 'title','isNot' , 'base_price', 'image','currency']

    def get_currency(self, obj):
        settings = Settings.objects.first()
        return settings.currency if settings else None

 


class CartItem_Serializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    discount_price = serializers.SerializerMethodField()
  
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'variant', 'quantity', 'discount_price', 'notes']

    def get_discount_price(self, obj):
        if obj.variant:
            return obj.variant.price * (1 - obj.product.discount / 100)
        return obj.product.base_price * (1 - obj.product.discount / 100)

 

class Cart_Serializer(serializers.ModelSerializer):
    cart_items = CartItem_Serializer(source='items', many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()  

    class Meta:
        model = Cart
        fields = ['id', 'session_id', 'created_at', 'total_price', 'cart_items', 'currency']
    def get_total_price(self, obj):
        total = 0
        for item in obj.items.all():
            if item.variant:
                price = item.variant.price
            else:
                price = item.product.base_price
            discount = getattr(item.product, 'discount', 0)
            discounted_price = price * (1 - discount / 100)
            total += discounted_price * item.quantity
        return round(total, 2)

    def get_currency(self, obj):
        settings = Settings.objects.first()
        return settings.currency if settings else None


 


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    session_key = serializers.CharField(read_only=True)
    is_session_owner = serializers.SerializerMethodField()  # ✅

    class Meta:
        model = Favorite
        fields = ['id', 'session_key', 'product', 'is_session_owner']

    def get_is_session_owner(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        return obj.session_key == request.session.session_key