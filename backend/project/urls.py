 
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
 

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/shipping/', include('shipping.urls')),
    path('api/media/', include('media_library.urls')),
    path('api/Users/', include('accounts.urls')),
    path('api/payment/', include('payment.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)