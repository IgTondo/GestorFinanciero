import React from "react";

export interface AuthFormProps {
  mode?: 'login' | 'register';
  onClose: () => void;
}

export default function AuthForm({ mode = 'login', onClose }: AuthFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`${mode === 'login' ? 'Iniciando sesión' : 'Registrando usuario'} (demo)`);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-gray-600">Email</label>
        <input required type="email" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="text-sm text-gray-600">Contraseña</label>
        <input required type="password" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2" />
      </div>

      {mode === 'register' && (
        <div>
          <label className="text-sm text-gray-600">Confirmar contraseña</label>
          <input required type="password" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2" />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-medium">{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg border">Cancelar</button>
      </div>
    </form>
  );
}


