from django.db import models
from django.core.validators import RegexValidator

class Settings(models.Model):
    site_name = models.CharField(max_length=100, blank=True, null=True )
    # logo = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='logo/', blank=True, null=True)
    # landing_cover = models.URLField(blank=True, null=True)
    landing_cover= models.ImageField(upload_to='cover/', blank=True, null=True)
    currency = models.CharField(max_length=50, blank=True, null=True )
    email = models.EmailField(blank=True, null=True )
    phone = models.CharField(max_length=20, blank=True, null=True )
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True )
    address = models.TextField(blank=True, null=True )
    about = models.TextField(blank=True, null=True )
    facebook = models.URLField(blank=True, null=True )
    instagram = models.URLField(blank=True, null=True )
    twitter = models.URLField(blank=True, null=True )
    youtube = models.URLField(blank=True, null=True )
    tiktok = models.URLField(blank=True, null=True )
    linkedin = models.URLField(blank=True, null=True )

    def __str__(self):
        return self.site_name or "Settings"

class DictionaryProductName(models.Model):
    name = models.CharField(max_length=200)
    def __str__(self):
        return self.name
    


 
# class ProductImage(models.Model):
#     image = models.FileField(upload_to="files/images_Product/Item/%Y/%m/%d/", blank=True, null=True)
#     alt_text = models.CharField(max_length=255, blank=True)

#     def delete(self, *args, **kwargs):
#         self.image.delete(save=False)
#         super().delete(*args, **kwargs)


 
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # image_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='category/', blank=True, null=True)
    def __str__(self):
        return self.name




# توليد كود تلقائي للمنتج
def generate_product_code():
    last_code = Product.objects.order_by('-id').values_list('code', flat=True).first()
    if not last_code or not last_code[1:].isdigit():
        return "P001"
    next_code = int(last_code[1:]) + 1
    new_code = f"P{next_code:03d}"
    while Product.objects.filter(code=new_code).exists():
        next_code += 1
        new_code = f"P{next_code:03d}"
    return new_code

 
class Product(models.Model):
    theme = models.CharField(max_length=50, choices=[('modern', 'Modern'), ('classic', 'Classic'), ('simple', 'Simple'), ('amazon', 'Amazon') ], default='simple')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    code = models.CharField(max_length=50, unique=True)
    isNot = models.BooleanField(default=False)
    isSize = models.BooleanField(default=False)
    isColor = models.BooleanField(default=False)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    totalstock = models.PositiveIntegerField(default=0)
    stock_alarm = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    related_products = models.ManyToManyField('self', blank=True, null=True, symmetrical=True)
    categories = models.ManyToManyField('Category', related_name='product_set', blank=True)  # Added
  
    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_product_code()
        super().save(*args, **kwargs)

 

class Size(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="size",blank=True, null=True)
    name = models.CharField(max_length=50)
    stock = models.IntegerField(default=0)
    def __str__(self): return self.name
  
class Color(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="colors",blank=True, null=True)
    name = models.CharField(max_length=50)
    hex_code = models.CharField(
        max_length=7,
        blank=True,
        null=True,
        validators=[RegexValidator(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', 'Invalid hex color code')]   )
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [models.Index(fields=['name'])] 

 
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="files/images/variants/", blank=True, null=True)
    def __str__(self):
        return f"{self.product.title} - {self.size or ''} {self.color or ''}"

 
 
class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, related_name='attributes', on_delete=models.CASCADE)
    key = models.CharField(max_length=100)
    value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'key')

    def __str__(self):
        return f"{self.key}: {self.value}"

 
class LandingComponent(models.Model):
    product = models.ForeignKey(Product, related_name='components', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    html_code = models.TextField()
    index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['index']

    def __str__(self):
        return f"{self.title} ({self.product.title})"
    

class InventoryLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=[
        ('add', 'Add'),
        ('remove', 'Remove'),
        ('adjust', 'Adjust'),
    ])
    quantity = models.IntegerField()
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
  
    def __str__(self):
        return f"{self.product} - {self.action} ({self.quantity})"
    
 