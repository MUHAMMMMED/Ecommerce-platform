
from rest_framework import serializers
from .models import Shipping_Company, shipping_Country

class ShippingCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipping_Company
        fields = ['id', 'image', 'name', 'shipping_price', 'discount_price', 'work_days']

class ShippingCountrySerializer(serializers.ModelSerializer):
    Shipping = ShippingCompanySerializer(many=True, read_only=True)

    class Meta:
        model = shipping_Country
        fields = ['id', 'name', 'tax', 'Shipping']