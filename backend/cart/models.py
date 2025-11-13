from django.db import models
from products.models import *

class Note(models.Model):
    note = models.TextField()
    def __str__(self):
        return self.note

class Cart(models.Model):
    session_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.session_id
 
 
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, blank=True, null=True)
    variant = models.ForeignKey(ProductVariant , on_delete=models.CASCADE, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    notes = models.ManyToManyField(Note, blank=True)
    def __str__(self):
        return f"{self.product.title}   - {self.quantity}"
    




class Coupon(models.Model):
    code = models.CharField(max_length=100)
    discount = models.FloatField(default=0, blank=True, null=True)
    coupon_usage = models.FloatField(default=0)
    expiryDate = models.DateField(blank=True, null=True)
    def __str__(self):
        return self.code

class Favorite(models.Model):
    session_key = models.CharField(max_length=40)
    product = models.ForeignKey(Product, related_name='favorited_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('session_key', 'product')
    def __str__(self):
        return f"Favorite {self.product.title} for {self.session_key}"
    
 

 