from django.db import models

class ImageCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class ImageLibrary(models.Model):
    category = models.ForeignKey( ImageCategory, related_name='images',on_delete=models.CASCADE  )
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='library_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def image_url(self):
        return self.image.url if self.image else ''

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['title', 'category'], name='unique_image_title_per_category')
        ]