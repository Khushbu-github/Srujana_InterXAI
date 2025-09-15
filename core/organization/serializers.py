from rest_framework import serializers
from django.contrib.auth.models import User
from organization.models import *
from users.models import *


class OrganizationRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    orgname = serializers.CharField(max_length=100)
    address = serializers.CharField(max_length=255)
    photo = serializers.CharField(max_length=255)
    Description = serializers.CharField(max_length=1000)
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance



class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = organization
        fields = '__all__'
        read_only_fields = ('user',)