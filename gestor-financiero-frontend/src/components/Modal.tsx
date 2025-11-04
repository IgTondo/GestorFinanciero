import React from "react";
import { motion } from "framer-motion";

export interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="
          relative z-10
          w-full max-w-md mx-4
          bg-white rounded-2xl shadow-2xl
          overflow-hidden
          max-h-[90vh]          /* no más alto que la pantalla */
          flex flex-col         /* header fijo + body scrollable */
        "
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 👇 ahora el contenido hace scroll si se pasa */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
