import { useState, useEffect, useCallback } from "react";
import Avatar from "../../components/Avatar";
import { calcAge, formatDob } from "../../services/employeeService";
import "./AdminShell.css";

export default function EmployeeDetail({ employee: empProp, appointments, onUpdate: _onUpdate, onBack: _onBack }) {
  const [emp, setEmp] = useState(empProp);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { setEmp(empProp); }, [empProp]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const h = (e) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, closeLightbox]);

  if (!emp) return <p style={{ color: "#fff" }}>Artista no encontrado.</p>;

  const empAppts = appointments
    .filter((a) => a.artistId === emp.artistId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const age = calcAge(emp.dateOfBirth);

  return (
    <>
      <div className="empDetailLayout">

        {/* ── LEFT COLUMN ── */}
        <div className="empDetailLeft">

          <div className="empProfileCard">
            <div className="empProfilePhoto">
              {emp.photo
                ? <img src={emp.photo} alt={emp.name} />
                : <Avatar initials={emp.initials} color={emp.color} size={96} />
              }
            </div>
            <span className="empProfileName">{emp.name}</span>
            <span className="empProfileId">{emp.id}</span>
            <div className={`clockDot ${emp.clockedIn ? "on" : "off"}`} style={{ alignSelf: "center" }}>
              <svg width="7" height="7" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="currentColor" />
              </svg>
              {emp.clockedIn ? "Fichado hoy" : "Sin fichar"}
            </div>
            <div className="empSpecsWrap">
              {emp.specializations.map((s) => (
                <span key={s} className="specChipDetail">{s}</span>
              ))}
            </div>
          </div>

          {/* Fees */}
          <div className="adminCard">
            <p className="adminCardTitle">Tarifas</p>
            <div className="infoGrid2">
              <div className="infoItem">
                <span className="infoLabel">Tarifa / hora</span>
                <span className="infoValue">${emp.hourlyFee.toLocaleString()} MXN</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Salario mensual</span>
                <span className="infoValue">${emp.monthlySalary.toLocaleString()} MXN</span>
              </div>
            </div>
          </div>

          {/* Working hours */}
          <div className="adminCard">
            <p className="adminCardTitle">Horario</p>
            <div className="infoGrid2">
              <div className="infoItem">
                <span className="infoLabel">Entrada</span>
                <span className="infoValue">{emp.workingHours.start}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Salida</span>
                <span className="infoValue">{emp.workingHours.end}</span>
              </div>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <span className="infoLabel" style={{ display: "block", marginBottom: "0.4rem" }}>Días</span>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
                  <span
                    key={d}
                    style={{
                      padding: "0.2rem 0.5rem", borderRadius: "99px", fontSize: "0.68rem",
                      fontWeight: 600,
                      background: emp.workingHours.days.includes(d) ? "rgba(214,118,42,.18)" : "rgba(0,0,0,.06)",
                      color: emp.workingHours.days.includes(d) ? "#b85e1e" : "rgba(27,27,30,.35)",
                      border: emp.workingHours.days.includes(d) ? "1px solid rgba(214,118,42,.3)" : "1px solid rgba(0,0,0,.1)",
                    }}
                  >{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Resume */}
          {emp.resume && (
            <div className="adminCard">
              <p className="adminCardTitle">Currículo</p>
              <a href={emp.resume.url} target="_blank" rel="noreferrer" className="resumeLink">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <line x1="4.5" y1="4.5" x2="9.5" y2="4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="4.5" y1="9.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                {emp.resume.name}
              </a>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="empDetailRight">

          {/* Personal info */}
          <div className="adminCard">
            <p className="adminCardTitle">Información Personal</p>
            <div className="infoGrid2">
              <div className="infoItem">
                <span className="infoLabel">Fecha de nacimiento</span>
                <span className="infoValue">{formatDob(emp.dateOfBirth)}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Edad</span>
                <span className="infoValuePlain">{age ?? "—"} años</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">RFC</span>
                <span className="infoValue">{emp.rfc || "—"}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">CURP</span>
                <span className="infoValue" style={{ fontSize: "0.78rem" }}>{emp.curp || "—"}</span>
              </div>
              <div className="infoItem">
                <span className="infoLabel">Alta en sistema</span>
                <span className="infoValuePlain">{emp.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="adminCard">
            <p className="adminCardTitle">Citas asignadas ({empAppts.length})</p>
            {empAppts.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "rgba(27,27,30,.45)", textAlign: "center", padding: "1rem 0" }}>
                Sin citas registradas.
              </p>
            ) : (
              <div className="empApptList">
                {empAppts.map((a) => {
                  const [, mm, dd] = a.date.split("-");
                  return (
                    <div key={a.id} className="empApptRow">
                      <span className="empApptDate">{dd}/{mm}</span>
                      <div style={{ flex: 1 }}>
                        <div className="empApptClient">{a.clientName}</div>
                        <div className="empApptMeta">{a.time} · {a.style} · ${a.total.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div className="adminCard">
            <p className="adminCardTitle">Portafolio ({emp.portfolio?.length ?? 0} imágenes)</p>
            {emp.portfolio?.length > 0 ? (
              <div className="portfolioGrid">
                {emp.portfolio.map((img, i) => (
                  <div
                    key={i}
                    className="portfolioThumb"
                    onClick={() => setLightbox(img)}
                  >
                    <img src={img.url} alt={img.name} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="noPortfolio">Sin imágenes de portafolio.</p>
            )}
          </div>

        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="adminLightbox" onClick={closeLightbox}>
          <button className="adminLightboxClose" onClick={closeLightbox}>✕</button>
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="adminLightboxImg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
