from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import   force_str, smart_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from .utils import  EmailMessage
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.utils import timezone
from django.template.loader import render_to_string
from .utils import get_tokens_for_user  
from django.conf import settings   
from .models import  *
from rest_framework import serializers

 

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    password2 = serializers.CharField(max_length=68, min_length=6, write_only=True)
    user_type = serializers.CharField(max_length=1, default='M')  # Add user_type field

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2', 'user_type']  # Include user_type

    def validate(self, attrs):
        password = attrs.get('password', '')
        password2 = attrs.get('password2', '')
        if password != password2:
            raise serializers.ValidationError("Passwords do not match")
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            password=validated_data.get('password'),
            user_type=validated_data.get('user_type')  
        )
        return user

 
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'id','first_name','last_name',  'phone', 'width_image' , 'job_title' ]

        def validate_image(self, value):
           """
           Custom validation to check if uploaded file is an image.
           """
           if not value.content_type.startswith('image/'):
              raise serializers.ValidationError('Uploaded file must be an image.')
           return value

 




def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    refresh['full_name'] = user.get_full_name
    refresh['type'] = user.user_type
    # refresh['is_active'] = user.is_active
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
 

class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=155, min_length=6)
    password = serializers.CharField(max_length=68, write_only=True)
    full_name = serializers.CharField(max_length=255, read_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)
    refresh_token = serializers.CharField(max_length=255, read_only=True)
    user_type = serializers.CharField(read_only=True)
    is_active = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'access_token', 'refresh_token', 'user_type', 'is_active']

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        request = self.context.get('request')

        # Authenticate user
        user = authenticate(request, email=email, password=password)

        if not user:
            raise AuthenticationFailed("Invalid credentials, try again")
        if not user.is_verified:
            raise AuthenticationFailed("Email is not verified")

        # Generate tokens
        tokens = get_tokens_for_user(user)

        # Return all necessary user details along with tokens
        return {
            'email': user.email,
            'is_active': user.is_active,
            'access_token': tokens.get('access'),
            'refresh_token': tokens.get('refresh'),
        }

 

class VerifyUserEmailSerializer(serializers.Serializer):
    otp = serializers.CharField()
  
   
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        fields = ['email']

    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            current_site = settings.DOMAIN

            abslink = f"http://{current_site}/password-reset-confirm/{uidb64}/{token}"

            context = {
                'first_name': user.first_name,
                'abslink': abslink,
                'current_site': current_site,
                'current_year': timezone.now().year,
            }

            email_body = render_to_string('Email_Verification.html', context)

            email_subject = "Reset your Password"
            email = EmailMessage(
                email_subject,
                email_body,
                to=[user.email]
            )

            email.content_subtype = "html"  # Send as HTML

            try:
                email.send(fail_silently=False)
            except Exception as e:
                logger.error(f"Error sending email: {e}")
                raise serializers.ValidationError("Failed to send reset email. Please try again later.")

        return super().validate(attrs)






    
class SetNewPasswordSerializer(serializers.Serializer):
    password=serializers.CharField(max_length=100, min_length=6, write_only=True)
    confirm_password=serializers.CharField(max_length=100, min_length=6, write_only=True)
    uidb64=serializers.CharField(min_length=1, write_only=True)
    token=serializers.CharField(min_length=3, write_only=True)

    class Meta:
        fields = ['password', 'confirm_password', 'uidb64', 'token']

    def validate(self, attrs):
        try:
            token=attrs.get('token')
            uidb64=attrs.get('uidb64')
            password=attrs.get('password')
            confirm_password=attrs.get('confirm_password')

            user_id=force_str(urlsafe_base64_decode(uidb64))
            user=User.objects.get(id=user_id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed("reset link is invalid or has expired", 401)
            if password != confirm_password:
                raise AuthenticationFailed("passwords do not match")
            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            return AuthenticationFailed("link is invalid or has expired")


    
class LogoutUserSerializer(serializers.Serializer):
    refresh_token=serializers.CharField()

    default_error_message = {
        'bad_token': ('Token is expired or invalid')  }
  
    def validate(self, attrs):
        self.token = attrs.get('refresh_token')
        return attrs

    def save(self, **kwargs):
        try:
            token=RefreshToken(self.token)
            token.blacklist()
        except TokenError:
            return self.fail('bad_token')

    

    
    
