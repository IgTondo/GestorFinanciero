// src/pages/RecommendationsPage.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AuthenticatedLayout from "../AuthenticatedLayout";

// 👇 1. Interfaz para la nueva data
export interface Recommendation {
    id: number;
    title: string;
    message: string;
    // Puedes agregar más campos como 'priority', 'category', etc.
}

const API_BASE_URL = "http://localhost:8000";

export const RecommendationsPage: React.FC = () => {
    // 👇 2. Estado para guardar las recomendaciones
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);

                let accessToken = localStorage.getItem("accessToken");
                const refreshToken = localStorage.getItem("refreshToken");

                if (!accessToken) {
                    setError("No se encontró un access token. Iniciá sesión de nuevo.");
                    setLoading(false);
                    return;
                }

                // 👇 3. URL del nuevo endpoint (ajusta si es necesario)
                let res = await fetch(`${API_BASE_URL}/api/insights/`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (res.status === 401 && refreshToken) {
                    const refreshRes = await fetch(
                        `${API_BASE_URL}/api/auth/token/refresh/`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ refresh: refreshToken }),
                        }
                    );

                    if (refreshRes.ok) {
                        const data = await refreshRes.json();
                        const newAccess = data.access;
                        localStorage.setItem("accessToken", newAccess);
                        accessToken = newAccess;

                        // 👇 4. Reintento al nuevo endpoint
                        res = await fetch(`${API_BASE_URL}/api/insights/`, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });
                    } else {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        throw new Error("Sesión expirada. Volvé a iniciar sesión.");
                    }
                }

                // 👇 5. Mensaje de error actualizado
                if (!res.ok) throw new Error("Error al cargar las recomendaciones");

                const data: Recommendation[] = await res.json();

                // 👇 6. Guardando la data en el estado correcto
                setRecommendations(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    return (
        <AuthenticatedLayout>
            {/* Hero */}
            < div className="bg-gradient-to-r from-indigo-800 via-violet-700 to-indigo-900 text-white" >
                <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" >
                    <div>
                        {/* 👇 7. Textos del Hero actualizados */}
                        < motion.p
                            className="text-xs uppercase tracking-[0.2em] text-violet-200/80 mb-2"
                            initial={{ opacity: 0, y: 6 }
                            } animate={{ opacity: 1, y: 0 }}
                        >
                            {"Sugerencias para vos"}
                        </motion.p>

                        < motion.h1
                            className="text-2xl md:text-3xl font-semibold tracking-tight"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Recomendaciones
                        </motion.h1>
                        < motion.p
                            className="mt-2 text-sm md:text-base text-violet-100/90 max-w-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Basado en tu actividad reciente, aquí tenés algunas sugerencias
                            para mejorar tu salud financiera y alcanzar tus metas.
                        </motion.p>
                    </div>

                    {/* 👇 8. Quitamos los botones de "Nueva Cuenta" de esta vista */}
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1" >
                <div className="max-w-6xl mx-auto px-4 py-8" >
                    {loading && (
                        <div className="flex justify-center py-12" >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700" />
                        </div>
                    )}

                    {
                        error && !loading && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" >
                                {error}
                            </div>
                        )
                    }

                    {
                        !loading && !error && (
                            // 👇 9. Lógica para renderizar las recomendaciones
                            <>
                                {
                                    recommendations.length === 0 ? (
                                        <div className="text-center text-slate-500 py-12" >
                                            <h3 className="text-lg font-medium text-slate-800">
                                                Todo en orden
                                            </ h3 >
                                            <p className="text-sm" >
                                                No tenés nuevas recomendaciones por ahora.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4" >
                                            {
                                                recommendations.map((rec) => (
                                                    <motion.div
                                                        key={rec.id}
                                                        className="bg-white border border-slate-200 rounded-lg shadow-sm p-4"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }
                                                        }
                                                    >
                                                        <h4 className="font-semibold text-indigo-700" >
                                                            {rec.title}
                                                        </h4>
                                                        < p className="text-sm text-slate-600 mt-1" >
                                                            {rec.message}
                                                        </p>
                                                    </motion.div>
                                                ))}
                                        </div>
                                    )}
                            </>
                        )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};