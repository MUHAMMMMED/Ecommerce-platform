from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import*

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorites')
router.register(r'coupons', CouponViewSet, basename='coupons-viewset')

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('add/', AddToCartView.as_view(), name='add-to-cart'),
    path('update_quantity/<int:cart_item_id>/', UpdateQuantityView.as_view(), name='update-quantity'),
    path('delete-cart-item/<int:cart_item_id>/', DeleteCartItemView.as_view(), name='delete-cart-item'),
    path('add-note/<int:cart_item_id>/', AddNoteView.as_view(), name='add-note'),
    path('delete-note/<int:cart_item_id>/<int:note_id>/', DeleteNoteView.as_view(), name='delete-note'),
    path('coupon/apply/', ApplyCouponView.as_view(), name='apply_coupon'),

]+ router.urls