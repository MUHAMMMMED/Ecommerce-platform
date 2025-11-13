 
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import shipping_Country, Shipping_Company
from .serializers import ShippingCountrySerializer, ShippingCompanySerializer
from rest_framework.permissions import IsAuthenticated
 
  

class ShippingCountryViewSet(viewsets.ModelViewSet):
    queryset = shipping_Country.objects.all()
    serializer_class = ShippingCountrySerializer
    permission_classes = [IsAuthenticated] 

    @action(detail=True, methods=['post'])
    def add_company(self, request, pk=None):
        country = self.get_object()
        serializer = ShippingCompanySerializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save()
            country.Shipping.add(company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='remove_company/(?P<company_id>\d+)')
    def remove_company(self, request, pk=None, company_id=None):
        country = self.get_object()
        try:
            company = Shipping_Company.objects.get(id=company_id)
            country.Shipping.remove(company)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Shipping_Company.DoesNotExist:
            return Response({'detail': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

class ShippingCompanyViewSet(viewsets.ModelViewSet):
    queryset = Shipping_Company.objects.all()
    serializer_class = ShippingCompanySerializer
    permission_classes = [IsAuthenticated] 