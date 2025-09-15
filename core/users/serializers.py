from rest_framework import serializers
from django.contrib.auth.models import User
from organization.models import *
from users.models import *


class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data


class VerificationCodeSerializer(serializers.Serializer):
    verification_code = serializers.CharField(max_length=10)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)


class ResetPasswordSerializer(serializers.Serializer):
    password1 = serializers.CharField(min_length=8, write_only=True)
    password2 = serializers.CharField(min_length=8, write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user',)

