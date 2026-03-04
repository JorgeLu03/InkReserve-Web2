import { useState } from "react";
import "./Calendar.css";
import Avatar from "../components/Avatar";
import { ARTISTS, STATUS_COLORS, STATUS_LABELS } from "../data/mockData";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const TODAY_ISO = "2026-03-03";

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

export default function Calendar({ appointments, nav }) {
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(2);
  const [selected, setSelected] = useState(TODAY_ISO);

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
    <div className="pageScreen">
      <div className="pageBg" />

      {/* HEADER */}
      <header className="pageHeader">
        <button className="iconBtn" onClick={nav.goBack} aria-label="Volver">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
            <polyline points="10.5,5.5 6.5,9 10.5,12.5" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="pageTitle">Calendario de Citas</h1>
        <button className="primarySmallBtn" onClick={nav.toCreate}>+ Nueva cita</button>
      </header>

      {/* MAIN */}
      <main className="calMain">

        {/* CALENDAR GRID */}
        <div className="calGridSection">
          {/* Month Nav */}
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

          {/* Weekday headers */}
          <div className="calWeekdays">
            {WEEKDAYS.map((w) => <span key={w} className="calWeekday">{w}</span>)}
          </div>

          {/* Day cells */}
          <div className="calGrid">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} className="calCell calCellEmpty" />;
              const isToday   = cell.dateStr === TODAY_ISO;
              const isSelected = cell.dateStr === selected;
              const dayAppts  = apptsByDate[cell.dateStr] || [];
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
                        <span
                          key={a.id}
                          className="calDot"
                          style={{ background: STATUS_COLORS[a.status] }}
                        />
                      ))}
                      {dayAppts.length > 3 && <span className="calDotMore">+{dayAppts.length - 3}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
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
                const artist = ARTISTS.find((a) => a.id === appt.artistId);
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
      </main>
    </div>
  );
}
