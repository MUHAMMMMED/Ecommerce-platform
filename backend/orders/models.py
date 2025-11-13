from django.db import models
from shipping.models import Shipping_Company
from customers.models import Customers
from products.models import *
from cart.models import Note


class Package(models.Model):
    image = models.FileField(upload_to="files/images/Item/%Y/%m/%d/", blank=True, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField()
    stock_alarm = models.IntegerField(default=0)
    def __str__(self):
        return f'{self.name} - {self.quantity} units'
    @property
    def is_empty(self):
        return self.quantity == 0

class Order(models.Model):
    STATUS_CHOICES = [
        ('P', 'Placed'), ('PU', 'Pick-up'), ('Di', 'Dispatched'),
        ('PA', 'Package Arrived'), ('DFD','Dispatched for Delivery'),
        ('D', 'Delivery'), ('C','Cancel'),
    ]
    DAY = [
        ('mon','الاثنين'), ('tue','الثلاثاء'), ('wed','الأربعاء'),
        ('thu','الخميس'), ('fri','الجمعة'), ('sat','السبت'), ('sun','الأحد'),
    ]
    created_at = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=100, blank=True, null=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping = models.FloatField(default=0)
    total = models.FloatField(default=0)
    shipping_company = models.ForeignKey(Shipping_Company, on_delete=models.CASCADE, blank=True, null=True)
    anticipation = models.CharField(max_length=20, choices=DAY, blank=True, null=True)
    tracking = models.CharField(max_length=50, blank=True, null=True)
    invoice_number = models.CharField(max_length=50, blank=True, null=True)
    paid = models.BooleanField(default=False)
    new = models.BooleanField(default=True)
    status = models.CharField(max_length=3, choices=STATUS_CHOICES, default='P')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, blank=True, null=True)
    customer = models.ForeignKey(Customers, on_delete=models.CASCADE, related_name='order', blank=True, null=True)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return self.customer.name if self.customer else "No customer assigned"
 

class ProductNameDictionary(models.Model):
    title = models.CharField(max_length=255, unique=True)

class SizeDictionary(models.Model):
    name = models.CharField(max_length=50, unique=True)

class ColorDictionary(models.Model):
    name = models.CharField(max_length=50, unique=True)

class PriceDictionary(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2, unique=True)

    def __str__(self):
        return f"{self.amount}"
    

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    product_title = models.ForeignKey(ProductNameDictionary, related_name='order_items', on_delete=models.SET_NULL, null=True, blank=True)
    variant_size = models.ForeignKey(SizeDictionary, related_name='order_items', on_delete=models.SET_NULL, null=True, blank=True)
    variant_color = models.ForeignKey(ColorDictionary, related_name='order_items', on_delete=models.SET_NULL, null=True, blank=True)
    price = models.ForeignKey(PriceDictionary, on_delete=models.SET_NULL, null=True, blank=True)
    cost = models.IntegerField(default=0)
    date_sold = models.DateField(auto_now_add=True)
    paid = models.BooleanField(default=False)
    notes = models.ManyToManyField(Note, blank=True)


 