from multiprocessing import context
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from accounts.models import OneTimePassword
from accounts.serializers import *
from rest_framework import status
from .utils import send_generated_otp_to_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.permissions import IsAuthenticated
from .models import  *
  

# Create a view class for user login
class LoginUserView(GenericAPIView):
    # Specify the serializer class that will be used for validating and deserializing the input data
    serializer_class = LoginSerializer

    # Define the HTTP POST method handler for this view
    def post(self, request):
        # Instantiate the serializer with the input data (from the request) and the request object for additional context
        serializer = self.serializer_class(data=request.data, context={'request': request})

        # Validate the serializer's data; if invalid, it will raise an exception and return a 400 Bad Request response
        serializer.is_valid(raise_exception=True)

        # If validation is successful, return a 200 OK response with the serializer's data
        return Response(serializer.data, status=status.HTTP_200_OK)










 # View to handle user registration
class RegisterView(GenericAPIView):
    # Set the serializer to handle user registration data
    serializer_class = UserRegisterSerializer

    # POST method to register a new user
    def post(self, request):
        # Extract the user data from the request body
        user_data = request.data
        
        # Pass the data to the serializer for validation and processing
        serializer = self.serializer_class(data=user_data)
        
        # Validate the data; raise an exception if validation fails
        if serializer.is_valid(raise_exception=True):
            # Save the validated data (create a new user)
            serializer.save()
            
            # Return a success response with user data and a message
            return Response({
                'data': user_data,  # Send back the user data
                'message': 'Thanks for signing up.'  # Confirmation message
            }, status=status.HTTP_201_CREATED)
        
        # If validation fails, return the errors in the response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# View to handle email verification
class VerifyUserEmail(GenericAPIView):
    # Set the serializer to handle email verification data
    serializer_class = VerifyUserEmailSerializer

    # POST method to verify a user's email using a one-time passcode
    def post(self, request):
        try:
            # Retrieve the passcode (OTP) from the request data using the serializer
            passcode = self.get_serializer(data=request.data).initial_data['otp']
            
            # Query the database to find the corresponding OneTimePassword object
            user_pass_obj = OneTimePassword.objects.get(otp=passcode)
            
            # Get the user associated with the OneTimePassword object
            user = user_pass_obj.user
            
            # If the user is not already verified, update their verification status
            if not user.is_verified:
                user.is_verified = True  # Mark user as verified
                user.save()  # Save the changes
                
                # Return a success message
                return Response({
                    'message': 'Account email verified successfully'
                }, status=status.HTTP_200_OK)
            
            # If the user is already verified, return a message indicating this
            return Response({
                'message': 'Passcode is invalid; user is already verified'
            }, status=status.HTTP_204_NO_CONTENT)
        
        # Handle the case where the passcode does not exist in the database
        except OneTimePassword.DoesNotExist as identifier:
            # Return an error message indicating the passcode was not provided
            return Response({
                'message': 'Passcode not provided'
            }, status=status.HTTP_400_BAD_REQUEST)
 
 



 

 
# Create a view class for handling password reset requests
class PasswordResetRequestView(GenericAPIView):
    # Specify the serializer class that will be used for validating and deserializing the input data
    serializer_class = PasswordResetRequestSerializer

    # Define the HTTP POST method handler for this view
    def post(self, request):
        # Instantiate the serializer with the input data (from the request) and the request object for additional context
        serializer = self.serializer_class(data=request.data, context={'request': request})

        # Validate the serializer's data; if invalid, it will raise an exception and return a 400 Bad Request response
        serializer.is_valid(raise_exception=True)

        # If validation is successful, return a 200 OK response with a success message
        return Response({'message': 'We have sent you a link to reset your password'}, status=status.HTTP_200_OK)




# Create a view class for confirming password reset tokens
class PasswordResetConfirm(GenericAPIView):
    # Define the HTTP GET method handler for this view
    def get(self, request, uidb64, token):
        try:
            # Decode the base64-encoded user ID from the URL to get the actual user ID
            user_id = smart_str(urlsafe_base64_decode(uidb64))

            # Fetch the user object from the database using the decoded user ID
            user = User.objects.get(id=user_id)

            # Check if the provided password reset token is valid for the user
            if not PasswordResetTokenGenerator().check_token(user, token):
                # If the token is invalid or expired, return a 401 Unauthorized response with an error message
                return Response({'message': 'Token is invalid or has expired'}, status=status.HTTP_401_UNAUTHORIZED)

            # If the token is valid, return a 200 OK response with success message and token details
            return Response({'success': True, 'message': 'Credentials are valid', 'uidb64': uidb64, 'token': token}, status=status.HTTP_200_OK)

        except DjangoUnicodeDecodeError as identifier:
            # If decoding the user ID fails, return a 401 Unauthorized response with an error message
            return Response({'message': 'Token is invalid or has expired'}, status=status.HTTP_401_UNAUTHORIZED)


 
# Create a view class for setting a new password after a password reset request
class SetNewPasswordView(GenericAPIView):
    # Specify the serializer class that will be used for validating and deserializing the input data
    serializer_class = SetNewPasswordSerializer

    # Define the HTTP PATCH method handler for this view
    def patch(self, request):
        # Instantiate the serializer with the input data (from the request)
        serializer = self.serializer_class(data=request.data)

        # Validate the serializer's data; if invalid, it will raise an exception and return a 400 Bad Request response
        serializer.is_valid(raise_exception=True)

        # If validation is successful, return a 200 OK response with a success message
        return Response({'success': True, 'message': "Password reset is successful"}, status=status.HTTP_200_OK)
 
 
 
# Create a view class for handling user logout
class LogoutApiView(GenericAPIView):
    # Specify the serializer class that will be used for validating the input data
    serializer_class = LogoutUserSerializer

    # Set the permission classes to restrict access to authenticated users only
    permission_classes = [IsAuthenticated]

    # Define the HTTP POST method handler for this view
    def post(self, request):
        # Instantiate the serializer with the input data (from the request)
        serializer = self.serializer_class(data=request.data)

        # Validate the serializer's data; if invalid, it will raise an exception and return a 400 Bad Request response
        serializer.is_valid(raise_exception=True)

        # Save the serializer data; typically this would perform the logout operation, such as invalidating tokens
        serializer.save()

        # Return a 204 No Content response indicating the logout was successful
        return Response(status=status.HTTP_204_NO_CONTENT)



 
 
 
 