

import React, { useState } from "react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import Feature from "../components/Feature";
import Step from "../components/Step";
import CardPlan from "../components/CardPlan";
import Modal from "../components/Modal";
import AuthForm from "../components/AuthForm";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-lg font-semibold">Gestor Financiero</h1>
            <p className="text-xs text-gray-500">Tu app de finanzas personales</p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <a href="#features" className="hidden md:inline text-sm text-gray-600 hover:text-gray-800">Características</a>
          <a href="#pricing" className="hidden md:inline text-sm text-gray-600 hover:text-gray-800">Precios</a>

          {/* Botones de Login y Registro arriba a la derecha */}
          <button
            /*onClick={() => setShowLogin(true)}*/
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 hover:shadow-sm  text-gray-800"
            aria-label="Iniciar sesión"
          >
            Iniciar sesión
          </button>

          <button
            /*onClick={() => setShowRegister(true)}*/
            className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:opacity-95"
            aria-label="Registrarse"
          >
            Registrarse
          </button>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-extrabold leading-tight"
            >
              Controlá tus finanzas. <span className="text-indigo-600">Sin esfuerzo.</span>
            </motion.h2>

            <p className="mt-4 text-gray-600 max-w-xl">
              Gestor Financiero te ayuda a ver tus ingresos, gastos y metas en un solo lugar.
              Automatiza presupuestos, conecta cuentas y recibe reportes claros para tomar decisiones inteligentes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-medium shadow hover:opacity-95">Comenzar gratis</a>
              <a href="#features" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-700">Ver características</a>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 max-w-md">
              <div className="flex flex-col">
                <dt className="text-sm text-gray-500">Usuarios</dt>
                <dd className="font-semibold text-lg">+12.000</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm text-gray-500">Países</dt>
                <dd className="font-semibold text-lg">15</dd>
              </div>
            </dl>
          </div>

          {/* Mockup del dashboard */}
          <div className="flex justify-center md:justify-end">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white"
            >
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resumen mensual</h3>
                  <div className="text-sm">Sep 2025</div>
                </div>

                <div className="mt-4">
                  <div className="text-xs">Saldo</div>
                  <div className="text-2xl font-bold mt-1">$ 8.420</div>
                </div>

                <div className="mt-4">
                  <div className="h-28 bg-white bg-opacity-20 rounded-lg flex items-end px-2">
                    {/* barras de ejemplo */}
                    <div className="flex w-full gap-2 items-end">
                      <div className="h-8 w-3 rounded bg-gray-500 bg-opacity-80"></div>
                      <div className="h-14 w-3 rounded bg-gray-500 bg-opacity-80"></div>
                      <div className="h-20 w-3 rounded bg-gray-500 bg-opacity-80"></div>
                      <div className="h-10 w-3 rounded bg-gray-500 bg-opacity-80"></div>
                      <div className="h-16 w-3 rounded bg-gray-500 bg-opacity-80"></div>
                      <div className="h-6 w-3 rounded bg-gray-500 bg-opacity-80"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>Ingresos</div>
                  <div className="font-semibold">$5.200</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                  <div>Gastos</div>
                  <div className="font-semibold">$3.100</div>
                </div>

                <div className="mt-4">
                  <button className="w-full py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">Ver detalles</button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-12">
          <h3 className="text-2xl font-bold">Qué podés hacer con Gestor Financiero</h3>
          <p className="text-gray-600 mt-2 max-w-2xl">Herramientas pensadas para simplificar tu día a día y ayudarte a cumplir metas.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature title="Presupuestos automáticos" description="Crea presupuestos inteligentes que se adaptan a tus hábitos." />
            <Feature title="Conexión de cuentas" description="Importa transacciones automáticamente de bancos y tarjetas." />
            <Feature title="Metas & reportes" description="Define metas de ahorro y recibe reportes claros y exportables." />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-12 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Cómo funciona</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step number={1} title="Crear cuenta" desc="Registrate en segundos y conectá tus cuentas bancarias de forma segura." />
            <Step number={2} title="Organizar gastos" desc="Etiquetá y agrupá gastos automáticamente." />
            <Step number={3} title="Ahorra smarter" desc="Establecé metas y seguí tu progreso con notificaciones." />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12">
          <h3 className="text-2xl font-bold">Planes</h3>
          <p className="text-gray-600 mt-2">Empieza gratis o elegí un plan premium para funciones avanzadas.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardPlan title="Gratis" price="0" perks={["Presupuestos básicos", "Soporte por email"]} ctaText="Comenzar gratis" />
            <CardPlan title="Pro" price="7" perks={["Conexión bancaria", "Reportes exportables", "Soporte prioritario"]} ctaText="Pro: $7 mes" highlight/>
            <CardPlan title="Empresa" price="29" perks={["Múltiples usuarios", "Exportaciones CSV/Excel", "SLA dedicado"]} ctaText="Contactar ventas" />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Gestor Financiero 
        </footer>
      </main>

      {/* Modales de Login / Registro */}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}

      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}


