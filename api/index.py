"""Punto de entrada WSGI para Vercel (runtime @vercel/python).

Vercel importa el objeto `app` de este módulo y lo usa como WSGI handler.
Plantea un deploy usando ASGI si lo prefieres: basta exponer `app` desde
core.asgi en lugar de core.wsgi.
"""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

from django.core.wsgi import get_wsgi_application  # noqa: E402

app = get_wsgi_application()