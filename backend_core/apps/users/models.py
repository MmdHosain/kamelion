# apps/users/models.py

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone # Import timezone

class UserManager(BaseUserManager):
    """
    Custom manager required by AbstractBaseUser.
    Authentication is phone_number-based, no password on creation.
    """

    def create_user(self, phone_number, full_name=None, password=None):
        if not phone_number:
            raise ValueError("Phone number is required")

        user = self.model(
            phone_number=phone_number,
            full_name=full_name,
        )
        # OTP-based system: no password needed for regular users
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, full_name=None, password=None):
        user = self.create_user(
            phone_number=phone_number,
            full_name=full_name,
        )
        user.is_staff = True
        user.is_superuser = True
        # Superuser needs a real password for Django admin login
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """
    Phone-number based user.
    is_staff = True  →  receptionist / admin (access to Django admin)
    is_staff = False →  regular patient
    """

    phone_number = models.CharField(max_length=15, unique=True)
    full_name = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)   # For receptionist/admin
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []   # phone_number is already USERNAME_FIELD

    objects = UserManager()

    class Meta:
        indexes = [
            models.Index(fields=['phone_number']),
        ]

    def __str__(self):
        return f"{self.phone_number} ({self.full_name or 'No name'})"

    # These methods are required by AbstractBaseUser
    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser


class PatientProfile(models.Model):
    """
    Additional profile information for a patient user.
    it is added so that additional data can be saved about patients.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    national_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    # Add any other patient-specific fields here

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Patient Profile"
        verbose_name_plural = "Patient Profiles"
        indexes = [
            models.Index(fields=['national_id']),
            models.Index(fields=['date_of_birth']),
        ]

    def __str__(self):
        return f"Profile for {self.user.phone_number} ({self.user.full_name or 'No name'})"


class OTPRequest(models.Model):
    """
    One-time password records.
    """

    phone_number = models.CharField(max_length=15)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField() # Add expiration time

    class Meta:
        indexes = [
            models.Index(fields=['phone_number', 'is_used']),
            models.Index(fields=['created_at']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        status = "used" if self.is_used else "active"
        return f"OTP for {self.phone_number} [{status}]"

    def save(self, *args, **kwargs):
        # Set expiration time if not set (e.g., 5 minutes from creation)
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=5)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at
