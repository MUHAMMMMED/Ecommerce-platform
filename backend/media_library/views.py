from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from rest_framework.response import Response
from .models import ImageCategory, ImageLibrary
from .serializers import ImageCategorySerializer, ImageLibrarySerializer

 

class ImageCategoryViewSet(viewsets.ModelViewSet):
    queryset = ImageCategory.objects.all()
    serializer_class = ImageCategorySerializer
    permission_classes = [IsAuthenticated] 
 



class ImageLibraryViewSet(viewsets.ModelViewSet):
    queryset = ImageLibrary.objects.all()
    serializer_class = ImageLibrarySerializer
    permission_classes = [IsAuthenticated] 
    def create(self, request, *args, **kwargs):
        # print("🔹 Received data in CREATE:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # print("❌ Serializer Errors in CREATE:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # print("🔹 Received data in UPDATE:", request.data)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            # print("❌ Serializer Errors in UPDATE:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(serializer.data)