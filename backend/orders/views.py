 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import OrderSerializer
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta
from django.utils import timezone
from cart.models import *
from .models import *
from shipping.models import *
from .serializers import *
from .utils import send_invoice_email
 
  
 
class PackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAuthenticated] 
 

class shipping_CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = shipping_Country.objects.all()
    serializer_class = shipping_CountrySerializer
 
 
 
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = Order.objects.all()
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(customer__id=customer_id)
        return queryset


class Shipping_CompanyView(APIView):
    def get(self, request, *args, **kwargs):
        country_id = kwargs.get('id')  
        try:
            country = shipping_Country.objects.get(id=country_id)
            serializer = shipping_CountrySerializer(country)
            data = serializer.data
            data['tax'] = country.tax
            return Response(data, status=status.HTTP_200_OK)
        except shipping_Country.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Cart.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

 

def order_detail(id):
        order = Order.objects.get(id=id)
        if not order:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order)
        # send_invoice_email( serializer.data)
        return serializer.data


 

 

class OrderCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()

            # حذف السيشن القديمة وإنشاء جديدة
            # old_session = request.session.session_key
            # print("[OLD SESSION]", old_session)
            request.session.flush()
            request.session.create()
            new_session = request.session.session_key
            # print("[NEW SESSION]", new_session)
            order.session_key = new_session
            order.save(update_fields=["session_key"])
            # print("[ORDER LINKED TO NEW SESSION]", order.id, order.session_key)
            order_detail(order.id)
            return Response({
                "message": "Order created successfully",
                "order_id": order.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
class OrderUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
  
        serializer = OrderSerializer(order, data=request.data, partial=True)   

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Order updated successfully", "order_id": serializer.instance.id}, status=status.HTTP_200_OK)

        # print("❌ أخطاء في التحقق:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  
 
class InvoiceDetail(APIView):

    def get(self, request, *args, **kwargs):
        # print("=== [START GET INVOICE DETAIL] ===")

        session_id = request.session.session_key
        # print("[STEP 1] Session ID:", session_id)

        if not session_id:
            # print("[ERROR] لا يوجد session_key")
            return Response({"error": "Session not found"}, status=status.HTTP_400_BAD_REQUEST)

        # التاريخ الحالي ناقص يوم
        yesterday = timezone.now() - timedelta(days=1)
        # print("[STEP 2] Yesterday date:", yesterday)

        # تحقق من وجود أي أوردر قديم بنفس session_key قبل أمس
        old_orders = Order.objects.filter(
            session_key=session_id,
            created_at__lt=yesterday
        )
        # print(f"[STEP 3] Found {old_orders.count()} old orders")

        if old_orders.exists():
            updated = old_orders.update(session_key=None)
            # print(f"[STEP 4] Cleared session_key for {updated} old orders")

        # جلب أحدث أوردر بنفس session_key
        order = Order.objects.filter(session_key=session_id).order_by('-id').last()
        # print("[STEP 5] Latest order found:", order.id if order else "None")

        if not order:
            # print("[ERROR] لم يتم العثور على أوردر")
            # print("=== [END GET INVOICE DETAIL] ===")
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order)
        # print("[STEP 6] Serialized order data length:", len(str(serializer.data)))

        # print("=== [END GET INVOICE DETAIL - SUCCESS] ===")
        return Response(serializer.data, status=status.HTTP_200_OK)



 







 


 







 