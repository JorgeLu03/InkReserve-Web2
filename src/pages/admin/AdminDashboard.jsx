import { useState } from "react";
import "../Dashboard.css";
import "./AdminDashboard.css";
import Avatar from "../../components/Avatar";
import { TODAY_ISO, STATUS_LABELS, STATUS_COLORS } from "../../data/constants";

function getTodayDisplay() {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
const TODAY_DISPLAY = getTodayDisplay();

export default function AdminDashboard({ appointments, employees, nav }) {
  const [activeNav, setActiveNav] = useState(null);

  const todayAppts = appointments
    .filter((a) => a.date === TODAY_ISO)
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcomingAppts = appointments
    .filter((a) => a.date > TODAY_ISO)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);

  const thisMonth = TODAY_ISO.slice(0, 7);
  const monthAppts  = appointments.filter((a) => a.date.startsWith(thisMonth));
  const monthIncome = monthAppts.reduce((s, a) => s + a.total, 0);

  const clockedIn   = employees.filter((e) => e.clockedIn).length;
  const uniqueClients = new Set(appointments.map((a) => a.clientName)).size;

  const artistClientCounts = {};
  todayAppts.forEach((a) => {
    artistClientCounts[a.artistId] = (artistClientCounts[a.artistId] || 0) + 1;
  });

  function navTo(label, action) {
    setActiveNav(label);
    action();
  }

  return (
    <div className="dashScreen">
      <div className="dashBg" />

      {/* ── HEADER ── */}
      <header className="dashHeader">
        <button className="iconBtn" onClick={nav.toLogin} aria-label="Cerrar sesión" title="Cerrar sesión">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <polyline points="11,6 14,9 11,12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="14" y1="9" x2="7" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="dashTitle">
          <h1>Admin · InkReserve</h1>
          <span className="dashDate">{TODAY_DISPLAY}</span>
        </div>
        <div className="dashActions">
          <button className="iconBtn" onClick={nav.toCreate} aria-label="Nueva cita" title="Nueva cita">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="8" x2="14" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="userAvatarSmall" style={{ background: "#c084fc" }}>A</div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="dashMain">

        {/* LEFT SIDEBAR */}
        <aside className="dashLeft">
          <img src="/assets/logo.png" alt="InkReserve" className="dashLogo" />
          <p className="dashTagline">Panel de administración</p>

          <nav className="dashNav">
            <button
              className={`navItem ${activeNav === "Artistas" ? "navItemActive" : ""}`}
              onClick={() => navTo("Artistas", nav.toAdminEmployees)}
            >
              <img src="/assets/269275_user-icon.png" alt="" width="15" height="15" className="navIcon" />
              Artistas
            </button>
            <button
              className={`navItem ${activeNav === "Clientes" ? "navItemActive" : ""}`}
              onClick={() => navTo("Clientes", nav.toAdminClients)}
            >
              <img src="/assets/269275_user-icon.png" alt="" width="15" height="15" className="navIcon" />
              Clientes
            </button>
            <button
              className={`navItem ${activeNav === "Semana" ? "navItemActive" : ""}`}
              onClick={() => navTo("Semana", nav.toAdminWeek)}
            >
              <img src="/assets/269265_envelope-icon.png" alt="" width="15" height="15" className="navIcon" />
              Agenda Semanal
            </button>
            <button
              className={`navItem ${activeNav === "Mes" ? "navItemActive" : ""}`}
              onClick={() => navTo("Mes", nav.toAdminMonth)}
            >
              <img src="/assets/269265_envelope-icon.png" alt="" width="15" height="15" className="navIcon" />
              Agenda Mensual
            </button>
          </nav>
        </aside>

        {/* CONTENT */}
        <section className="dashContent">

          {/* ── STATS ROW (always visible for admin) ── */}
          <div className="adminStatsRow">
            <div className="statCard">
              <span className="statLabel">Citas hoy</span>
              <span className="statValue">{todayAppts.length}</span>
              <span className="statSub">de {monthAppts.length} este mes</span>
            </div>
            <div className="statCard statCardHighlight">
              <span className="statLabel">Ingresos del mes</span>
              <span className="statValue">${monthIncome.toLocaleString()}</span>
              <span className="statSub">MXN estimados</span>
            </div>
            <div className="statCard">
              <span className="statLabel">Artistas fichados</span>
              <span className="statValue">{clockedIn}<span style={{ fontSize: "1rem", color: "rgba(27,27,30,.4)" }}>/{employees.length}</span></span>
              <span className="statSub">activos hoy</span>
            </div>
            <div className="statCard">
              <span className="statLabel">Clientes únicos</span>
              <span className="statValue">{uniqueClients}</span>
              <span className="statSub">en el sistema</span>
            </div>
          </div>

          {/* ── TOP ROW: Citas hoy + Próximas ── */}
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
                  {todayAppts.map((appt) => (
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
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button className="addApptBtn" onClick={nav.toCreate}>+ Nueva cita</button>
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
                              strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ── EMPLOYEE STATUS ROW ── */}
          <div className="dashCard artistsCard">
            <div className="cardTitleRow">
              <h2 className="cardTitle">Estado de artistas</h2>
              <button className="cardLinkBtn" onClick={nav.toAdminEmployees}>Ver todos →</button>
            </div>
            <ul className="artistList">
              {employees.map((emp) => (
                <li key={emp.id} className="artistItem">
                  <div style={{ flexShrink: 0 }}>
                    {emp.photo
                      ? <img src={emp.photo} alt={emp.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                      : <Avatar initials={emp.initials} color={emp.color} size={40} />
                    }
                  </div>
                  <div className="artistInfo">
                    <span className="artistName">{emp.name}</span>
                    <span className="artistClients">
                      {artistClientCounts[emp.artistId] || 0} cita{(artistClientCounts[emp.artistId] || 0) !== 1 ? "s" : ""} hoy
                    </span>
                  </div>
                  <div className={`clockBadge ${emp.clockedIn ? "clockedIn" : "clockedOut"}`}>
                    <svg width="8" height="8" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4" fill="currentColor"/>
                    </svg>
                    {emp.clockedIn ? "Fichado" : "Sin fichar"}
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </section>
      </main>
    </div>
  );
}
