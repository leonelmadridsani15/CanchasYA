from django.conf import settings


def site_contact(request):
    return {'whatsapp_number': settings.WHATSAPP_PHONE_NUMBER}
