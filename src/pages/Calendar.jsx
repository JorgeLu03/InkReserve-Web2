import { useState } from "react";
import "./Calendar.css";
import "./Dashboard.css";
import "./admin/AdminShell.css";
import Avatar from "../components/Avatar";
import { STATUS_COLORS, STATUS_LABELS } from "../data/mockData";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function getCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr });
  }
  return cells;
}

export default function Calendar({ appointments, employees = [], nav }) {
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selected, setSelected] = useState(new Date().toISOString().slice(0, 10));
  const [activeNav, setActiveNav] = useState("Calendario");
  const [profileOpen, setProfileOpen] = useState(false);

  const userNombre = localStorage.getItem("nombre") || "Usuario";
  const userCorreo = localStorage.getItem("correo") || "";
  const userInitials = userNombre.trim().split(" ").filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join("");

  // Artistas con citas este mes
  const thisMonth = `${year}-${String(month + 1).padStart(2, "0")}`;
  const artistsThisMonth = employees.filter(emp =>
    appointments.some(a => a.date.startsWith(thisMonth) && a.artistId === emp.artistId)
  );

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const cells = getCalendarCells(year, month);

  const apptsByDate = {};
  appointments.forEach((a) => {
    if (!apptsByDate[a.date]) apptsByDate[a.date] = [];
    apptsByDate[a.date].push(a);
  });

  const selectedAppts = (apptsByDate[selected] || [])
    .sort((a, b) => a.time.localeCompare(b.time));

  const [dd, mm, yyyy] = selected
    ? [selected.slice(8), selected.slice(5, 7), selected.slice(0, 4)]
    : ["—", "—", ""];

  return (
    <div className="dashScreen">
      <div className="dashBg" />

      {/* HEADER */}
      <header className="dashHeader">
        <button className="iconBtn" onClick={nav.goBack} aria-label="Volver">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
            <polyline points="10.5,5.5 6.5,9 10.5,12.5" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="dashTitle">
          <h1>Calendario de Citas</h1>
          <span className="dashDate">{new Date().toLocaleDateString("es-MX", { day: "numeric", month: "numeric", year: "numeric" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button className="iconBtn" onClick={nav.toCreate} aria-label="Nueva cita" title="Nueva cita">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="8" x2="14" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button className="adminProfileBtn" onClick={() => setProfileOpen(true)} aria-label="Ver perfil">
            <span className="adminProfileInitials">{userInitials}</span>
          </button>
        </div>
      </header>

      {/* PROFILE MODAL */}
      {profileOpen && (
        <div className="profileOverlay" onClick={() => setProfileOpen(false)}>
          <div className="profileModal" onClick={e => e.stopPropagation()}>
            <button className="profileModalClose" onClick={() => setProfileOpen(false)} aria-label="Cerrar">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="profileModalAvatar">{userInitials}</div>
            <h3 className="profileModalName">{userNombre}</h3>
            <p className="profileModalEmail">{userCorreo}</p>
            <div className="profileModalBadge" style={{ background: "rgba(251,146,60,0.12)", color: "#ea580c", border: "1px solid rgba(251,146,60,0.25)" }}>Usuario</div>
            <div className="profileModalInfo">
              <div className="profileModalRow">
                <span className="profileModalLabel">Rol</span>
                <span className="profileModalValue">Usuario</span>
              </div>
              <div className="profileModalRow">
                <span className="profileModalLabel">Correo</span>
                <span className="profileModalValue">{userCorreo || "—"}</span>
              </div>
              <div className="profileModalRow">
                <span className="profileModalLabel">Estado</span>
                <span className="profileModalValue profileModalActive">● Activo</span>
              </div>
            </div>
            <button className="profileModalLogout" onClick={nav.toLogin}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="dashMain">

        {/* SIDEBAR */}
        <aside className="dashLeft">
          <img src="/assets/Logo.png" alt="InkReserve" className="dashLogo" />
          <p className="dashTagline">Reserva, agenda y gestiona tus citas con estilo.</p>
          <nav className="dashNav">
            <button
              className={`navItem ${activeNav === "Calendario" ? "navItemActive" : ""}`}
              onClick={() => setActiveNav("Calendario")}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="2" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <line x1="1" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.3"/>
                <line x1="5" y1="1" x2="5" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Calendario
            </button>
            <button
              className={`navItem ${activeNav === "Dashboard" ? "navItemActive" : ""}`}
              onClick={() => { setActiveNav("Dashboard"); nav.toDashboard(); }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="8" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1" y="8" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="8" y="8" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              Dashboard
            </button>
            <button
              className="navItem"
              onClick={nav.toCreate}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                <line x1="7.5" y1="4.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="4.5" y1="7.5" x2="10.5" y2="7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Nueva cita
            </button>
          </nav>

          {/* Artistas con citas este mes */}
          {artistsThisMonth.length > 0 && (
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(214,118,42,0.15)" }}>
              <p style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "#a85a23", fontWeight: 700, margin: "0 0 0.75rem" }}>
                Artistas este mes
              </p>
              {artistsThisMonth.map(emp => (
                <div key={emp._id || emp.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                  <Avatar initials={emp.initials} color={emp.color} size={30} />
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1b1b1e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {emp.name.split(" ")[0]}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: emp.clockedIn ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
                      {emp.clockedIn ? "● Fichado" : "● Sin fichar"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* CALENDAR CONTENT */}
        <section className="dashContent">
          <div className="calMain" style={{ padding: 0 }}>

            {/* CALENDAR GRID */}
            <div className="calGridSection">
              <div className="calMonthNav">
                <button className="calNavBtn" onClick={prevMonth} aria-label="Mes anterior">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <polyline points="9,2 5,7 9,12" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="calMonthLabel">{MONTH_NAMES[month]} {year}</span>
                <button className="calNavBtn" onClick={nextMonth} aria-label="Mes siguiente">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <polyline points="5,2 9,7 5,12" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="calWeekdays">
                {WEEKDAYS.map((w) => <span key={w} className="calWeekday">{w}</span>)}
              </div>

              <div className="calGrid">
                {cells.map((cell, i) => {
                  if (!cell) return <div key={`empty-${i}`} className="calCell calCellEmpty" />;
                  const isToday    = cell.dateStr === TODAY_ISO;
                  const isSelected = cell.dateStr === selected;
                  const dayAppts   = apptsByDate[cell.dateStr] || [];
                  return (
                    <button
                      key={cell.dateStr}
                      className={`calCell ${isToday ? "calCellToday" : ""} ${isSelected ? "calCellSelected" : ""}`}
                      onClick={() => setSelected(cell.dateStr)}
                    >
                      <span className="calDayNum">{cell.day}</span>
                      {dayAppts.length > 0 && (
                        <div className="calDots">
                          {dayAppts.slice(0, 3).map((a) => (
                            <span key={a.id} className="calDot" style={{ background: STATUS_COLORS[a.status] }} />
                          ))}
                          {dayAppts.length > 3 && <span className="calDotMore">+{dayAppts.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="calLegend">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <span key={key} className="calLegendItem">
                    <span className="calLegendDot" style={{ background: STATUS_COLORS[key] }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* DAY PANEL */}
            <div className="calDayPanel">
              <div className="calDayHeader">
                <h2 className="calDayTitle">
                  {selected ? `${dd}/${mm}/${yyyy}` : "Selecciona un día"}
                </h2>
                <span className="calDayCount">
                  {selectedAppts.length} cita{selectedAppts.length !== 1 ? "s" : ""}
                </span>
              </div>

              {selectedAppts.length === 0 ? (
                <div className="calDayEmpty">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="rgba(27,27,30,.2)" strokeWidth="1.5" />
                    <line x1="14" y1="20" x2="26" y2="20" stroke="rgba(27,27,30,.2)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p>Sin citas este día</p>
                  <button className="primarySmallBtn" onClick={nav.toCreate}>+ Agregar cita</button>
                </div>
              ) : (
                <ul className="calApptList">
                  {selectedAppts.map((appt) => {
                    const artist = employees.find((a) => a.artistId === appt.artistId);
                    return (
                      <li key={appt.id}>
                        <button type="button" className="calApptItem" onClick={() => nav.toDetail(appt.id)}>
                          <div className="calApptTime">{appt.time}</div>
                          <Avatar initials={appt.clientInitials} color={appt.clientColor} size={36} />
                          <div className="calApptInfo">
                            <span className="calApptName">{appt.clientName}</span>
                            <span className="calApptMeta">
                              {appt.style} · {appt.hours}h · {artist?.name ?? "—"}
                            </span>
                          </div>
                          <span
                            className="calApptStatus"
                            style={{ color: STATUS_COLORS[appt.status], borderColor: STATUS_COLORS[appt.status] }}
                          >
                            {STATUS_LABELS[appt.status]}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
