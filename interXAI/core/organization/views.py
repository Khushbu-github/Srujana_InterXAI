from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, authenticate, logout
from django.utils import timezone
from datetime import  timedelta
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from organization.models import *
from .serializers import *  
import json
from users.models import *
from django.shortcuts import get_object_or_404

class Organization(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    def get_authenticators(self):
        if self.request.method == 'GET':
            return []  # Disable authentication for GET
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return super().get_permissions()
    @method_decorator(csrf_exempt)
    def post(self, request):
        user = request.user
        org = organization.objects.filter(org=user).first()
        if org:
            return Response({"error": "User is already an organization"}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_authenticated:
            serializer = OrganizationRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                orgname = serializer.validated_data.get('orgname')
                address = serializer.validated_data.get('address')
                photo = serializer.validated_data.get('photo')
                description = serializer.validated_data.get('Description')
                org = organization.objects.create(
                    org=user,
                    orgname=orgname,
                    address=address,
                    photo=photo,
                    Description=description
                )
                org.save()
                return Response({"message": "Organization created successfully",
                                 "organization": OrganizationSerializer(org).data}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "User is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    
    def get(self, request, id):
        org = get_object_or_404(organization, id=id)
        serializer = OrganizationSerializer(org)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def put(self, request):
        user = request.user
        org = organization.objects.filter(org=user).first()
        if not org:
            return Response({"error": "User is not an organization"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrganizationRegistrationSerializer(org, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Organization updated successfully", "organization": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class isOrganization(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        if organization.objects.filter(org=user).exists():
            return Response({"is_organization": True}, status=status.HTTP_200_OK)
        else:
            return Response({"is_organization": False}, status=status.HTTP_200_OK)
class getOrganizationId(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user
        org = organization.objects.filter(org=user).first()
        if org:
            return Response({"organization_id": org.id}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "User is not an organization"}, status=status.HTTP_400_BAD_REQUEST)

class checkOrganization(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get(self, request,id):
        try:
            org = organization.objects.get(id=id)
            if org.org != request.user:
                return Response({"error": "You do not have permission to view this organization"}, status=status.HTTP_403_FORBIDDEN)
        except organization.DoesNotExist:
            return Response({"is_organization": False}, status=status.HTTP_404_NOT_FOUND)
        return Response({"is_organization": True}, status=status.HTTP_200_OK)