# Importaciones de sistema
import os
import json
from datetime import datetime, timedelta

# Importaciones de Django
from django.conf import settings
from django.utils import timezone

# Importaciones de terceros
from openai import OpenAI

# Importaciones de tu proyecto
from apps.users.models import CustomUser, Membership
from apps.transactions.models import Transaction, Category
from .models import FinancialInsight

# -----------------------------------------------------------------
# --- La Tarea Principal de Análisis ---
# -----------------------------------------------------------------

def run_openai_analysis():
    """
    Tarea principal (llamada por django-q) para generar consejos
    financieros usando la API de OpenAI.
    
    Esta versión agrupa las transacciones por cuenta para dar
    un contexto holístico al LLM.
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
            # 3.1. Recopilar datos de la última semana (¡NUEVA LÓGICA DE AGRUPACIÓN!)
            today = timezone.now().date()
            start_date = today - timedelta(days=7)
            
            # Este diccionario guardará los datos para el JSON final
            datos_por_cuenta = {}

            # Iteramos por cada cuenta a la que pertenece el usuario
            for account in user.accounts.all():
                
                # Obtener el nombre de visualización (alias) de la cuenta
                try:
                    membership = Membership.objects.get(user=user, account=account)
                    account_display_name = membership.alias if membership.alias else account.name
                except Membership.DoesNotExist:
                    account_display_name = account.name # Fallback
                
                # Buscar transacciones de la semana SOLO para esta cuenta
                transactions = Transaction.objects.filter(
                    account=account,
                    date__gte=start_date
                )

                if not transactions.exists():
                    continue # Omitir esta cuenta si no tiene transacciones

                # Formatear y Anonimizar Datos de esta cuenta
                transaction_list = []
                for t in transactions:
                    transaction_list.append({
                        "fecha": t.date.strftime('%Y-%m-%d'),
                        "descripcion": t.description,
                        "categoria": t.category.name if t.category else "Sin Categoría",
                        "monto": float(t.amount), # Convertir Decimal a float para JSON
                        "tipo": t.transaction_type # INGRESO o GASTO
                    })
                
                # Añadir la lista de transacciones al diccionario principal
                datos_por_cuenta[account_display_name] = transaction_list
            
            # Si no hay NINGUNA transacción en NINGUNA cuenta, omitir al usuario
            if not datos_por_cuenta:
                print(f"Usuario {user.email} no tiene transacciones en la última semana. Omitiendo.")
                continue

            # Convertir a string JSON
            transaction_json = json.dumps(datos_por_cuenta, indent=2)

            # 3.2. Ingeniería de Prompt (¡PROMPT ACTUALIZADO!)
            system_prompt = f"""
            Eres un asesor financiero experto, amigable y proactivo. Tu cliente quiere consejos 
            accionables para ahorrar dinero basados en sus gastos de la última semana.
            
            Te voy a pasar un JSON donde las claves son los nombres de las cuentas del 
            cliente (ej: "Cuenta Personal", "Ahorros") y los valores son una lista 
            de transacciones de esa cuenta.
            
            Tu trabajo es analizar estos gastos de forma HOLÍSTICA. Busca patrones 
            *entre* las cuentas. Por ejemplo:
            - ¿Está usando la cuenta de "Ahorros" para gastos diarios?
            - ¿Sus gastos de "Ocio" salen de la cuenta "Hogar Compartido"?
            - ¿Está transfiriendo mucho dinero entre cuentas sin motivo aparente?
            
            Encuentra UN (1) patrón o consejo accionable basado en este análisis.
            
            Responde ÚNICAMENTE con un objeto JSON válido que siga esta estructura:
            {{"titulo": "Tu consejo de la semana", "mensaje": "He notado que... [tu consejo aquí]..."}}
            
            El consejo debe ser corto, fácil de entender y positivo.
            """
            
            user_prompt = f"Datos de transacciones agrupadas por cuenta: {transaction_json}"

            # 3.3. Llamar a la API de OpenAI
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            # 3.4. Parsear y Guardar la Respuesta
            insight_data = json.loads(response.choices[0].message.content)
            
            FinancialInsight.objects.create(
                user=user,
                title=insight_data.get('titulo', 'Tu Consejo Semanal'),
                message=insight_data.get('mensaje', 'No se pudo generar un consejo esta vez.')
            )
            insights_generados += 1
            print(f"Consejo generado exitosamente para {user.email}.")

        except Exception as e:
            print(f"ERROR al procesar al usuario {user.email}: {e}")
            
    print(f"[{timezone.now()}] Tarea completada. Se generaron {insights_generados} consejos.")
    return f"Se generaron {insights_generados} consejos."