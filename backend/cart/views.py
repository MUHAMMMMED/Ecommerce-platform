 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from .models import *
from products.models import *
from .serializers import*
from datetime import datetime
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
 
class CouponViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
 

class FavoriteViewSet(ModelViewSet):
    serializer_class = FavoriteSerializer
    queryset = Favorite.objects.all()

    def get_queryset(self):
        # احصل على session_key أو أنشئه
        session_key = self.request.session.session_key
      
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
        return Favorite.objects.filter(session_key=session_key)

    def get_serializer_context(self):
        return {'request': self.request}

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
       
        serializer = self.get_serializer(queryset, many=True)
        return Response({'results': serializer.data})

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key

        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        favorite = Favorite.objects.filter(session_key=session_key, product_id=product_id).first()
        if favorite:
            favorite.delete()
            return Response({'is_favorite': False}, status=status.HTTP_200_OK)

        new_favorite = Favorite.objects.create(session_key=session_key, product_id=product_id)
        serializer = self.get_serializer(new_favorite)
        return Response({'is_favorite': True, **serializer.data}, status=status.HTTP_201_CREATED)

 
# import logging 
 
# logger = logging.getLogger(__name__)

# class AddToCartView(APIView):
#     def post(self, request, *args, **kwargs):
#         print("=== AddToCartView POST ===")
#         print("Session key before check: %s", request.session.session_key)

#         if not request.session.session_key:
#             request.session.create()
#             print("Session created")

#         session_id = request.session.session_key
#         # logger.info("Session ID in use: %s", session_id)

#         product_id = request.data.get('product_id')
#         variant_id = request.data.get('variant_id')
#         quantity = int(request.data.get('quantity', 1))
#         notes = request.data.get('notes', [])

#         # logger.info("Received product_id: %s, variant_id: %s, quantity: %s, notes: %s",
#         #             product_id, variant_id, quantity, notes)

#         if not session_id or not product_id:
#             logger.error("Missing required fields!")
#             return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

#         cart, created = Cart.objects.get_or_create(session_id=session_id)
#         print("Cart fetched or created: %s, Created new? %s", cart, created)

#         try:
#             product = Product.objects.get(id=product_id)
#             # logger.info("Product found: %s", product)
#         except Product.DoesNotExist:
#             # logger.error("Invalid product")
#             return Response({'error': 'Invalid product'}, status=status.HTTP_400_BAD_REQUEST)

#         variant = None
#         if variant_id:
#             try:
#                 variant = ProductVariant.objects.get(id=variant_id)
#                 # logger.info("Variant found: %s", variant)
#                 if variant.stock < quantity:
#                     logger.warning("Insufficient stock")
#                     return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
#             except ProductVariant.DoesNotExist:
#                 # logger.error("Invalid variant")
#                 return Response({'error': 'Invalid variant'}, status=status.HTTP_400_BAD_REQUEST)

#         cart_item, created = CartItem.objects.get_or_create(
#             cart=cart,
#             product=product,
#             variant=variant,
#             defaults={'quantity': quantity}
#         )
#         # logger.info("Cart item fetched or created: %s, Created new? %s", cart_item, created)

#         if not created:
#             cart_item.quantity += quantity
#             cart_item.save()
#             logger.info("Cart item quantity updated: %s", cart_item.quantity)

#         if notes and product.isNot:
#             for note_text in notes:
#                 if note_text.strip():
#                     note, _ = Note.objects.get_or_create(note=note_text)
#                     cart_item.notes.add(note)
#                     logger.info("Note added: %s", note_text)

#         return Response({'message': 'Item added to cart'}, status=status.HTTP_200_OK)


import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem, Product, ProductVariant, Note

logger = logging.getLogger(__name__)

class AddToCartView(APIView):
    def post(self, request, *args, **kwargs):
        print("\n=== AddToCartView POST ===")
        print(f"Raw request data: {request.data}")

        # التحقق من وجود session
        print(f"Session key before check: {request.session.session_key}")
        if not request.session.session_key:
            request.session.create()
            print("Session created.")
        session_id = request.session.session_key
        print(f"Final session_id in use: {session_id}")

        # البيانات المرسلة
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))
        notes = request.data.get('notes', [])
        print(f"Received -> product_id: {product_id}, variant_id: {variant_id}, quantity: {quantity}, notes: {notes}")

        if not session_id or not product_id:
            print("Error: Missing required fields.")
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        # إنشاء أو جلب السلة
        cart, created = Cart.objects.get_or_create(session_id=session_id)
        print(f"Cart fetched or created. ID: {cart.id}, Created new? {created}")

        # جلب المنتج
        try:
            product = Product.objects.get(id=product_id)
            print(f"Product found: {product}")
        except Product.DoesNotExist:
            print("Error: Invalid product.")
            return Response({'error': 'Invalid product'}, status=status.HTTP_400_BAD_REQUEST)

        # التحقق من وجود variant
        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id)
                print(f"Variant found: {variant}")
                if variant.stock < quantity:
                    print("Error: Insufficient stock.")
                    return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
            except ProductVariant.DoesNotExist:
                print("Error: Invalid variant.")
                return Response({'error': 'Invalid variant'}, status=status.HTTP_400_BAD_REQUEST)

        # إضافة العنصر إلى السلة
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )
        print(f"Cart item fetched or created: {cart_item}, Created new? {created}")

        # تحديث الكمية في حال وجود العنصر سابقًا
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
            print(f"Cart item quantity updated: {cart_item.quantity}")

        # إضافة الملاحظات إن وجدت
        if notes and getattr(product, "isNot", False):
            print("Adding notes...")
            for note_text in notes:
                if note_text.strip():
                    note, _ = Note.objects.get_or_create(note=note_text)
                    cart_item.notes.add(note)
                    print(f"Note added: {note_text}")

        print("=== AddToCartView completed successfully ===\n")
        return Response({'message': 'Item added to cart'}, status=status.HTTP_200_OK)

class CartView(APIView):
    def get(self, request):
        # logger.info("=== CartView GET ===")
        # logger.info("Session key before check: %s", request.session.session_key)

        if not request.session.session_key:
            request.session.create()
            # logger.info("Session created")

        session_id = request.session.session_key
        # logger.info("Session ID in use: %s", session_id)

        try:
            cart = Cart.objects.get(session_id=session_id)
            # logger.info("Cart found: %s", cart)
        except Cart.DoesNotExist:
            cart = Cart.objects.create(session_id=session_id)
            # logger.info("Cart created: %s", cart)

        serializer = Cart_Serializer(cart)
        # logger.info("Serialized cart data: %s", serializer.data)
        return Response(serializer.data)


class UpdateQuantityView(APIView):
    def put(self, request, cart_item_id):
        # logger.info("=== UpdateQuantityView PUT ===")
        # logger.info("Cart item ID: %s", cart_item_id)
        try:
            cart_item = CartItem.objects.get(id=cart_item_id)
            # logger.info("Cart item found: %s", cart_item)

            quantity = int(request.data.get('quantity'))
            # logger.info("New quantity: %s", quantity)

            if quantity <= 0:
                cart_item.delete()
                # logger.info("Cart item deleted due to quantity <= 0")
                return Response({'success': 'Item removed from cart'}, status=status.HTTP_204_NO_CONTENT)

            if cart_item.variant and quantity > cart_item.variant.stock:
                # logger.warning("Quantity exceeds variant stock")
                return Response({'error': 'Quantity exceeds available stock'}, status=status.HTTP_400_BAD_REQUEST)
            if not cart_item.variant and quantity > cart_item.product.totalstock:
                # logger.warning("Quantity exceeds product stock")
                return Response({'error': 'Quantity exceeds available stock'}, status=status.HTTP_400_BAD_REQUEST)

            cart_item.quantity = quantity
            cart_item.save()
            # logger.info("Cart item quantity updated successfully: %s", cart_item.quantity)
            return Response({'success': 'Quantity updated'}, status=status.HTTP_200_OK)

        except CartItem.DoesNotExist:
            # logger.error("Cart item not found")
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)


class DeleteCartItemView(APIView):
    def delete(self, request, cart_item_id):
        try:
            cart_item = CartItem.objects.get(id=cart_item_id)
            cart_item.delete()
            return Response({'success': 'Item deleted from cart'}, status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        
 
class AddNoteView(APIView):
    def post(self, request, cart_item_id):
        try:
            cart_item = CartItem.objects.get(id=cart_item_id)
            note_text = request.data.get('note', '').strip()
            # print('note_text',note_text)

            if not note_text:
                # print('Note cannot be empty')
                return Response({'error': 'Note cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
            # Check if adding a new note exceeds the quantity limit
            if cart_item.notes.count() >= cart_item.quantity:
                # print('Cannot add more than')
                return Response({'error': f'Cannot add more than {cart_item.quantity} notes'}, status=status.HTTP_400_BAD_REQUEST)
            note = Note.objects.create(note=note_text)
            cart_item.notes.add(note)
            return Response({'success': 'Note added'}, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
  

class DeleteNoteView(APIView):
    def delete(self, request, cart_item_id, note_id):
        try:
            cart_item = CartItem.objects.get(id=cart_item_id)
            note = Note.objects.get(id=note_id)
            if note in cart_item.notes.all():
                cart_item.notes.remove(note)
                note.delete() 
                return Response({'success': 'Note deleted'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'Note not found in cart item'}, status=status.HTTP_400_BAD_REQUEST)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        except Note.DoesNotExist:
            return Response({'error': 'Note not found'}, status=status.HTTP_404_NOT_FOUND)
        
 

class ApplyCouponView(APIView):
    def post(self, request, *args, **kwargs):
        # Validate request data
        code = request.data.get('code')
        total = request.data.get('Total')
        if not (code and total):
            return Response({'valid': False, 'error': 'Coupon code and total amount are required.'}, status=400)
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid coupon code.'}, status=400)
        # Check coupon validity
        today = datetime.today().date()
        if coupon.expiryDate < today or coupon.coupon_usage <= 0:
            return Response({'valid': False, 'error': 'Invalid or expired coupon code.'}, status=400)
        # Calculate discounted price
        discounted_price = max(0, float(total) - (float(total) * coupon.discount / 100))
        # Update coupon usage
        coupon.coupon_usage -= 1
        coupon.save()

        return Response({'valid': True,'percentage':coupon.discount, 'discounted_price': discounted_price}, status=status.HTTP_200_OK)



 