# Importaciones de sistema
import os
import json
from datetime import datetime, timedelta

# Importaciones de Django
from django.conf import settings
from django.utils import timezone

# Importaciones de terceros
from openai import OpenAI

# Importaciones del proyecto
from apps.users.models import CustomUser
from apps.transactions.models import Transaction, Category
from .models import FinancialInsight

# -----------------------------------------------------------------
# --- La Tarea Principal de Análisis ---
# -----------------------------------------------------------------

def run_openai_analysis():
    """
    Tarea principal (llamada por django-q) para generar consejos
    financieros usando la API de OpenAI.
    """
    print(f"[{timezone.now()}] Iniciando Tarea de Análisis Semanal de OpenAI...")
    
    # 1. Configurar el Cliente de OpenAI
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        print("ERROR: OPENAI_API_KEY no encontrada. Abortando tarea.")
        return "Error: API Key no configurada."
    
    try:
        client = OpenAI(api_key=api_key)
    except Exception as e:
        print(f"Error al inicializar el cliente de OpenAI: {e}")
        return
        
    # 2. Obtener los usuarios a analizar (solo Premium)
    premium_users = CustomUser.objects.filter(role=CustomUser.Role.PREMIUM)
    
    if not premium_users.exists():
        print("No se encontraron usuarios Premium para analizar.")
        return "No hay usuarios Premium."

    # 3. Procesar a cada usuario
    insights_generados = 0
    for user in premium_users:
        print(f"Procesando usuario: {user.email}")
        try:
            # 3.1. Recopilar datos de la última semana
            today = timezone.now().date()
            start_date = today - timedelta(days=7)
            
            transactions = Transaction.objects.filter(
                account__in=user.accounts.all(),
                date__gte=start_date
            )

            if not transactions.exists():
                print(f"Usuario {user.email} no tiene transacciones en la última semana. Omitiendo.")
                continue

            # 3.2. Formatear y Anonimizar Datos
            transaction_list = []
            for t in transactions:
                transaction_list.append({
                    "fecha": t.date.strftime('%Y-%m-%d'),
                    "descripcion": t.description,
                    "categoria": t.category.name if t.category else "Sin Categoría",
                    "monto": float(t.amount), # Convertir Decimal a float para JSON
                    "tipo": t.transaction_type # INGRESO o GASTO
                })
            
            # Convertir a string JSON
            transaction_json = json.dumps(transaction_list)

            # 3.3. Ingeniería de Prompt (El "Cerebro")
            system_prompt = """
            Eres un asesor financiero experto, amigable y proactivo. Tu cliente quiere consejos 
            accionables para ahorrar dinero basados en sus gastos de la última semana.
            
            Analiza el siguiente JSON de transacciones y encuentra UN (1) patrón interesante o 
            UN (1) consejo accionable. Enfócate en la categoría de gasto más alta o en 
            gastos recurrentes no obvios.
            
            Responde ÚNICAMENTE con un objeto JSON válido que siga esta estructura:
            {"titulo": "Tu consejo de la semana", "mensaje": "He notado que... [tu consejo aquí]..."}
            
            El consejo debe ser corto, fácil de entender y positivo.
            """
            
            user_prompt = f"Datos de transacciones: {transaction_json}"

            # 3.4. Llamar a la API de OpenAI
            response = client.chat.completions.create(
                model="gpt-4o-mini", # Modelo rápido y económico
                response_format={"type": "json_object"}, # Forzar respuesta en JSON
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            # 3.5. Parsear y Guardar la Respuesta
            insight_data = json.loads(response.choices[0].message.content)
            
            FinancialInsight.objects.create(
                user=user,
                title=insight_data.get('titulo', 'Tu Consejo Semanal'),
                message=insight_data.get('mensaje', 'No se pudo generar un consejo esta vez.')
            )
            insights_generados += 1
            print(f"Consejo generado exitosamente para {user.email}.")

        except Exception as e:
            # Capturar cualquier error (API caída, JSON roto, etc.)
            # para que el bucle continúe con el siguiente usuario.
            print(f"ERROR al procesar al usuario {user.email}: {e}")
            
    print(f"[{timezone.now()}] Tarea completada. Se generaron {insights_generados} consejos.")
    return f"Se generaron {insights_generados} consejos."