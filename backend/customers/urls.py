from rest_framework import routers
from django.urls import include, path
from .views import CustomersViewSet

router = routers.DefaultRouter()
router.register(r'customers', CustomersViewSet)

urlpatterns = [path('', include(router.urls))]