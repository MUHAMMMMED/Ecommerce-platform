from rest_framework import viewsets
from .models import Customers
from .serializers import CustomersSerializer
from rest_framework.permissions import IsAuthenticated
 
class CustomersViewSet(viewsets.ModelViewSet):
    queryset = Customers.objects.all()
    serializer_class = CustomersSerializer
    permission_classes = [IsAuthenticated] 