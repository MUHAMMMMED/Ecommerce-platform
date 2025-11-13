 
from rest_framework import routers
from .views import ShippingCountryViewSet, ShippingCompanyViewSet

router = routers.DefaultRouter()
router.register(r'country', ShippingCountryViewSet, basename='shipping-country')
router.register(r'company', ShippingCompanyViewSet, basename='shipping-company')

urlpatterns = router.urls