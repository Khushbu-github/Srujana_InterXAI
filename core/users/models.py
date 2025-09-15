from django.utils import timezone
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user= models.ForeignKey(User, on_delete=models.CASCADE)
    leetcode = models.CharField(max_length=100)
    github = models.CharField(max_length=100)
    dateJoined = models.DateTimeField(auto_now_add=True)
    photo = models.CharField(max_length=100,blank=True,null=True)
    bio = models.TextField(blank=True,null=True)
    def __str__(self):
        return f'{self.user.username}'
    
class VerificationCode(models.Model):
    VERIFICATION_TYPES = (
        ('registration', 'Registration'),
        ('password_reset', 'Password Reset'),
    )
    
    email = models.EmailField()
    code = models.CharField(max_length=6)
    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPES)
    user_data = models.JSONField(null=True, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=3)
    
    class Meta:
        unique_together = ['email', 'verification_type', 'is_used']
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_used and not self.is_expired() and self.attempts < self.max_attempts