from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, authenticate, logout
from django.utils import timezone
from datetime import  timedelta
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from utils.utils import *
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from organization.models import *
from .serializers import *  
import json
from users.models import *
from django.shortcuts import get_object_or_404
@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Check if username already exists
            if User.objects.filter(username=username).exists():
                return Response({
                    'success': False,
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'error': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Delete any existing verification codes for this email and type
                VerificationCode.objects.filter(
                    email=email, 
                    verification_type='registration'
                ).delete()
                
                # Generate verification code
                code = generate_verification_code()
                
                verification = VerificationCode.objects.create(
                    email=email,
                    code=code,
                    verification_type='registration',
                    user_data={
                        'username': username,
                        'email': email,
                        'password': password,
                    },
                    expires_at=timezone.now() + timedelta(minutes=5)  
                )
                
                # Send verification email
                send_verification_email(email, code)
                
                return Response({
                    'success': True,
                    'message': 'Verification code sent to your email',
                    'verification_id': verification.id  # Return ID for reference
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Failed to send verification code: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class VerifyEmailAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        serializer = VerificationCodeSerializer(data=request.data)
        if serializer.is_valid():
            submitted_code = serializer.validated_data['verification_code']
            verification_id = request.data.get('verification_id')
            print(verification_id)
            print(submitted_code)
            try:
                query_params = {
                    'code': submitted_code,
                    'verification_type': 'registration',
                    'is_used': False
                }
                
                if verification_id:
                    query_params['id'] = verification_id
                    verification = VerificationCode.objects.filter(**query_params).first()
                else:
                    verification = VerificationCode.objects.filter(**query_params).order_by('-created_at').first()
                
                if not verification:
                    return Response({
                        'success': False,
                        'error': 'Invalid or expired verification code'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                verification.attempts += 1
                verification.save()
                
                if not verification.is_valid():
                    error_msg = 'Verification code expired' if verification.is_expired() else 'Maximum attempts exceeded'
                    return Response({
                        'success': False,
                        'error': error_msg
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                verification.is_used = True
                verification.save()
                
                # Get user data
                user_data = verification.user_data
                
                # Create the user
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=user_data['password']
                )
                obj = UserProfile.objects.create(user=user)
                obj.save()
                # Create authentication token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'success': True,
                    'message': 'User registered successfully',
                    'token': token.key,
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email
                }, status=status.HTTP_201_CREATED)
                
            except VerificationCode.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid verification code'
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Registration failed: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class ResendCodeAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        email = request.data.get('email')
        verification_type = request.data.get('type', 'registration')  # 'registration' or 'password_reset'
        
        if not email:
            return Response({
                'success': False,
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Find existing verification
            verification = VerificationCode.objects.filter(
                email=email,
                verification_type=verification_type,
                is_used=False
            ).order_by('-created_at').first()
            
            if not verification:
                return Response({
                    'success': False,
                    'error': 'No pending verification found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new code and update
            new_code = generate_verification_code()
            verification.code = new_code
            verification.created_at = timezone.now()
            verification.expires_at = timezone.now() + timedelta(minutes=5)
            verification.attempts = 0  # Reset attempts
            verification.save()
            
            # Send new verification email
            if verification_type == 'registration':
                send_verification_email(email, new_code)
            else:
                send_reset_code_email(email, new_code)
            
            return Response({
                'success': True,
                'message': 'Verification code resent'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to resend code: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# @method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                # Get or create token for the user
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'token': token.key,
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        try:
            # Delete the user's token to logout
            request.user.auth_token.delete()
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            
            try:
                user = User.objects.get(username=username)
                email = user.email
                
                # Delete any existing password reset codes for this email
                VerificationCode.objects.filter(
                    email=email,
                    verification_type='password_reset'
                ).delete()
                
                # Generate new reset code
                reset_code = generate_verification_code()
                
                # Store in database
                verification = VerificationCode.objects.create(
                    email=email,
                    code=reset_code,
                    verification_type='password_reset',
                    user_data={'username': username, 'email': email},
                    expires_at=timezone.now() + timedelta(minutes=5)
                )
                
                send_reset_code_email(email, reset_code)
                
                return Response({
                    'success': True,
                    'message': 'Reset code sent to your email',
                    'verification_id': verification.id
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'No account found with this username'
                }, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Failed to send reset code: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class VerifyResetCodeAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        serializer = VerificationCodeSerializer(data=request.data)
        if serializer.is_valid():
            submitted_code = serializer.validated_data['verification_code']
            verification_id = request.data.get('verification_id')
            
            try:
                # Find the verification record
                query_params = {
                    'code': submitted_code,
                    'verification_type': 'password_reset',
                    'is_used': False
                }
                
                if verification_id:
                    verification = VerificationCode.objects.get(id=verification_id, **query_params)
                else:
                    verification = VerificationCode.objects.filter(**query_params).order_by('-created_at').first()
                    if not verification:
                        return Response({
                            'success': False,
                            'error': 'Invalid or expired reset code'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                # Increment attempts
                verification.attempts += 1
                verification.save()
                
                # Check if verification is valid
                if not verification.is_valid():
                    error_msg = 'Reset code expired' if verification.is_expired() else 'Maximum attempts exceeded'
                    return Response({
                        'success': False,
                        'error': error_msg
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Don't mark as used yet - will be marked when password is actually reset
                return Response({
                    'success': True,
                    'message': 'Code verified successfully',
                    'reset_token': verification.id  # Return verification ID as reset token
                }, status=status.HTTP_200_OK)
                
            except VerificationCode.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid reset code'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class ResendResetCodeAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        username = request.data.get('username')

        if not username:
            return Response({
                'success': False,
                'error': 'Username is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(username=username).first()
        if not user:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        email = user.email
        try:
            # Find existing password reset verification
            verification = VerificationCode.objects.filter(
                email=email,
                verification_type='password_reset',
                is_used=False
            ).order_by('-created_at').first()
            
            if not verification:
                return Response({
                    'success': False,
                    'error': 'No pending reset request found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new code
            new_code = generate_verification_code()
            verification.code = new_code
            verification.created_at = timezone.now()
            verification.expires_at = timezone.now() + timedelta(minutes=5)
            verification.attempts = 0  # Reset attempts
            verification.save()
            
            # Send new code
            send_reset_code_email(email, new_code)
            
            return Response({
                'success': True,
                'message': 'Reset code resent'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to resend reset code: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] 
    
    def post(self, request):
        reset_token = request.data.get('reset_token')
        if not reset_token:
            return Response({
                'success': False,
                'error': 'Reset token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            password1 = serializer.validated_data['password1']
            password2 = serializer.validated_data['password2']
            
            if password1 != password2:
                return Response({
                    'success': False,
                    'error': 'Passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if len(password1) < 8:
                return Response({
                    'success': False,
                    'error': 'Password must be at least 8 characters long'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                verification = VerificationCode.objects.get(
                    id=reset_token,
                    verification_type='password_reset',
                    is_used=False
                )
                
                if not verification.is_valid():
                    error_msg = 'Reset token expired' if verification.is_expired() else 'Reset token invalid'
                    return Response({
                        'success': False,
                        'error': error_msg
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Get user and reset password
                username = verification.user_data['username']
                user = User.objects.get(username=username)
                user.set_password(password1)
                user.save()
                
                # Mark verification as used
                verification.is_used = True
                verification.save()
                
                return Response({
                    'success': True,
                    'message': 'Password reset successful'
                }, status=status.HTTP_200_OK)
                
            except VerificationCode.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid or expired reset token'
                }, status=status.HTTP_404_NOT_FOUND)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Password reset failed: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)



class ProfileAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []  # Disable authentication for GET
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()

    def get(self, request, id):
        user_profile = get_object_or_404(UserProfile, id=id)
        serializer = UserProfileSerializer(user_profile)
        return Response({
            'success': True,
            'profile': serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user_profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            profile = serializer.save()
            profile.user = request.user  # Optional: Ensure user is set if serializer doesn't
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': UserProfileSerializer(profile).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class checkUser(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated] 

    def get(self, request, id):
        profile = get_object_or_404(UserProfile, id=id)
        if profile.user == request.user:
            return Response({
                'success': True,
                'message': 'User is authenticated'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'User is not authenticated'
            }, status=status.HTTP_403_FORBIDDEN)
        
class getId(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user
        try:
            user_profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User profile does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        if user.is_authenticated:
            return Response({
                'success': True,
                'profile_id': user_profile.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'User is not authenticated'
            }, status=status.HTTP_403_FORBIDDEN)