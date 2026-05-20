import { useState } from "react";
import Avatar from "../../components/Avatar";
import "./AdminShell.css";

export default function EmployeeList({ employees, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.specializations.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="empListTop">
        <input
          className="empSearch"
          placeholder="Buscar por nombre o especialización…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="empCount">{filtered.length} artista{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,.6)", textAlign: "center", marginTop: "3rem" }}>
          Sin resultados para "{search}".
        </p>
      ) : (
        <div className="empGrid">
          {filtered.map((emp) => (
            <button key={emp.id} className="empCard" onClick={() => onSelect(emp)}>
              <div className="empCardPhoto">
                {emp.photo
                  ? <img src={emp.photo} alt={emp.name} />
                  : <Avatar initials={emp.initials} color={emp.color} size={76} />
                }
              </div>
              <span className="empCardName">{emp.name}</span>
              <span className="empCardId">{emp.id}</span>
              <div className="empCardSpecs">
                {emp.specializations.slice(0, 2).map((s) => (
                  <span key={s} className="specChipSm">{s}</span>
                ))}
                {emp.specializations.length > 2 && (
                  <span className="specChipSm">+{emp.specializations.length - 2}</span>
                )}
              </div>
              <div className={`clockDot ${emp.clockedIn ? "on" : "off"}`}>
                <svg width="7" height="7" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="4" fill="currentColor" />
                </svg>
                {emp.clockedIn ? "Fichado" : "Sin fichar"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
