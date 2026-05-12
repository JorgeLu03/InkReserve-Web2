import { useState } from "react";
import "./GestionUsuarios.css";

const MOCK_USERS = [
  { id: 1, nombre: "Diego Ramírez",    correo: "diego@inkreserve.mx",   rol: "admin",  activo: true,  telefono: "55 1234 5678", fechaReg: "2024-01-10" },
  { id: 2, nombre: "Sofía Torres",     correo: "sofia@inkreserve.mx",   rol: "staff",  activo: true,  telefono: "55 2345 6789", fechaReg: "2024-02-15" },
  { id: 3, nombre: "Luis Herrera",     correo: "luis@inkreserve.mx",    rol: "staff",  activo: true,  telefono: "55 3456 7890", fechaReg: "2024-03-08" },
  { id: 4, nombre: "Mariana López",    correo: "mariana@gmail.com",     rol: "user",   activo: true,  telefono: "55 4567 8901", fechaReg: "2024-04-01" },
  { id: 5, nombre: "Carlos Hernández", correo: "carlosh@gmail.com",     rol: "user",   activo: true,  telefono: "55 5678 9012", fechaReg: "2024-04-22" },
  { id: 6, nombre: "Valeria Ruiz",     correo: "valeria@gmail.com",     rol: "user",   activo: false, telefono: "55 6789 0123", fechaReg: "2024-05-03" },
  { id: 7, nombre: "José Ramírez",     correo: "jose.r@gmail.com",      rol: "user",   activo: true,  telefono: "55 7890 1234", fechaReg: "2024-05-18" },
  { id: 8, nombre: "Ana Castillo",     correo: "ana.c@inkreserve.mx",   rol: "staff",  activo: false, telefono: "55 8901 2345", fechaReg: "2024-06-07" },
];

const ROL_LABELS  = { admin: "Admin", staff: "Staff", user: "Usuario" };
const ROL_COLORS  = { admin: "rolAdmin", staff: "rolStaff", user: "rolUser" };
const FILTER_OPTS = ["Todos", "Admin", "Staff", "Usuario"];

function getInitials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#d6762a", "#7c3aed", "#0ea5e9", "#16a34a", "#e85d04", "#6366f1", "#0891b2", "#b45309"];

export default function GestionUsuarios() {
  const [users, setUsers]       = useState(MOCK_USERS);
  const [filter, setFilter]     = useState("Todos");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [editRol, setEditRol]   = useState(null);

  function toggleActivo(id) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, activo: !u.activo } : u));
    if (selected?.id === id) setSelected((s) => ({ ...s, activo: !s.activo }));
  }

  function changeRol(id, rol) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, rol } : u));
    if (selected?.id === id) setSelected((s) => ({ ...s, rol }));
    setEditRol(null);
  }

  const filtered = users.filter((u) => {
    const matchFilter =
      filter === "Todos" ||
      (filter === "Admin"   && u.rol === "admin") ||
      (filter === "Staff"   && u.rol === "staff") ||
      (filter === "Usuario" && u.rol === "user");
    const matchSearch =
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.correo.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    total:   users.length,
    admin:   users.filter((u) => u.rol === "admin").length,
    staff:   users.filter((u) => u.rol === "staff").length,
    activos: users.filter((u) => u.activo).length,
  };

  return (
    <div className="ugView">

      {/* ── HEADER STATS ── */}
      <div className="ugStatsRow">
        <div className="ugStat">
          <span className="ugStatVal">{counts.total}</span>
          <span className="ugStatLabel">Total usuarios</span>
        </div>
        <div className="ugStat">
          <span className="ugStatVal ugStatOrange">{counts.admin}</span>
          <span className="ugStatLabel">Administradores</span>
        </div>
        <div className="ugStat">
          <span className="ugStatVal ugStatBlue">{counts.staff}</span>
          <span className="ugStatLabel">Staff</span>
        </div>
        <div className="ugStat">
          <span className="ugStatVal ugStatGreen">{counts.activos}</span>
          <span className="ugStatLabel">Activos</span>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="ugToolbar">
        <input
          className="ugSearch"
          type="text"
          placeholder="Buscar por nombre o correo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ugFilterGroup">
          {FILTER_OPTS.map((f) => (
            <button
              key={f}
              className={`ugFilterBtn ${filter === f ? "ugFilterBtnOn" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className={`ugLayout ${selected ? "ugLayoutSplit" : ""}`}>

        {/* ── USER TABLE ── */}
        <div className="ugTableCard">
          <div className="ugTableHead">
            <span>Usuario</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {filtered.length === 0 && (
            <p className="ugEmpty">No se encontraron usuarios con ese criterio.</p>
          )}

          {filtered.map((u, idx) => (
            <div
              key={u.id}
              className={`ugTableRow ${selected?.id === u.id ? "ugTableRowActive" : ""}`}
              onClick={() => setSelected(u)}
            >
              <div className="ugUserCell">
                <div
                  className="ugAvatar"
                  style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                >
                  {getInitials(u.nombre)}
                </div>
                <div className="ugUserInfo">
                  <strong className="ugUserName">{u.nombre}</strong>
                  <span className="ugUserEmail">{u.correo}</span>
                </div>
              </div>

              <span className={`ugRolBadge ${ROL_COLORS[u.rol]}`}>
                {ROL_LABELS[u.rol]}
              </span>

              <span className={`ugStatusDot ${u.activo ? "ugDotOn" : "ugDotOff"}`}>
                <span className="ugDotCircle" />
                {u.activo ? "Activo" : "Inactivo"}
              </span>

              <div className="ugRowActions" onClick={(e) => e.stopPropagation()}>
                <button
                  className={`ugToggleBtn ${u.activo ? "ugToggleOff" : "ugToggleOn"}`}
                  onClick={() => toggleActivo(u.id)}
                  title={u.activo ? "Desactivar" : "Activar"}
                >
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── USER DETAIL PANEL ── */}
        {selected && (
          <div className="ugDetailCard">
            <div className="ugDetailHeader">
              <div
                className="ugDetailAvatar"
                style={{ background: AVATAR_COLORS[users.findIndex((u) => u.id === selected.id) % AVATAR_COLORS.length] }}
              >
                {getInitials(selected.nombre)}
              </div>
              <button className="ugDetailClose" onClick={() => setSelected(null)} aria-label="Cerrar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <strong className="ugDetailName">{selected.nombre}</strong>
            <span className="ugDetailEmail">{selected.correo}</span>

            <div className="ugDetailFields">
              <div className="ugDetailField">
                <span className="ugDetailFieldLabel">Teléfono</span>
                <span className="ugDetailFieldVal">{selected.telefono}</span>
              </div>
              <div className="ugDetailField">
                <span className="ugDetailFieldLabel">Fecha de registro</span>
                <span className="ugDetailFieldVal">{selected.fechaReg}</span>
              </div>
              <div className="ugDetailField">
                <span className="ugDetailFieldLabel">Estado</span>
                <span className={`ugStatusDot ${selected.activo ? "ugDotOn" : "ugDotOff"}`}>
                  <span className="ugDotCircle" />
                  {selected.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="ugDetailField">
                <span className="ugDetailFieldLabel">Rol</span>
                {editRol === selected.id ? (
                  <div className="ugRolSelect">
                    {["admin", "staff", "user"].map((r) => (
                      <button
                        key={r}
                        className={`ugRolOption ${selected.rol === r ? "ugRolOptionOn" : ""}`}
                        onClick={() => changeRol(selected.id, r)}
                      >
                        {ROL_LABELS[r]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="ugRolRow">
                    <span className={`ugRolBadge ${ROL_COLORS[selected.rol]}`}>
                      {ROL_LABELS[selected.rol]}
                    </span>
                    <button className="ugEditRolBtn" onClick={() => setEditRol(selected.id)}>
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="ugDetailActions">
              <button
                className={`ugDetailToggle ${selected.activo ? "ugDetailToggleOff" : "ugDetailToggleOn"}`}
                onClick={() => toggleActivo(selected.id)}
              >
                {selected.activo ? "Desactivar cuenta" : "Activar cuenta"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
