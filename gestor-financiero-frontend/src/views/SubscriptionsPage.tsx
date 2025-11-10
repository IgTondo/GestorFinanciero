import React from 'react';
import AuthenticatedLayout from '../AuthenticatedLayout.tsx';

export const SubscriptionsPage: React.FC = () => {

  // El usuario especificó leer 'isPremium' con localStorage.getItem
  const isPremiumString = localStorage.getItem("isPremium");


  // Convertimos el string "true" o "false" de localStorage a un booleano real
  const isPro = isPremiumString === "true";

  // Determinamos el nombre del plan basado en el booleano
  const planName = isPro ? "Plan Pro" : "Plan Básico";

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6" >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6" >
          Gestión de Suscripción
        </h1>

        {/* 1. Tarjeta del Plan Actual (Datos de localStorage) */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-slate-200 mb-8" >
          <h2 className="text-xl font-semibold mb-3 text-slate-800" >
            Tu Plan Actual
          </h2>
          < p className="text-4xl md:text-5xl font-bold text-indigo-600 mb-4" >
            {planName}
          </p>
          < p className="text-slate-600 mb-6" >
            {
              isPro
                ? `Hola. Ya estas disfrutando de todas las funcionalidades premium de Gesta.`
                : `Hola. Estás en el plan gratuito. ¡Considera mejorar para desbloquear más funciones!`}
          </p>

          {/* Mostrar "Cancelar" solo si es un plan de pago (isPro es true) */}
          {
            isPro && (
              <button
                type="button"
                className="text-sm font-medium text-red-600 hover:text-red-800 transition"
                onClick={() => alert("Lógica para cancelar suscripción")
                }
              >
                Cancelar suscripción
              </button>
            )}
        </div>

        {/* 2. Opciones de Planes (Se actualiza según isPro) */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-slate-200" >
          <h2 className="text-xl font-semibold text-slate-800 mb-5" >
            Planes Disponibles
          </h2>
          < div className="grid md:grid-cols-2 gap-6" >

            {/* Columna Plan Básico */}
            < div
              className={`p-5 rounded-lg border-2 ${!isPro ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
                }`}
            >
              <h3 className="text-lg font-semibold text-slate-700" > Plan Básico </h3>
              < p className="text-3xl font-bold text-slate-900 my-2" > Gratis </p>
              < ul className="text-sm text-slate-600 list-disc list-inside space-y-1 mb-4" >
                <li>Seguimiento de 1 cuenta </li>
                < li > Categorización básica </li>
                < li > Dashboard simple </li>
              </ul>
              {/* Mostrar si este es el plan actual */}
              {
                !isPro && (
                  <p className="font-semibold text-indigo-600" >
                    Este es tu plan actual
                  </p>
                )
              }
            </div>

            {/* Columna Plan Pro */}
            <div
              className={
                `p-5 rounded-lg border-2 ${isPro ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
                }`
              }
            >
              <h3 className="text-lg font-semibold text-slate-700" > Plan Pro </h3>
              < p className="text-3xl font-bold text-slate-900 my-2" >
                10USD < span className="text-sm font-normal text-slate-500" > / mes</span >
              </p>
              < ul className="text-sm text-slate-600 list-disc list-inside space-y-1 mb-4" >
                <li>Cuentas ilimitadas </li>
                < li > Gráficos avanzados </li>
                < li > Reglas y automatizaciones </li>
                < li > Soporte prioritario </li>
              </ul>
              {/* Mostrar el botón de "Mejorar" solo si no es Pro */}
              {
                !isPro && (
                  <button
                    type="button"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    onClick={() => alert("Lógica para mejorar a Pro")
                    }
                  >
                    Mejorar a Pro
                  </button>
                )}
              {/* Mostrar si este es el plan actual */}
              {
                isPro && (
                  <p className="font-semibold text-indigo-600" >
                    Este es tu plan actual
                  </p>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};