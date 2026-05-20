import { useState } from "react";
import "./Dashboard.css";
import "./admin/AdminShell.css";
import Avatar from "../components/Avatar";
import ArtistAssignment from "./ArtistAssignment";
import { TODAY_ISO, STATUS_LABELS, STATUS_COLORS } from "../data/mockData";

function getTodayDisplay() {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
const TODAY_DISPLAY = getTodayDisplay();

const stats_def = [
  { key: "month",   label: "Citas este mes",    trend: "up"   },
  { key: "income",  label: "Ingresos estimados", trend: "down" },
  { key: "clients", label: "Clientes nuevos",    trend: "up"   },
];

function TrendArrow({ direction }) {
  return direction === "up" ? (
    <svg className="trend" width="28" height="16" viewBox="0 0 28 16" fill="none">
      <polyline points="2,14 10,4 18,10 26,2" stroke="#4ade80" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="trend" width="28" height="16" viewBox="0 0 28 16" fill="none">
      <polyline points="2,2 10,12 18,6 26,14" stroke="#f87171" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard({ appointments, employees, onUpdate, nav }) {
  const [activeNav, setActiveNav] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const userNombre = localStorage.getItem("nombre") || "Usuario";
  const userCorreo = localStorage.getItem("correo") || "";
  const userInitials = userNombre.trim().split(" ").filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join("");
  const todayAppts = appointments.filter((a) => a.date === TODAY_ISO)
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcomingAppts = appointments
    .filter((a) => a.date > TODAY_ISO)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);

  const thisMonth = TODAY_ISO.slice(0, 7);
  const monthAppts = appointments.filter((a) => a.date.startsWith(thisMonth));
  const monthIncome = monthAppts.reduce((s, a) => s + a.total, 0);

  const artistClientCounts = {};
  todayAppts.forEach((a) => {
    artistClientCounts[a.artistId] = (artistClientCounts[a.artistId] || 0) + 1;
  });

  const stats = [
    { ...stats_def[0], value: String(monthAppts.length) },
    { ...stats_def[1], value: `$${monthIncome.toLocaleString()}` },
    { ...stats_def[2], value: "1,140" },
  ];

  return (
    <div className="dashScreen">
      <div className="dashBg" />

      {/* ── HEADER ── */}
      <header className="dashHeader">
        <button
          className="iconBtn"
          onClick={() => {
            if (activeSection) {
              setActiveSection(null);
              setActiveNav(null);
            } else {
              nav.toLogin();
            }
          }}
          aria-label={activeSection ? "Volver al dashboard" : "Cerrar sesión"}
        >
          {activeSection ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
              <polyline points="10.5,5.5 6.5,9 10.5,12.5" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <polyline points="10,6 13,9 10,12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="13" y1="9" x2="6" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
        <div className="dashTitle">
          <h1>Dashboard InkReserve</h1>
          <span className="dashDate">{TODAY_DISPLAY}</span>
        </div>
        <div className="dashActions">
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

      {/* ── PROFILE MODAL ── */}
      {profileOpen && (
        <div className="profileOverlay" onClick={() => setProfileOpen(false)}>
          <div className="profileModal" onClick={e => e.stopPropagation()}>
            <button className="profileModalClose" onClick={() => setProfileOpen(false)} aria-label="Cerrar">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="profileModalAvatar" style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>{userInitials}</div>
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

      {/* ── MAIN ── */}
      <main className="dashMain">

        {/* LEFT */}
        <aside className="dashLeft">
          <img src="/assets/Logo.png" alt="InkReserve" className="dashLogo" />
          <p className="dashTagline">Reserva, agenda y gestiona tus citas con estilo.</p>
          <nav className="dashNav">
            <button
              className={`navItem ${activeNav === "Calendario" ? "navItemActive" : ""}`}
              onClick={() => { setActiveNav("Calendario"); nav.toCalendar(); }}
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
              className={`navItem ${activeNav === "Artistas" ? "navItemActive" : ""}`}
              onClick={() => {
                setActiveNav("Artistas");
                setActiveSection((s) => s === "artists" ? null : "artists");
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="5.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="11.5" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M13.5 13c0-2-1.3-3.2-2-3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              Artistas
            </button>
            <button
              className={`navItem ${activeNav === "Reportes" ? "navItemActive" : ""}`}
              onClick={() => setActiveNav((prev) => prev === "Reportes" ? null : "Reportes")}
            >
              <img src="/assets/269265_envelope-icon.png" alt="" width="15" height="15" className="navIcon" />
              Reportes
            </button>
          </nav>
        </aside>

        {/* CONTENT */}
        <section className="dashContent">

          {/* ── ARTIST ASSIGNMENT VIEW ── */}
          {activeSection === "artists" && (
            <ArtistAssignment
              appointments={appointments}
              employees={employees}
              onUpdate={onUpdate}
            />
          )}

          {/* ── NORMAL DASHBOARD CONTENT ── */}
          {activeSection !== "artists" && (
            <>
              {/* ROW 1 */}
              <div className="dashTopRow">

                {/* Citas de hoy */}
                <div className="dashCard">
                  <div className="cardTitleRow">
                    <h2 className="cardTitle">Citas de hoy</h2>
                    <button className="cardLinkBtn" onClick={nav.toCalendar}>Ver calendario →</button>
                  </div>
                  {todayAppts.length === 0 ? (
                    <p className="emptyMsg">Sin citas para hoy.</p>
                  ) : (
                    <ul className="appointmentList">
                      {todayAppts.map((appt) => {
                        const _artist = employees.find((a) => a.artistId === appt.artistId);
                        return (
                          <li key={appt.id}>
                            <button
                              className="appointmentItem appointmentBtn"
                              onClick={() => nav.toDetail(appt.id)}
                            >
                              <Avatar initials={appt.clientInitials} color={appt.clientColor} />
                              <div className="apptInfo">
                                <span className="apptName">{appt.clientName}</span>
                                <span className="apptService">{appt.time} · {appt.style}</span>
                              </div>
                              <span
                                className="apptStatusDot"
                                style={{ background: STATUS_COLORS[appt.status] }}
                                title={STATUS_LABELS[appt.status]}
                              />
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="apptChevron">
                                <polyline points="5,3 9,7 5,11" stroke="#d6762a" strokeWidth="1.8"
                                  strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button className="addApptBtn" onClick={nav.toCreate}>
                    + Nueva cita
                  </button>
                </div>

                {/* Próximas citas */}
                <div className="dashCard">
                  <div className="cardTitleRow">
                    <h2 className="cardTitle">Próximas citas</h2>
                    <button className="cardLinkBtn" onClick={nav.toCalendar}>Ver todas →</button>
                  </div>
                  {upcomingAppts.length === 0 ? (
                    <p className="emptyMsg">No hay citas próximas.</p>
                  ) : (
                    <ul className="upcomingList">
                      {upcomingAppts.map((appt) => {
                        const [, mm, dd] = appt.date.split("-");
                        return (
                          <li key={appt.id} className="upcomingItem">
                            <button className="upcomingBtn" onClick={() => nav.toDetail(appt.id)}>
                              <div className="upcomingDate">
                                <span className="upcomingDay">{dd}</span>
                                <span className="upcomingMonth">/{mm}</span>
                              </div>
                              <div className="upcomingInfo">
                                <span className="upcomingClient">{appt.clientName}</span>
                                <span className="upcomingMeta">{appt.time} · {appt.style}</span>
                              </div>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <polyline points="5,3 9,7 5,11" stroke="#d6762a" strokeWidth="1.8"
                                  strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* ROW 2 — Artists */}
              <div className="dashCard artistsCard">
                <h2 className="cardTitle">Artistas de hoy</h2>
                <ul className="artistList">
                  {employees.length === 0 ? (
                    <li style={{ color: "rgba(27,27,30,.45)", fontSize: "0.88rem", padding: "0.5rem 0" }}>
                      Sin artistas registrados.
                    </li>
                  ) : employees.map((a) => (
                    <li key={a._id || a.id} className="artistItem">
                      <Avatar initials={a.initials} color={a.color} size={40} />
                      <div className="artistInfo">
                        <span className="artistName">{a.name}</span>
                        <span className="artistClients">
                          {artistClientCounts[a.artistId] || 0} cliente{(artistClientCounts[a.artistId] || 0) !== 1 ? "s" : ""} hoy
                        </span>
                      </div>
                      <div className={`clockBadge ${a.clockedIn ? "clockedIn" : "clockedOut"}`}>
                        <svg width="8" height="8" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="4" fill="currentColor" />
                        </svg>
                        {a.clockedIn ? "Fichado" : "Sin fichar"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ROW 3 — Stats (only when Reportes is active) */}
              {activeNav === "Reportes" && (
                <div className="dashStatsRow">
                  {stats.map((s, i) => (
                    <div key={s.key} className={`statCard ${i === 1 ? "statCardHighlight" : ""}`}>
                      <span className="statLabel">{s.label}</span>
                      <span className="statValue">{s.value}</span>
                      <TrendArrow direction={s.trend} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </section>
      </main>
    </div>
  );
}
