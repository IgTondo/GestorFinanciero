from django.apps import AppConfig


class AutomationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.automation'
    
    def ready(self):
        """
        Esta función se llama cuando la aplicación está lista.
        Es el lugar correcto para importar los signals.
        """
        # Esta línea importa y "registra" tu archivo signals.py
        import apps.automation.signals
