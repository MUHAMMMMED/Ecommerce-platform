from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import  *
from .serializers import *
from rest_framework.permissions import IsAuthenticated

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.order_by('?')   
        serializer = ProductMiniSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
 
class SettingsDetail(APIView):
    def get(self, request):
        settings = Settings.objects.last()
        if settings:
            serializer = SettingsSerializer(settings)
            return Response(serializer.data)
        return Response({}, status=status.HTTP_200_OK)
 
class SettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated] 
    def list(self, request):
    
        settings = Settings.objects.first()
        if settings:
            serializer = SettingsSerializer(settings)
            return Response(serializer.data)
        return Response({}, status=status.HTTP_200_OK)

    def create(self, request):
  
        if Settings.objects.exists():
            return Response({"detail": "الإعدادات موجودة بالفعل، استخدم التحديث."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SettingsSerializer(data=request.data)
        # print("\n🔵 [CREATE] Incoming Data:")
        # print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # print("❌ [CREATE ERROR] Serializer Errors:")
        # print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
 
        settings = Settings.objects.first()
        if not settings:
            return Response({"detail": "لا توجد إعدادات لتحديثها."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SettingsSerializer(settings, data=request.data, partial=True)
        # print("\n🟠 [UPDATE] Incoming Data:")
        # print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        # print("❌ [UPDATE ERROR] Serializer Errors:")
        # print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().prefetch_related('product_set').order_by('id')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated] 
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            # print(f"🔍 Filtering with search: {search}")
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        else:
            print("✅ No search term provided. Returning all categories.")
        return queryset

    def create(self, request, *args, **kwargs):
        # print("🚀 Received request to create category")
        # print(f"📦 Request Data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # print("✅ Serializer is valid. Saving category...")
            self.perform_create(serializer)
            # print("📁 Saved category successfully.")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # print("❌ Serializer validation failed.")
            # print(f"🧾 Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        # print("🔄 Received request to update category")
        instance = self.get_object()
        # print(f"🛠️ Current instance: {instance}")
        # print(f"📦 Update data: {request.data}")

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            # print("✅ Serializer is valid. Updating category...")
            self.perform_update(serializer)
            # print("📝 Category updated successfully.")
            return Response(serializer.data)
        else:
            # print("❌ Serializer validation failed.")
            # print(f"🧾 Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class CategoryDetailView(APIView):
    def get(self, request, id):
        category = get_object_or_404(Category.objects.prefetch_related('product_set'), id=id)
        serializer = CategoryDetailSerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)


 
 


class ProductDetailView(APIView):
    def get(self, request, id):
        product = get_object_or_404(Product, id=id)
        serializer = DetailProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)



class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated] 
    queryset = Product.objects.all().prefetch_related(
        'variants__size', 'variants__color', 'attributes', 'components', 'related_products', 'categories'
    )
    serializer_class = ProductSerializer
    # pagination_class = StandardPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        category_id = self.request.query_params.get('category_id', None)
        stock_max = self.request.query_params.get('stock_max', None)

        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if category_id:
            queryset = queryset.filter(categories__id=category_id)
        if stock_max:
            queryset = queryset.filter(totalstock__lte=stock_max)

        return queryset

    def create(self, request, *args, **kwargs):
        # print("\n🔵 [CREATE] Incoming Data:")
        # print(request.data)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # print("❌ [CREATE] Validation Errors:")
            # print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        # print("✅ [CREATE] Saved Data:")
        # print(serializer.data)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, pk=None, *args, **kwargs):
        # print("\n🟠 [UPDATE] Incoming Data:")
        # print(request.data)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            # print("❌ [UPDATE] Validation Errors:")
            # print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        # print("✅ [UPDATE] Updated Data:")
        # print(serializer.data)

        return Response(serializer.data)
 

 


class SizeViewSet(viewsets.ModelViewSet):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        if product_id:
            return Size.objects.filter(product_id=product_id)
        return Size.objects.none()
    def create(self, request, *args, **kwargs):
        # print("📥 [SIZE CREATE] Incoming data:", request.data)

        # Ensure product ID is provided
        product_id = request.data.get('product')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=400)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # print("❌ [SIZE CREATE] Errors:", serializer.errors)
            return Response(serializer.errors, status=400)

        # print("✅ [SIZE CREATE] Validated data:", serializer.validated_data)

        # Set the product explicitly
        serializer.validated_data['product'] = Product.objects.get(id=product_id)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        # print("📥 [SIZE UPDATE] Incoming data:", request.data)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            # print("❌ [SIZE UPDATE] Errors:", serializer.errors)
            return Response(serializer.errors, status=400)

        # print("✅ [SIZE UPDATE] Validated data:", serializer.validated_data)
        self.perform_update(serializer)
        return Response(serializer.data)



class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer
    permission_classes = [IsAuthenticated] 
    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        if product_id:
            return Color.objects.filter(product_id=product_id)
        return Color.objects.none()
    
    def create(self, request, *args, **kwargs):
        # print("📥 [COLOR CREATE] Incoming data:", request.data)

        # Ensure product ID is provided
        product_id = request.data.get('product')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=400)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # print("✅ [COLOR CREATE] Validated data:", serializer.validated_data)

        # Set the product explicitly
        serializer.validated_data['product'] = Product.objects.get(id=product_id)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # print("📥 [COLOR UPDATE] Incoming data:", request.data)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        # print("✅ [COLOR UPDATE] Validated data:", serializer.validated_data)

        self.perform_update(serializer)
        return Response(serializer.data)

 
class ProductAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductAttribute.objects.all()
    serializer_class = ProductAttributeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if 'product_pk' in self.kwargs:
            return self.queryset.filter(product_id=self.kwargs['product_pk'])
        return self.queryset

    def perform_create(self, serializer):
        if 'product_pk' in self.kwargs:
            product = get_object_or_404(Product, id=self.kwargs['product_pk'])
            serializer.save(product=product)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"detail": "تم حذف الخاصية بنجاح"}, status=status.HTTP_204_NO_CONTENT)

 
class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all().select_related('size', 'color')
    permission_classes = [IsAuthenticated] 
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProductVariantReadSerializer
        return ProductVariantWriteSerializer

    def get_queryset(self):
        if 'product_pk' in self.kwargs:
            return self.queryset.filter(product_id=self.kwargs['product_pk'])
        return self.queryset

    def create(self, request, *args, **kwargs):
        # print("📥 [VARIANT CREATE] Incoming data:", request.data)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # print("❌ [VARIANT CREATE] Errors:", serializer.errors)
            return Response(serializer.errors, status=400)

        # print("✅ [VARIANT CREATE] Validated data:", serializer.validated_data)
        self.perform_create(serializer)
        read_serializer = ProductVariantReadSerializer(serializer.instance)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # print("📥 [VARIANT UPDATE] Incoming data:", request.data)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            # print("❌ [VARIANT UPDATE] Errors:", serializer.errors)
            return Response(serializer.errors, status=400)

        # print("✅ [VARIANT UPDATE] Validated data:", serializer.validated_data)
        self.perform_update(serializer)
        read_serializer = ProductVariantReadSerializer(serializer.instance)
        return Response(read_serializer.data)

    def perform_create(self, serializer):
        if 'product_pk' in self.kwargs:
            product = get_object_or_404(Product, id=self.kwargs['product_pk'])
            serializer.save(product=product)
        else:
            serializer.save()



class LandingComponentViewSet(viewsets.ModelViewSet):
    queryset = LandingComponent.objects.all()
    serializer_class = LandingComponentSerializer
    permission_classes = [IsAuthenticated] 
    def get_queryset(self):
        if 'product_pk' in self.kwargs:
            return self.queryset.filter(product_id=self.kwargs['product_pk'])
        return self.queryset

    def perform_create(self, serializer):
        if 'product_pk' in self.kwargs:
            product = get_object_or_404(Product, id=self.kwargs['product_pk'])
            serializer.save(product=product)
        else:
            serializer.save()


 
 