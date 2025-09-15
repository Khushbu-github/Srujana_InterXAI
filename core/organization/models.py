from datetime import timezone

from django.contrib.auth.models import User
from django.db import models

class organization(models.Model):
    org = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organization')
    orgname = models.CharField(max_length=100)
    address = models.TextField()
    email = models.EmailField(unique=True, blank=True, null=True)
    photo = models.CharField(null=True, blank=True, max_length=255)
    Description = models.TextField()
    def __str__(self):
        return self.orgname
