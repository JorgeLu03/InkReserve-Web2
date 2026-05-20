import "./AppointmentConfirmation.css";
import Avatar from "../components/Avatar";

const MONTH_NAMES_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} ${MONTH_NAMES_SHORT[parseInt(m) - 1]} ${y}`;
}

export default function AppointmentConfirmation({ appointment, employees = [], onViewCalendar, onNewAppointment }) {
  const artist = employees.find(
    (a) => String(a._id) === String(appointment.artistId) || String(a.artistId) === String(appointment.artistId)
  );

  return (
    <div className="confScreen">
      <div className="confBg" />

      {/* ── HEADER ── */}
      <header className="confHeader">
        <div style={{ width: 36 }} />
        <h1 className="confHeaderTitle">Cita registrada</h1>
        <div style={{ width: 36 }} />
      </header>

      {/* ── CONTENT ── */}
      <main className="confMain">
        <div className="confCard">

          {/* Success badge */}
          <div className="confBadge">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" fill="rgba(74,222,128,.15)" stroke="#22c55e" strokeWidth="1.5"/>
              <polyline points="10,18 15.5,23.5 26,12" stroke="#22c55e" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="confBadgeText">
              <span className="confBadgeTitle">¡Cita confirmada!</span>
              <span className="confBadgeSub">La cita ha sido registrada en el sistema</span>
            </div>
          </div>

          {/* Divider */}
          <div className="confDivider" />

          {/* Client + Artist row */}
          <div className="confParties">
            <div className="confParty">
              <div className="confPartyAvatar" style={{ background: appointment.clientColor }}>
                {appointment.clientInitials}
              </div>
              <div className="confPartyInfo">
                <span className="confPartyRole">Cliente</span>
                <span className="confPartyName">{appointment.clientName}</span>
              </div>
            </div>

            <div className="confArrow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="#d6762a" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="confParty">
              {artist
                ? <Avatar initials={artist.initials} color={artist.color} size={42} />
                : <div className="confPartyAvatar" style={{ background: "#ccc" }}>?</div>
              }
              <div className="confPartyInfo">
                <span className="confPartyRole">Artista</span>
                <span className="confPartyName">{artist?.name ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="confGrid">
            <div className="confItem">
              <span className="confItemLabel">Fecha</span>
              <span className="confItemValue">{formatDate(appointment.date)}</span>
            </div>
            <div className="confItem">
              <span className="confItemLabel">Hora</span>
              <span className="confItemValue">{appointment.time}</span>
            </div>
            <div className="confItem">
              <span className="confItemLabel">Duración</span>
              <span className="confItemValue">{appointment.hours}h</span>
            </div>
            <div className="confItem">
              <span className="confItemLabel">Estilo</span>
              <span className="confItemValue">{appointment.style}</span>
            </div>
            <div className="confItem">
              <span className="confItemLabel">Dimensiones</span>
              <span className="confItemValue">{appointment.dimensions}</span>
            </div>
            <div className="confItem confItemHighlight">
              <span className="confItemLabel">Total</span>
              <span className="confItemValue">${Number(appointment.total).toLocaleString()} MXN</span>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="confNotes">
              <span className="confNotesLabel">Notas</span>
              <p className="confNotesText">{appointment.notes}</p>
            </div>
          )}

          {/* Reference images */}
          {appointment.refImages?.length > 0 && (
            <div className="confImages">
              <span className="confImagesLabel">Referencias adjuntas ({appointment.refImages.length})</span>
              <div className="confImageRow">
                {appointment.refImages.map((img, i) => (
                  <div key={i} className="confImageThumb">
                    <img src={img.url} alt={img.name} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status chip */}
          <div className="confStatusRow">
            <span className="confStatusChip">
              <svg width="7" height="7" viewBox="0 0 7 7">
                <circle cx="3.5" cy="3.5" r="3.5" fill="#facc15"/>
              </svg>
              Estado: Pendiente de confirmación
            </span>
          </div>

          {/* Actions */}
          <div className="confActions">
            <button className="confSecondaryBtn" onClick={onNewAppointment}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Nueva cita
            </button>
            <button className="confPrimaryBtn" onClick={onViewCalendar}>
              Ver en calendario
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polyline points="5,2 9,7 5,12" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
