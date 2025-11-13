from rest_framework import serializers
from .models import Customers
from django.db.models import Sum

class CustomersSerializer(serializers.ModelSerializer):
    total_spending = serializers.SerializerMethodField()
    lastOrderDate = serializers.SerializerMethodField()

    class Meta:
        model = Customers
        fields = '__all__'  
 
    def get_total_spending(self, obj):
        total = obj.order.aggregate(total_spent=Sum('total'))['total_spent']
        return round(total or 0, 2)

    def get_lastOrderDate(self, obj):
        last_order = obj.order.order_by('-created_at').first()
        if last_order:
            return last_order.created_at.strftime('%Y-%m-%d %H:%M')
        return None

 