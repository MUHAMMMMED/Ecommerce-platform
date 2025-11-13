 
from rest_framework import serializers
from .models import *
 

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = '__all__'
 
class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = '__all__'

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = '__all__'
  


  
 
class ProductVariantReadSerializer(serializers.ModelSerializer):
    size = SizeSerializer()
    color = ColorSerializer()
    original_price = serializers.DecimalField(max_digits=10, decimal_places=2, source='price', read_only=True)
    discounted_price = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    saved_amount = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'size', 'color', 'price', 'stock', 'image', 'original_price', 'discounted_price', 'discount_percentage', 'saved_amount']

    def get_discounted_price(self, obj):
        # Get the discount percentage from the parent Product
        product = obj.product
        discount = product.discount if product.discount else 0
        if discount and obj.price:
            discount_amount = obj.price * (discount / 100)
            return max(0, obj.price - discount_amount)
        return obj.price

    def get_discount_percentage(self, obj):
        # Return the discount percentage from the parent Product
        return float(obj.product.discount) if obj.product.discount else 0.0

    def get_saved_amount(self, obj):
        # Calculate the amount saved based on the variant's price and the product's discount
        product = obj.product
        if product.discount and obj.price:
            return obj.price - self.get_discounted_price(obj)
        return 0.00


 

class ProductVariantWriteSerializer(serializers.ModelSerializer):
    size = serializers.PrimaryKeyRelatedField(queryset=Size.objects.all(), required=False, allow_null=True)
    color = serializers.PrimaryKeyRelatedField(queryset=Color.objects.all(), required=False, allow_null=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'size', 'color', 'price', 'stock', 'image']
 
class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = ['id', 'product', 'key', 'value', 'created_at']

class LandingComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandingComponent
        fields = ['id', 'product', 'title', 'html_code', 'index', 'created_at']
 
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'image']

 
 

class RelatedProductSerializer(serializers.ModelSerializer):
    variant = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()  # ✅ تمت إضافته هنا

    class Meta:
        model = Product
        fields = ['id', 'title', 'discount', 'base_price', 'price', 'currency', 'image', 'variant']

    def get_variant(self, obj):
        first_variant = obj.variants.first()
        if first_variant:
            return ProductVariantReadSerializer(first_variant).data
        return None

    def get_currency(self, obj):
        settings = Settings.objects.first()
        return settings.currency if settings else None

    def get_price(self, obj):
        """الحساب النهائي بعد الخصم"""
        base_price = obj.base_price or 0
        discount = obj.discount or 0

        if 0 < discount < 100:
            return round(base_price * (1 - discount / 100), 2)
        return round(base_price, 2)
 

class DetailProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantReadSerializer(many=True, read_only=True)
    attributes = ProductAttributeSerializer(many=True, read_only=True)
    components = LandingComponentSerializer(many=True, read_only=True)
    related_products = RelatedProductSerializer(many=True, read_only=True)
    related_products_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Product.objects.all(), write_only=True, source='related_products', required=False
    )
    categories = CategorySerializer(many=True, read_only=True)
    categories_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), source='categories', write_only=True, required=False
    )
    code = serializers.CharField(max_length=50, allow_blank=True, required=False)
    currency = serializers.SerializerMethodField()
    product_original_price = serializers.DecimalField(max_digits=10, decimal_places=2, source='base_price', read_only=True)
    product_discounted_price = serializers.SerializerMethodField()
    product_discount_percentage = serializers.SerializerMethodField()
    product_saved_amount = serializers.SerializerMethodField()
    category_products = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'id', 'theme', 'title', 'description', 'code', 'isNot', 'isSize', 'isColor',
            'image', 'youtube_url', 'base_price', 'discount', 'cost', 'totalstock', 'stock_alarm',
            'created_at',
            'related_products', 'related_products_ids',
            'categories', 'categories_ids',
            'variants', 'attributes', 'components',
            'currency',
            'product_original_price', 'product_discounted_price', 'product_discount_percentage', 'product_saved_amount','category_products'
        ]

    def get_currency(self, obj):
        settings = Settings.objects.first()
        return settings.currency if settings else None
 

    def get_product_discounted_price(self, obj):
        # Calculate discounted price for the product based on base_price and discount
        if obj.discount and obj.base_price:
            discount_amount = obj.base_price * (obj.discount / 100)
            return max(0, obj.base_price - discount_amount)
        return obj.base_price

    def get_product_discount_percentage(self, obj):
        # Return the discount percentage for the product
        return float(obj.discount) if obj.discount else 0.0

    def get_product_saved_amount(self, obj):
        # Calculate the amount saved for the product
        if obj.discount and obj.base_price:
            return obj.base_price - self.get_product_discounted_price(obj)
        return 0.00


    def get_category_products(self, obj):
        category_products = Product.objects.filter(categories__in=obj.categories.all()).exclude(id=obj.id).distinct().order_by('?')[:3]
        return ProductMiniSerializer(category_products, many=True).data




class ProductMiniSerializer(serializers.ModelSerializer):
    currency = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'title', 'image', 'discount', 'base_price', 'price', 'currency']

    def get_currency(self, obj):
        settings = Settings.objects.first()
        return settings.currency if settings else None

    def get_price(self, obj):
        """الحساب النهائي بعد الخصم"""
        base_price = obj.base_price or 0
        discount = obj.discount or 0

        if discount > 0 and discount < 100:
            return round(base_price * (1 - discount / 100), 2)
        return round(base_price, 2)

 


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantReadSerializer(many=True, read_only=True)   
    attributes = ProductAttributeSerializer(many=True, read_only=True)
    components = LandingComponentSerializer(many=True, read_only=True)
    related_products = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Product.objects.all(), required=False )
   
    categories = CategorySerializer(many=True, read_only=True)
    categories_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), source='categories', write_only=True, required=False   )
    code = serializers.CharField(max_length=50, allow_blank=True, required=False)  

    class Meta:
        model = Product
        fields = [
            'id', 'theme', 'title', 'description', 'code', 'isNot', 'isSize', 'isColor',
            'image', 'youtube_url','base_price', 'discount', 'cost', 'totalstock', 'stock_alarm',
            'created_at', 'related_products', 'categories', 'categories_ids', 'variants',
            'attributes', 'components'
        ]

    def create(self, validated_data):
        categories_data = validated_data.pop('categories', [])
        instance = super().create(validated_data)
        if categories_data:
            instance.categories.set(categories_data)
        return instance

    def update(self, instance, validated_data):
        categories_data = validated_data.pop('categories', None)
        instance = super().update(instance, validated_data)
        if categories_data is not None:
            instance.categories.set(categories_data)
        return instance 


class CategoryDetailSerializer(serializers.ModelSerializer):
    products = ProductMiniSerializer(many=True, read_only=True, source='product_set')

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'image', 'products']

class DictionaryProductNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = DictionaryProductName
        fields = '__all__'

 