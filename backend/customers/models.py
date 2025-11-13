from django.db import models
from shipping.models import shipping_Country

class Customers(models.Model):
    session_key = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.CharField(max_length=50, blank=True, null=True)
    country = models.ForeignKey(shipping_Country, on_delete=models.CASCADE, blank=True, null=True)
    governorate = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    neighborhood = models.CharField(max_length=100)
    street = models.CharField(max_length=100, blank=True, null=True)
    shipping_address = models.CharField(max_length=500, blank=True, null=True)
    purchase_count = models.PositiveIntegerField(default=0, blank=True, null=True)
    total_spending = models.FloatField(default=0)
    def __str__(self):
        return self.name