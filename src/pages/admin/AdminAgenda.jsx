import { useState, Fragment } from "react";
import { TODAY_ISO } from "../../data/mockData";
import "./AdminShell.css";

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_SHORT   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const HOURS       = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

function getWeekStart(iso) {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function AdminAgenda({ appointments, employees: _employees, mode: initMode }) {
  const [mode, setMode]   = useState(initMode ?? "week");
  const [refDate, setRef] = useState(TODAY_ISO);

  function shiftWeek(n)  { const d = new Date(refDate); d.setDate(d.getDate() + n * 7); setRef(isoDate(d)); }
  function shiftMonth(n) { const d = new Date(refDate); d.setMonth(d.getMonth() + n);   setRef(isoDate(d)); }

  return (
    <div>
      <div className="agendaHeader">
        <div className="agendaNav">
          <button className="agendaNavBtn" onClick={() => mode === "week" ? shiftWeek(-1) : shiftMonth(-1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="9,3 5,7 9,11" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="agendaRange">
            {mode === "week" ? weekRangeLabel(refDate) : monthRangeLabel(refDate)}
          </span>
          <button className="agendaNavBtn" onClick={() => mode === "week" ? shiftWeek(1) : shiftMonth(1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="5,3 9,7 5,11" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="agendaModeSwitch">
          <button className={`agendaModeBtn ${mode === "week" ? "agendaModeBtnOn" : ""}`} onClick={() => setMode("week")}>Semana</button>
          <button className={`agendaModeBtn ${mode === "month" ? "agendaModeBtnOn" : ""}`} onClick={() => setMode("month")}>Mes</button>
        </div>
      </div>

      {mode === "week"  && <WeekView  refDate={refDate} appointments={appointments} />}
      {mode === "month" && <MonthView refDate={refDate} appointments={appointments} />}
    </div>
  );
}

function weekRangeLabel(refDate) {
  const ws = getWeekStart(refDate);
  const we = new Date(ws); we.setDate(we.getDate() + 6);
  const fmt = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)}`;
  return `${fmt(ws)} – ${fmt(we)} ${we.getFullYear()}`;
}

function monthRangeLabel(refDate) {
  const d = new Date(refDate);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function WeekView({ refDate, appointments }) {
  const ws = getWeekStart(refDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws); d.setDate(d.getDate() + i);
    return { iso: isoDate(d), d };
  });

  const apptByDayHour = {};
  appointments.forEach((a) => {
    const key = `${a.date}__${a.time}`;
    if (!apptByDayHour[key]) apptByDayHour[key] = [];
    apptByDayHour[key].push(a);
  });

  return (
    <div className="weekScroll">
      <div className="weekTable">
        <div className="weekCorner" />
        {days.map(({ iso, d }) => (
          <div key={iso} className="weekDayHdr">
            <div className="weekDayHdrName">{DAY_SHORT[d.getDay()]}</div>
            <div className={`weekDayHdrNum ${iso === TODAY_ISO ? "wToday" : ""}`}>{d.getDate()}</div>
          </div>
        ))}
        {HOURS.map((h) => (
          <Fragment key={h}>
            <div className="wTimeCell">{h}</div>
            {days.map(({ iso }) => {
              const appts = apptByDayHour[`${iso}__${h}`] ?? [];
              return (
                <div key={`${iso}_${h}`} className="wCell">
                  {appts.map((a) => (
                    <div key={a.id} className="wAppt" title={`${a.clientName} · ${a.style}`}>
                      {a.clientName} · {a.style}
                    </div>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function MonthView({ refDate, appointments }) {
  const d   = new Date(refDate);
  const yr  = d.getFullYear();
  const mo  = d.getMonth();

  const firstDay = new Date(yr, mo, 1);
  const lastDay  = new Date(yr, mo + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const cells    = [];

  for (let i = 0; i < startPad; i++) {
    const prev = new Date(yr, mo, -startPad + i + 1);
    cells.push({ iso: isoDate(prev), num: prev.getDate(), other: true });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    cells.push({ iso: `${String(yr)}-${String(mo+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`, num: i, other: false });
  }
  while (cells.length % 7 !== 0) {
    const next = new Date(yr, mo + 1, cells.length - (startPad + lastDay.getDate()) + 1);
    cells.push({ iso: isoDate(next), num: next.getDate(), other: true });
  }

  const apptByDay = {};
  appointments.forEach((a) => {
    if (!apptByDay[a.date]) apptByDay[a.date] = [];
    apptByDay[a.date].push(a);
  });

  return (
    <div className="monthTable">
      {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
        <div key={d} className="monthHdr">{d}</div>
      ))}
      {cells.map((cell, i) => (
        <div
          key={i}
          className={`mCell ${cell.other ? "mOther" : ""} ${cell.iso === TODAY_ISO ? "mToday" : ""}`}
        >
          <div className={`mNum ${cell.iso === TODAY_ISO ? "mTodayNum" : ""}`}>{cell.num}</div>
          {(apptByDay[cell.iso] ?? []).map((a) => (
            <div key={a.id} className="mAppt" title={`${a.clientName} · ${a.time}`}>
              {a.time} {a.clientName}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
