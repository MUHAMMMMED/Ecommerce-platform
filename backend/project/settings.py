
from pathlib import Path
from datetime import timedelta
from decouple import config
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
 
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config(
    "SECRET_KEY",
    cast=str,
    default="l#c66qv(=&0ktjbiuguigptw+zi%kf2xv&&x%&8da&j^m7#-kq+cw5a**"
)
 
DEBUG = config('DEBUG', cast=bool, default=False)
 
# ALLOWED_HOSTS = ["localhost", "127.0.0.1", "backend", "nginx"]
ALLOWED_HOSTS = [
    "altaurea.com",
    "www.altaurea.com",
    "46.101.182.75",
    "localhost",
]
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django_cleanup.apps.CleanupConfig',
    'accounts',
    'products',
    'cart',
    'orders',
    'customers',
    'shipping',
    'media_library',
    'payment',
]



MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'project.urls'
AUTH_USER_MODEL = 'accounts.User'

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

WSGI_APPLICATION = 'project.wsgi.application'

 
  

# ================= REST + JWT =================
REST_FRAMEWORK = {
    "NON_FIELD_ERRORS_KEY": "error",
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=800),
    "ROTATE_REFRESH_TOKENS": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
# ================== CORS + CSRF ==================
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS=True


CORS_ALLOWED_ORIGINS = [
    "https://altaurea.com",
    "https://www.altaurea.com",
    "http://46.101.182.75",
    "https://46.101.182.75",
]

CSRF_TRUSTED_ORIGINS = [
    "https://altaurea.com",
    "https://www.altaurea.com",
    "http://46.101.182.75",
    "https://46.101.182.75",
]
 

 
 
# CORS_ALLOWED_ORIGINS = [
#     'http://localhost:3000',
# ]
# CSRF_TRUSTED_ORIGINS = [
#     'http://localhost:3000',
# ]



# ================= Session =================
 
 
SESSION_COOKIE_SECURE = True  # Requires HTTPS in production
SESSION_COOKIE_SAMESITE = 'None'  # Allow cross-origin cookie sending
SESSION_COOKIE_HTTPONLY = True  # Optional, for security

# ================= LOG =================

 
 
 
 
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
 

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.getenv('POSTGRES_DB'),
#         'USER': os.getenv('POSTGRES_USER'),
#         'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
#         'HOST': 'db',
#         'PORT': '5432',
#     }
# }

 

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
 
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Riyadh'
USE_I18N = True
USE_TZ = True



STATIC_URL = '/static/'
STATIC_ROOT = '/app/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = '/app/media/'



# STATIC_URL = '/static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# MEDIA_URL = '/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

 
# DOMAIN = "http://localhost:3000"
DOMAIN = config("DOMAIN", default="https://altaurea.com")
 
 
 


# Stripe settings
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY') 
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY" )
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET" )
 

 

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
 
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_PORT = 587   
















