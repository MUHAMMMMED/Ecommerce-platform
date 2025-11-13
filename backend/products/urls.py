 
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet, basename='variant')
router.register(r'sizes', SizeViewSet, basename='size')
router.register(r'colors', ColorViewSet, basename='color')
router.register(r'attributes', ProductAttributeViewSet, basename='attribute')
router.register(r'components', LandingComponentViewSet, basename='component')
router.register(r'settings', SettingsViewSet, basename='settings')

urlpatterns = [

    path('setting-view/', SettingsDetail.as_view(), name='setting-view'),
    path('products-list/', ProductListView.as_view(), name='products-list'),
    path('category/<int:id>/', CategoryDetailView.as_view(), name='category-detail'),
    path('product-details/<int:id>/', ProductDetailView.as_view(), name='product-details'),

    # Explicit nested routes for attributes
    path('<int:product_pk>/attributes/', ProductAttributeViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-attributes-list'),
    path('<int:product_pk>/attributes/<int:pk>/', ProductAttributeViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='product-attributes-detail'),
    # Explicit nested routes for variants
    path('<int:product_pk>/variants/', ProductVariantViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-variants-list'),
    path('<int:product_pk>/variants/<int:pk>/', ProductVariantViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='product-variants-detail'),
    # Explicit nested routes for components
    path('<int:product_pk>/components/', LandingComponentViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-components-list'),
    path('<int:product_pk>/components/<int:pk>/', LandingComponentViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='product-components-detail'),
    path('', include(router.urls)),
]
 