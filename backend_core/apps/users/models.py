# apps/users/models.py

# Used to create OTP expiration times
from datetime import timedelta

# AbstractBaseUser -> minimal auth system (password handling, last_login)
# PermissionsMixin -> adds groups, permissions, and is_superuser support
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom manager for the User model.

    Required when using AbstractBaseUser.
    Handles creation of regular users and superusers.
    """

    def create_user(self, phone_number, full_name=None, password=None):
        # Phone number is our login identifier
        if not phone_number:
            raise ValueError("Phone number is required")

        # Create user instance
        user = self.model(
            phone_number=phone_number.strip(),  # normalize input
            full_name=full_name,
        )

        if password:
            # Admin/staff accounts log in with a password
            user.set_password(password)
        else:
            # OTP-based login → regular patients do not need passwords
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, full_name=None, password=None):
        """
        Create admin user for Django admin panel.
        Superusers MUST have a password.
        """

        if not password:
            raise ValueError("Superusers must have a password")

        user = self.create_user(
            phone_number=phone_number,
            full_name=full_name,
        )

        # Give admin privileges
        user.is_staff = True
        user.is_superuser = True

        # Superuser needs real password for admin login
        user.set_password(password)

        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model.

    Authentication is based on phone number instead of username/email.
    """

    # Unique phone number used for login
    phone_number = models.CharField(max_length=15, unique=True)

    # Optional display name for the patient
    full_name = models.CharField(max_length=100, blank=True, null=True)

    # National ID, collected once on first-time signup (during OTP
    # verification). Intentionally NOT unique - some patients may
    # share a household ID, guardians booking for children, etc.,
    # and we don't want that to ever block login/registration.
    national_id = models.CharField(max_length=20, blank=True, null=True)

    # Standard Django user flags
    is_active = models.BooleanField(default=True)  # can login
    is_staff = models.BooleanField(default=False)  # can access admin panel

    # Timestamp for account creation
    created_at = models.DateTimeField(auto_now_add=True)

    # Field used for authentication
    USERNAME_FIELD = 'phone_number'

    # No additional required fields for createsuperuser
    REQUIRED_FIELDS = []

    # Attach custom manager
    objects = UserManager()

    class Meta:
        # Database index to speed up phone lookups
        indexes = [
            models.Index(fields=['phone_number']),
        ]

    def __str__(self):
        # Human-readable representation
        return f"{self.phone_number} ({self.full_name or 'No name'})"


class PatientProfile(models.Model):
    """
    Stores additional medical/personal info about the patient.

    Separated from User to keep authentication data minimal.
    """

    # One profile per user
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )

    # Date of birth used for medical context
    date_of_birth = models.DateField(blank=True, null=True)

    # Optional home address
    address = models.TextField(blank=True, null=True)

    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Patient Profile"
        verbose_name_plural = "Patient Profiles"

        # Indexes improve filtering performance
        indexes = [
            models.Index(fields=['date_of_birth']),
        ]

    def __str__(self):
        return f"Profile for {self.user.phone_number}"


class PatientNote(models.Model):
    """
    A clinical note an admin/doctor attaches to a patient's record.
    """
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="clinical_notes",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="authored_notes",
    )
    text = models.TextField(max_length=4000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note for {self.patient.phone_number} @ {self.created_at:%Y-%m-%d}"


class OTPRequest(models.Model):
    """
    Stores OTP codes sent to users for login verification.
    """

    # Phone number requesting the OTP
    phone_number = models.CharField(max_length=15)

    # The 6-digit verification code
    code = models.CharField(max_length=6)

    # When the OTP was created
    created_at = models.DateTimeField(auto_now_add=True)

    # Expiration time (usually 5 minutes later)
    expires_at = models.DateTimeField()

    # Prevent OTP reuse
    is_used = models.BooleanField(default=False)

    class Meta:
        # Indexes for fast OTP lookup and cleanup
        indexes = [
            models.Index(fields=['phone_number', 'is_used']),
            models.Index(fields=['expires_at']),
        ]

    def save(self, *args, **kwargs):
        """
        Automatically set expiration time if not provided.
        Default: 5 minutes from creation.
        """
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)

        super().save(*args, **kwargs)

    def is_expired(self):
        """
        Helper method to check if OTP is expired.
        """
        return timezone.now() > self.expires_at


class PhoneVerification(models.Model):
    """
    Created the moment an OTP code is confirmed correct for a phone
    number that has no account yet.

    Verifying the OTP and finishing signup are two separate steps:
    once the code is confirmed, we're already sure the person owns
    that phone number, and the OTP is consumed right then. This
    token is the proof of that verification that the follow-up
    "give me your name and national ID" step uses instead of asking
    for the OTP code again.
    """

    # The phone number that was just verified
    phone_number = models.CharField(max_length=15)

    # Opaque, unguessable token handed to the client
    token = models.CharField(max_length=64, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # Short-lived - just long enough to fill in a small form
    expires_at = models.DateTimeField()

    # Prevent the same token from completing registration twice
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['token', 'is_used']),
        ]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)

        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at
