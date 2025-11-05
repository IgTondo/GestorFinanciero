import React from "react";
import miLogoPropio from "../assets/logoGesta.png"; // 1. Importa tu logo desde assets

export default function Logo() {
  return (
    // Puedes mantener el div contenedor si quieres que el logo tenga un tamaño fijo de w-10 h-10
    // Si tu logo no necesita el fondo degradado, puedes eliminar las clases "bg-gradient-to-br from-indigo-600 to-purple-600"
    <div className="w-16 h-16 rounded-lg flex items-center justify-center">

      {/* 2. Reemplaza el <svg>...</svg> por esto: */}
      <img 
        src={miLogoPropio} 
        alt="Logo de Gesta" 
        className="w-full h-full object-cover" // object-cover asegura que la imagen llene el espacio
      />

    </div>
  );
}


