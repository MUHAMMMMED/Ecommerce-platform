from django.db import models

class Shipping_Company(models.Model):
    image = models.ImageField(upload_to="files/images/Item/%Y/%m/%d/", blank=True, null=True)
    name = models.CharField(max_length=50)
    shipping_price = models.FloatField(default=0)
    discount_price = models.FloatField(default=0)
    work_days = models.CharField(max_length=50)
    def __str__(self):
        return self.name

class shipping_Country(models.Model):
    name = models.CharField(max_length=50)
    tax = models.IntegerField(default=0)
    Shipping = models.ManyToManyField(Shipping_Company, blank=True)
    def __str__(self):
        return self.name