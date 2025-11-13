from django.urls import include, path
from rest_framework import routers
from .views import ImageCategoryViewSet, ImageLibraryViewSet 

router = routers.DefaultRouter()
router.register(r'image-categories', ImageCategoryViewSet, basename='image-category')
router.register(r'image-library', ImageLibraryViewSet, basename='image-library')
 
urlpatterns = [
    path('', include(router.urls)),
]