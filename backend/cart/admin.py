from django.contrib import admin
from .models import Cart, CartItem, Note, Coupon, Favorite
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Note)
admin.site.register(Coupon)
admin.site.register(Favorite)