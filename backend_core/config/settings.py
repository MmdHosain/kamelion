from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = ['*']

# ── Apps ──────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
]

LOCAL_APPS = [
    'apps.users',
    'apps.appointments',
    'apps.comments',
    'apps.chat_gateway',
    'apps.common',
    'apps.articles',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ── Middleware ─────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# ── Database (PostgreSQL) ──────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# ── Custom User Model ──────────────────────────────────
AUTH_USER_MODEL = 'users.User'

# ── DRF ───────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# ── JWT ───────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── FastAPI Gateway ────────────────────────────────────
FASTAPI_BASE_URL = config('FASTAPI_BASE_URL', default='http://localhost:8001')
FASTAPI_TIMEOUT = config('FASTAPI_TIMEOUT', default=10, cast=int)

# ── SMS (PanelChi) ─────────────────────────────────────
# SMS_PROVIDER controls how request_otp() delivers its code:
#   - 'console' (default): print the code to the server log only -
#     no real SMS is sent. Used for local development.
#   - 'panelchi': send via the PanelChi pattern-SMS API below.
SMS_PROVIDER = config('SMS_PROVIDER', default='console')

PANELCHI_BASE_URL = config('PANELCHI_BASE_URL', default='https://api.panelchi.com')
PANELCHI_TIMEOUT = config('PANELCHI_TIMEOUT', default=10, cast=int)
PANELCHI_SMS_TOKEN = config('PANELCHI_SMS_TOKEN', default='')
# May be left blank to use the account's default sender.
PANELCHI_SOURCE_NUMBER = config('PANELCHI_SOURCE_NUMBER', default='')

# Pattern slug for the OTP step (apps/users - covers both first-time
# and returning-user login, since verify_otp() is a single shared
# step for both). Set once the pattern is created and approved in the
# PanelChi dashboard.
PANELCHI_PATTERN_LOGIN = config('PANELCHI_PATTERN_LOGIN', default='')

# Appointment decision notices (apps/appointments/notifications.py),
# sent when an admin approves / disapproves a pending reservation.
PANELCHI_PATTERN_APPOINTMENT_APPROVED = config('PANELCHI_PATTERN_APPOINTMENT_APPROVED', default='')
PANELCHI_PATTERN_APPOINTMENT_REJECTED = config('PANELCHI_PATTERN_APPOINTMENT_REJECTED', default='')

# ── CORS ──────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ── Static ────────────────────────────────────────────
STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Media (uploaded files, e.g. article images) ────────
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ── Logging ───────────────────────────────────────────
# Django's own default logging config only sends request-error
# tracebacks to the console when DEBUG=True (its 'console' handler
# has a require_debug_true filter baked in). Since this project runs
# with DEBUG=False, that meant every unhandled 500 was being silently
# swallowed - `docker compose logs backend` showed only the plain
# access-log line, never the actual Python traceback. This overrides
# that: a console handler with no such filter, so tracebacks for any
# unhandled exception always show up in the container logs.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

