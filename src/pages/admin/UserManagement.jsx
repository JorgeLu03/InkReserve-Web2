import { useEffect, useMemo, useState } from "react";
import "./UserManagement.css";
import { getUsuarios, updateUsuario } from "../../services/apiService";

/* ──────────────────────────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────────────────────── */

const COLORES_AVATAR = ["#7c3aed", "#0ea5e9", "#16a34a", "#d97706", "#ec4899", "#0891b2", "#a855f7", "#f97316"];

function iniciales(nombre) {
  return (nombre || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "??";
}

function colorPorNombre(nombre) {
  let suma = 0;
  for (const c of nombre || "") suma += c.charCodeAt(0);
  return COLORES_AVATAR[suma % COLORES_AVATAR.length];
}

function formatFecha(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/** Decodifica el JWT del localStorage sin validar firma (solo para
 *  identificar al admin actual y deshabilitar acciones sobre sí mismo). */
function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id ?? null;
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
─────────────────────────────────────────────────────────────── */

export default function UserManagement() {
  const [usuarios, setUsuarios]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [busqueda, setBusqueda]     = useState("");
  const [filtroRol, setFiltroRol]   = useState("todos");      // todos | admin | usuario
  const [filtroEstado, setFiltroEstado] = useState("todos");  // todos | activo | inactivo
  const [seleccionado, setSeleccionado] = useState(null);
  const [accionando, setAccionando] = useState(null);         // id del usuario sobre el que se está aplicando una acción
  const [mensajeError, setMensajeError] = useState(null);

  const currentUserId = useMemo(getCurrentUserId, []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await getUsuarios();
        if (!cancelado) setUsuarios(data);
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  // ── Aplicar filtros + búsqueda ────────────────────────────────
  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtroRol === "admin"   && !u.Es_Admin)    return false;
      if (filtroRol === "usuario" &&  u.Es_Admin)    return false;
      if (filtroEstado === "activo"   && !u.Esta_Activo) return false;
      if (filtroEstado === "inactivo" &&  u.Esta_Activo) return false;
      if (q) {
        const nombre = (u.Nombre_Completo   || "").toLowerCase();
        const correo = (u.Correo_Electronico|| "").toLowerCase();
        if (!nombre.includes(q) && !correo.includes(q)) return false;
      }
      return true;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  // ── Conteos para el header ───────────────────────────────────
  const totalAdmins   = usuarios.filter((u) =>  u.Es_Admin).length;
  const totalActivos  = usuarios.filter((u) =>  u.Esta_Activo).length;
  const totalInactivos = usuarios.length - totalActivos;

  // ── Acciones ─────────────────────────────────────────────────
  async function aplicarCambio(usuario, cambios, mensajeConfirm) {
    if (mensajeConfirm && !window.confirm(mensajeConfirm)) return;
    setMensajeError(null);
    setAccionando(usuario._id);
    try {
      const res = await updateUsuario(usuario._id, cambios);
      // Reemplazar el usuario actualizado en la lista
      setUsuarios((prev) =>
        prev.map((u) => (u._id === res.usuario._id ? res.usuario : u))
      );
      // Si tenemos el panel de detalle abierto y es el mismo usuario, actualizarlo
      if (seleccionado?._id === res.usuario._id) {
        setSeleccionado(res.usuario);
      }
    } catch (e) {
      setMensajeError(e.message || "No se pudo aplicar el cambio.");
    } finally {
      setAccionando(null);
    }
  }

  function toggleAdmin(u) {
    const nuevo = !u.Es_Admin;
    aplicarCambio(
      u,
      { Es_Admin: nuevo },
      nuevo
        ? `¿Convertir a "${u.Nombre_Completo}" en administrador?`
        : `¿Quitar permisos de administrador a "${u.Nombre_Completo}"?`,
    );
  }

  function toggleActivo(u) {
    const nuevo = !u.Esta_Activo;
    aplicarCambio(
      u,
      { Esta_Activo: nuevo },
      nuevo
        ? `¿Reactivar la cuenta de "${u.Nombre_Completo}"?`
        : `¿Dar de baja a "${u.Nombre_Completo}"? No podrá iniciar sesión.`,
    );
  }

  /* ── Render ──────────────────────────────────────────────── */

  if (loading) {
    return (
      <section className="userMgmtView">
        <p className="userMgmtEmpty">Cargando usuarios…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="userMgmtView">
        <p className="userMgmtEmpty userMgmtError">
          No se pudieron cargar los usuarios: {error}
        </p>
      </section>
    );
  }

  return (
    <section className="userMgmtView">
      {/* ── HERO / RESUMEN ── */}
      <header className="userMgmtHero">
        <div>
          <p className="userMgmtEyebrow">Panel administrativo</p>
          <h2 className="userMgmtTitle">Gestión de Usuarios</h2>
          <p className="userMgmtIntro">
            Administra los accesos al sistema: cambia roles, da de baja cuentas o reactívalas.
          </p>
        </div>

        <div className="userMgmtStats">
          <div className="userMgmtStat">
            <span className="userMgmtStatVal">{usuarios.length}</span>
            <span className="userMgmtStatLabel">Usuarios totales</span>
          </div>
          <div className="userMgmtStatDivider" />
          <div className="userMgmtStat">
            <span className="userMgmtStatVal">{totalAdmins}</span>
            <span className="userMgmtStatLabel">Administradores</span>
          </div>
          <div className="userMgmtStatDivider" />
          <div className="userMgmtStat">
            <span className="userMgmtStatVal">{totalActivos}</span>
            <span className="userMgmtStatLabel">Activos</span>
          </div>
          <div className="userMgmtStatDivider" />
          <div className="userMgmtStat">
            <span className="userMgmtStatVal">{totalInactivos}</span>
            <span className="userMgmtStatLabel">Inactivos</span>
          </div>
        </div>
      </header>

      {/* ── FILTROS ── */}
      <div className="userMgmtFilters">
        <div className="userMgmtSearchWrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="userMgmtSearch"
          />
        </div>

        <label className="userMgmtSelectWrap">
          <span className="userMgmtSelectLabel">Rol</span>
          <select
            className="userMgmtSelect"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="admin">Admin</option>
            <option value="usuario">Usuario</option>
          </select>
        </label>

        <label className="userMgmtSelectWrap">
          <span className="userMgmtSelectLabel">Estado</span>
          <select
            className="userMgmtSelect"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </label>
      </div>

      {mensajeError && (
        <div className="userMgmtFeedback userMgmtFeedback--error">{mensajeError}</div>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="userMgmtMain">
        {/* TABLA */}
        <div className="userMgmtTableWrap">
          {usuariosFiltrados.length === 0 ? (
            <p className="userMgmtEmpty">No hay usuarios que coincidan con los filtros.</p>
          ) : (
            <div className="userMgmtTable">
              <div className="userMgmtTableHead">
                <span>Usuario</span>
                <span>Rol</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>

              {usuariosFiltrados.map((u) => {
                const esYo = String(u._id) === String(currentUserId);
                const ocupado = accionando === u._id;

                return (
                  <div
                    key={u._id}
                    className={`userMgmtTableRow ${seleccionado?._id === u._id ? "userMgmtTableRow--selected" : ""}`}
                  >
                    <button
                      type="button"
                      className="userMgmtRowMain"
                      onClick={() => setSeleccionado(u)}
                      aria-label={`Ver detalle de ${u.Nombre_Completo}`}
                    >
                      <div
                        className="userMgmtAvatar"
                        style={{ background: colorPorNombre(u.Nombre_Completo) }}
                      >
                        {iniciales(u.Nombre_Completo)}
                      </div>
                      <div className="userMgmtNameCell">
                        <strong className="userMgmtName">
                          {u.Nombre_Completo}
                          {esYo && <span className="userMgmtSelfTag">tú</span>}
                        </strong>
                        <span className="userMgmtEmail">{u.Correo_Electronico}</span>
                      </div>
                    </button>

                    <span className={`userMgmtBadge userMgmtBadge--${u.Es_Admin ? "admin" : "user"}`}>
                      {u.Es_Admin ? "Admin" : "Usuario"}
                    </span>

                    <span className={`userMgmtBadge userMgmtBadge--${u.Esta_Activo ? "active" : "inactive"}`}>
                      {u.Esta_Activo ? "Activo" : "Inactivo"}
                    </span>

                    <div className="userMgmtActions">
                      <button
                        type="button"
                        className="userMgmtActionBtn"
                        onClick={() => toggleAdmin(u)}
                        disabled={esYo || ocupado}
                        title={esYo ? "No puedes modificar tu propio rol" : (u.Es_Admin ? "Quitar admin" : "Hacer admin")}
                      >
                        {u.Es_Admin ? "Quitar admin" : "Hacer admin"}
                      </button>

                      <button
                        type="button"
                        className={`userMgmtActionBtn ${u.Esta_Activo ? "userMgmtActionBtn--danger" : "userMgmtActionBtn--primary"}`}
                        onClick={() => toggleActivo(u)}
                        disabled={esYo || ocupado}
                        title={esYo ? "No puedes desactivar tu propia cuenta" : (u.Esta_Activo ? "Dar de baja" : "Reactivar")}
                      >
                        {u.Esta_Activo ? "Dar de baja" : "Reactivar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL DE DETALLE */}
        {seleccionado && (
          <aside className="userMgmtDetail">
            <button
              type="button"
              className="userMgmtDetailClose"
              onClick={() => setSeleccionado(null)}
              aria-label="Cerrar detalle"
            >
              ×
            </button>

            <div
              className="userMgmtDetailAvatar"
              style={{ background: colorPorNombre(seleccionado.Nombre_Completo) }}
            >
              {iniciales(seleccionado.Nombre_Completo)}
            </div>

            <h3 className="userMgmtDetailName">{seleccionado.Nombre_Completo}</h3>
            <p className="userMgmtDetailEmail">{seleccionado.Correo_Electronico}</p>

            <div className="userMgmtDetailBadges">
              <span className={`userMgmtBadge userMgmtBadge--${seleccionado.Es_Admin ? "admin" : "user"}`}>
                {seleccionado.Es_Admin ? "Admin" : "Usuario"}
              </span>
              <span className={`userMgmtBadge userMgmtBadge--${seleccionado.Esta_Activo ? "active" : "inactive"}`}>
                {seleccionado.Esta_Activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            <dl className="userMgmtDetailList">
              <div>
                <dt>Teléfono</dt>
                <dd>{seleccionado.Telefono || "—"}</dd>
              </div>
              <div>
                <dt>Fecha de registro</dt>
                <dd>{formatFecha(seleccionado.Fecha_Registro)}</dd>
              </div>
              <div>
                <dt>Última actualización</dt>
                <dd>{formatFecha(seleccionado.Ultima_Actualizacion)}</dd>
              </div>
              <div>
                <dt>ID interno</dt>
                <dd className="userMgmtDetailId">{seleccionado._id}</dd>
              </div>
            </dl>
          </aside>
        )}
      </div>
    </section>
  );
}
