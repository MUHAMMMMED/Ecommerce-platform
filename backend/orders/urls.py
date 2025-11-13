
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'shipping-countries', shipping_CountryViewSet, basename='shipping-countries')
router.register(r'packages', PackageViewSet, basename='package')
 

urlpatterns = [
  
    path('shipping-company/<int:id>/', Shipping_CompanyView.as_view(), name='shipping-Company'),
    path('invoice/',InvoiceDetail.as_view(), name='invoice'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('update/<int:pk>/', OrderUpdateView.as_view(), name='order-update'),
]

# Include the router URLs
urlpatterns += router.urls







 