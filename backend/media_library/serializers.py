from rest_framework import serializers
from .models import ImageCategory, ImageLibrary

class ImageCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageCategory
        fields = ['id', 'name']

class ImageLibrarySerializer(serializers.ModelSerializer):
    category = ImageCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    image_url = serializers.ImageField(source='image', read_only=True)
    image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = ImageLibrary
        fields = ['id', 'title', 'image_url', 'image', 'category', 'category_id']

    def validate_category_id(self, value):
        if not ImageCategory.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid category ID")
        return value