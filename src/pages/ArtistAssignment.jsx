import { useState } from "react";
import "./ArtistAssignment.css";
import Avatar from "../components/Avatar";
import { STATUS_LABELS, STATUS_COLORS } from "../data/constants";

function matchScore(employee, style) {
  if (!style) return 0;
  if (employee.specializations.includes(style)) return 2;
  if (employee.specializations.some(
    (s) => s.toLowerCase().includes(style.toLowerCase()) ||
            style.toLowerCase().includes(s.toLowerCase())
  )) return 1;
  return 0;
}

export default function ArtistAssignment({ appointments, employees, onUpdate }) {
  const [selectedId, setSelectedId] = useState(null);

  const selected = appointments.find((a) => a.id === selectedId) ?? null;

  function getEmployee(artistId) {
    return employees.find((e) => e.artistId === artistId) ?? null;
  }

  function handleAssign(emp) {
    if (!selected) return;
    onUpdate(selected.id, { artistId: emp.artistId });
  }

  const sortedEmployees = selected
    ? [...employees].sort((a, b) => {
        const diff = matchScore(b, selected.style) - matchScore(a, selected.style);
        if (diff !== 0) return diff;
        if (a.clockedIn !== b.clockedIn) return b.clockedIn ? 1 : -1;
        return 0;
      })
    : employees;

  return (
    <div className="assignWrap">

      {/* ── LEFT: Appointment list ── */}
      <aside className="assignLeft">
        <p className="assignPanelHint">Selecciona una cita para ver artistas compatibles</p>
        <div className="assignApptList">
          {appointments.map((appt) => {
            const emp = getEmployee(appt.artistId);
            const active = appt.id === selectedId;
            const [, mm, dd] = appt.date.split("-");
            return (
              <button
                key={appt.id}
                className={`assignApptCard ${active ? "assignApptCardActive" : ""}`}
                onClick={() => setSelectedId(active ? null : appt.id)}
              >
                <div className="assignApptDate">
                  <span className="assignDay">{dd}</span>
                  <span className="assignMon">/{mm}</span>
                </div>
                <div className="assignApptInfo">
                  <span className="assignApptClient">{appt.clientName}</span>
                  <span className="assignApptMeta">{appt.time} · {appt.style}</span>
                  {emp && (
                    <span className="assignApptArtist">
                      <span className="assignDot" style={{ background: emp.color }} />
                      {emp.name}
                    </span>
                  )}
                </div>
                <span
                  className="assignApptStatusDot"
                  style={{ background: STATUS_COLORS[appt.status] }}
                  title={STATUS_LABELS[appt.status]}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── RIGHT: Artist cards ── */}
      <section className="assignRight">
        <h3 className="assignRightTitle">
          {selected
            ? <>Artistas disponibles para <em>{selected.style}</em></>
            : "Artistas del estudio"}
        </h3>

        {selected && (
          <div className="assignClientBanner">
            <span className="assignClientLabel">Cliente seleccionado:</span>
            <strong>{selected.clientName}</strong>
            <span className="assignClientMeta">{selected.date} · {selected.time} · {selected.style}</span>
          </div>
        )}

        <div className="assignArtistGrid">
          {sortedEmployees.map((emp) => {
            const score = selected ? matchScore(emp, selected.style) : 0;
            const isAssigned = selected && selected.artistId === emp.artistId;

            return (
              <div
                key={emp.id}
                className={`assignArtistCard
                  ${score > 0 ? "assignArtistMatch" : ""}
                  ${isAssigned ? "assignArtistAssigned" : ""}
                `}
              >
                {score > 0 && !isAssigned && (
                  <div className="assignMatchRibbon">Recomendado</div>
                )}
                {isAssigned && (
                  <div className="assignedRibbon">Asignado</div>
                )}

                <div className="assignArtistTop">
                  <Avatar initials={emp.initials} color={emp.color} size={44} />
                  <div className="assignArtistMeta">
                    <span className="assignArtistName">{emp.name}</span>
                    <span className={`assignClock ${emp.clockedIn ? "on" : "off"}`}>
                      <svg width="7" height="7" viewBox="0 0 7 7">
                        <circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" />
                      </svg>
                      {emp.clockedIn ? "Fichado" : "Sin fichar"}
                    </span>
                  </div>
                </div>

                <div className="assignSpecsRow">
                  {emp.specializations.map((s) => (
                    <span
                      key={s}
                      className={`assignSpecChip ${selected && s === selected.style ? "assignSpecChipMatch" : ""}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {selected && !isAssigned && (
                  <button className="assignBtn" onClick={() => handleAssign(emp)}>
                    Asignar a {selected.clientName}
                  </button>
                )}
                {isAssigned && (
                  <div className="assignedConfirm">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="6" stroke="#16a34a" strokeWidth="1.2"/>
                      <polyline points="3.5,6.5 5.5,8.5 9.5,4.5" stroke="#16a34a" strokeWidth="1.4"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Asignado a esta cita
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
