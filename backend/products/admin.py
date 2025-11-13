from django.contrib import admin
from .models import  *

admin.site.register(Settings)
admin.site.register(Product)
admin.site.register(DictionaryProductName)
admin.site.register(Size)
admin.site.register(Color)
# admin.site.register(ProductImage)
admin.site.register(InventoryLog)
admin.site.register(Category)
admin.site.register(ProductAttribute)
admin.site.register(ProductVariant)
admin.site.register(LandingComponent)

  