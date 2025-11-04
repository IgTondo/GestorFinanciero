import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";

const API_BASE_URL = "http://localhost:8000";

interface Member {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface ManageAccountModalProps {
  isOpen: boolean;
  accountId: string;
  currentName: string;
  isOwner: boolean;
  onAccountRenamed: (newName: string) => void;
  onClose: () => void;
}

const ManageAccountModal: React.FC<ManageAccountModalProps> = ({
  isOpen,
  accountId,
  currentName,
  isOwner,
  onAccountRenamed,
  onClose,
}) => {
  const navigate = useNavigate();

  // Nombre general de la cuenta (global)
  const [name, setName] = useState(currentName);

  // Alias personal (guardado en Membership vía /alias/)
  const [alias, setAlias] = useState<string>("");

  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const [loadingAlias, setLoadingAlias] = useState(false);
  const [savingAlias, setSavingAlias] = useState(false);

  const [savingName, setSavingName] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  // helper fetch con refresh token
  const authFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken) {
      throw new Error("No se encontró un access token. Iniciá sesión de nuevo.");
    }

    const withAuth: RequestInit = {
      ...(init || {}),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers || {}),
      },
    };

    let res = await fetch(input, withAuth);

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

        const retryInit: RequestInit = {
          ...(init || {}),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...(init?.headers || {}),
          },
        };

        res = await fetch(input, retryInit);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw new Error("Sesión expirada. Volvé a iniciar sesión.");
      }
    }

    return res;
  };

  // 🔹 Cargar miembros (todos pueden ver)
  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const res = await authFetch(
          `${API_BASE_URL}/api/accounts/${accountId}/members/`,
          { method: "GET" }
        );

        if (!res.ok) {
          console.warn("Error al cargar miembros");
          return;
        }

        const data: Member[] = await res.json();
        setMembers(data);
      } catch (err) {
        console.warn("Error cargando miembros", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [isOpen, accountId]);

  // 🔹 Cargar alias personal desde la API (Membership)
  useEffect(() => {
    if (!isOpen) return;

    const fetchAlias = async () => {
      try {
        setLoadingAlias(true);
        const res = await authFetch(
          `${API_BASE_URL}/api/accounts/${accountId}/alias/`,
          { method: "GET" }
        );

        // Si aún no tiene alias puede venir 404 o similar, no es grave
        if (!res.ok) {
          return;
        }

        const data = await res.json().catch(() => null);
        if (data && typeof data.alias === "string") {
          setAlias(data.alias);
        }
      } catch (err) {
        console.warn("Error cargando alias personal", err);
      } finally {
        setLoadingAlias(false);
      }
    };

    fetchAlias();
  }, [isOpen, accountId]);

  // 🔹 Guardar nombre general (solo owner)
  const handleSaveName = async () => {
    if (!isOwner) return;

    try {
      setSavingName(true);
      setError(null);

      const res = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ name: name.trim() }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.detail || data?.error || "No se pudo actualizar el nombre.";
        throw new Error(msg);
      }

      if (data?.name) {
        onAccountRenamed(data.name);
      } else {
        onAccountRenamed(name.trim());
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar el nombre.");
    } finally {
      setSavingName(false);
    }
  };

  // 🔹 Guardar alias personal (cualquier miembro puede, se guarda en Membership)
  const handleSaveAlias = async () => {
    try {
      setSavingAlias(true);
      setError(null);

      const res = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/alias/`,
        {
          method: "PATCH",
          body: JSON.stringify({ alias: alias.trim() }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.detail || data?.error || "No se pudo actualizar el alias personal.";
        throw new Error(msg);
      }

      
    } catch (err: any) {
      setError(err.message || "Error al actualizar el alias personal.");
    } finally {
      setSavingAlias(false);
    }
  };

  // 🔹 Agregar miembro (solo owner)
  const handleAddMember = async () => {
    if (!isOwner) return;
    if (!newMemberEmail.trim()) return;

    try {
      setAddingMember(true);
      setError(null);

      const res = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/members/`,
        {
          method: "POST",
          body: JSON.stringify({ email: newMemberEmail.trim() }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.detail || data?.error || "No se pudo agregar el miembro.";
        throw new Error(msg);
      }

      const membersRes = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/members/`,
        { method: "GET" }
      );
      if (membersRes.ok) {
        const list: Member[] = await membersRes.json();
        setMembers(list);
      }

      setNewMemberEmail("");
    } catch (err: any) {
      setError(err.message || "Error al agregar miembro.");
    } finally {
      setAddingMember(false);
    }
  };

  // 🔹 Eliminar cuenta (solo owner)
  const handleDeleteAccount = async () => {
    if (!isOwner) return;

    if (
      !window.confirm(
        "¿Estás seguro de que querés eliminar esta cuenta? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const res = await authFetch(
        `${API_BASE_URL}/api/accounts/${accountId}/`,
        { method: "DELETE" }
      );

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.detail || data?.error || "No se pudo eliminar la cuenta.";
        throw new Error(msg);
      }

      onClose();
      navigate("/accounts");
    } catch (err: any) {
      setError(err.message || "Error al eliminar la cuenta.");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Gestionar cuenta" onClose={onClose}>
      <div className="space-y-6 text-sm">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {/* 🔹 Nombre general de la cuenta */}
        <section className="space-y-2">
          <h3 className="font-semibold text-slate-800">Nombre de la cuenta</h3>
          <p className="text-xs text-slate-500">
            Este es el nombre general que ven todos los miembros.
          </p>

          {isOwner ? (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 disabled:opacity-60"
              >
                {savingName ? "Guardando..." : "Guardar"}
              </button>
            </div>
          ) : (
            <div className="mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700">
              {name || "Sin nombre configurado"}
            </div>
          )}
        </section>

        {/* 🔹 Alias personal (Membership) */}
        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="font-semibold text-slate-800">Alias personal</h3>
          <p className="text-xs text-slate-500">
            Este alias solo aplica para tu usuario en esta cuenta. Se usa para
            mostrar un nombre personalizado (por ejemplo en la lista de cuentas).
          </p>

          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder={loadingAlias ? "Cargando alias..." : "Alias opcional"}
            />
            <button
              type="button"
              onClick={handleSaveAlias}
              disabled={savingAlias}
              className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-60"
            >
              {savingAlias ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </section>

        {/* 🔹 Miembros (todos ven, solo owner agrega) */}
        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="font-semibold text-slate-800">Miembros de la cuenta</h3>
          <p className="text-xs text-slate-500">
            Personas que tienen acceso a esta cuenta.
          </p>

          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 max-h-40 overflow-auto">
            {loadingMembers ? (
              <p className="text-xs text-slate-500">Cargando miembros...</p>
            ) : members.length === 0 ? (
              <p className="text-xs text-slate-500">
                No hay miembros registrados en esta cuenta.
              </p>
            ) : (
              <ul className="space-y-1 text-xs">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between text-slate-700"
                  >
                    <span>
                      {m.first_name || m.last_name
                        ? `${m.first_name || ""} ${m.last_name || ""}`.trim()
                        : m.email}
                    </span>
                    <span className="text-slate-400">{m.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isOwner && (
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                placeholder="Email del nuevo miembro"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleAddMember}
                disabled={addingMember}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 disabled:opacity-60"
              >
                {addingMember ? "Agregando..." : "Agregar"}
              </button>
            </div>
          )}
        </section>

        {/* 🔹 Zona peligrosa (solo owner) */}
        {isOwner && (
          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="font-semibold text-red-600">Zona peligrosa</h3>
            <p className="text-xs text-slate-500">
              Eliminar la cuenta la borra de forma permanente. Solo el
              propietario puede hacerlo.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-500 disabled:opacity-60"
            >
              {deleting ? "Eliminando..." : "Eliminar cuenta"}
            </button>
          </section>
        )}
      </div>
    </Modal>
  );
};

export default ManageAccountModal;
