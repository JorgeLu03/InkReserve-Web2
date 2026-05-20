import { useState, useEffect, useRef } from "react";
import Avatar from "../../components/Avatar";
import { employeeService } from "../../services/employeeService";
import { WORKING_DAYS } from "../../data/constants";
import { getServicios } from "../../services/apiService";
import "./AdminShell.css";

function initials(name) {
  const p = name.trim().split(" ");
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

const AVATAR_COLORS = ["#f472b6","#38bdf8","#fb923c","#4ade80","#c084fc","#facc15","#a5f3fc","#86efac"];

export default function CreateEmployee({ employees, onAdd, onCancel }) {
  const [empId]   = useState(() => employeeService.generateId());
  const [color]   = useState(() => AVATAR_COLORS[employees.length % AVATAR_COLORS.length]);
  const [saving,  setSaving]  = useState(false);
  const [dragPort, setDragPort] = useState(false);

  const [form, setForm] = useState({
    name: "", dateOfBirth: "", rfc: "", curp: "",
    specializations: [],
    workDays: ["Lun","Mar","Mié","Jue","Vie"],
    startTime: "10:00", endTime: "18:00",
    hourlyFee: "", monthlySalary: "",
  });
  const [photo,     setPhoto]     = useState(null);
  const [resume,    setResume]    = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [errors,    setErrors]    = useState({});
  const [categorias, setCategorias] = useState([]); // estilos disponibles desde el backend

  // Cargar categorías al montar
  useEffect(() => {
    let cancelado = false;
    getServicios()
      .then((data) => {
        if (cancelado) return;
        const ordenadas = [...data].sort((a, b) =>
          (a.Titulo || "").localeCompare(b.Titulo || "", "es")
        );
        setCategorias(ordenadas);
      })
      .catch(() => { if (!cancelado) setCategorias([]); });
    return () => { cancelado = true; };
  }, []);

  const photoRef    = useRef(null);
  const resumeRef   = useRef(null);
  const portRef     = useRef(null);

  function setF(key, val) { setForm((p) => ({ ...p, [key]: val })); }

  function toggleSpec(s) {
    setF("specializations",
      form.specializations.includes(s)
        ? form.specializations.filter((x) => x !== s)
        : [...form.specializations, s]
    );
  }

  function toggleDay(d) {
    setF("workDays",
      form.workDays.includes(d)
        ? form.workDays.filter((x) => x !== d)
        : [...form.workDays, d]
    );
  }

  function readPhoto(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = (e) => setPhoto(e.target.result);
    r.readAsDataURL(file);
  }

  function readResume(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => setResume({ name: file.name, url: e.target.result, type: file.type });
    r.readAsDataURL(file);
  }

  function readPortfolio(files) {
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = (e) => setPortfolio((p) => [...p, { url: e.target.result, name: f.name }]);
      r.readAsDataURL(f);
    });
  }

  function validate() {
    const e = {};
    if (!form.name.trim())        e.name = "Nombre requerido";
    if (!form.dateOfBirth)        e.dateOfBirth = "Fecha requerida";
    if (!form.rfc.trim())         e.rfc = "RFC requerido";
    if (!form.curp.trim())        e.curp = "CURP requerido";
    if (form.specializations.length === 0) e.specializations = "Selecciona al menos una";
    if (!form.hourlyFee || isNaN(Number(form.hourlyFee)))       e.hourlyFee = "Inválido";
    if (!form.monthlySalary || isNaN(Number(form.monthlySalary))) e.monthlySalary = "Inválido";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    const emp = {
      id: empId, artistId: Date.now(),
      name: form.name.trim(),
      initials: initials(form.name),
      color,
      photo,
      resume,
      dateOfBirth: form.dateOfBirth,
      rfc: form.rfc.trim().toUpperCase(),
      curp: form.curp.trim().toUpperCase(),
      specializations: form.specializations,
      workingHours: { start: form.startTime, end: form.endTime, days: form.workDays },
      hourlyFee: Number(form.hourlyFee),
      monthlySalary: Number(form.monthlySalary),
      portfolio,
      clockedIn: true,
      createdAt: "2026-03-03",
    };
    onAdd(emp);
    setSaving(false);
  }

  return (
    <form className="createEmpForm" onSubmit={handleSubmit} noValidate>

      {/* ID bar */}
      <div className="createEmpIdBar">
        <span className="createEmpIdLabel">ID del empleado</span>
        <span className="createEmpIdValue">{empId}</span>
      </div>

      {/* ── SECCIÓN 1: IDENTIDAD ── */}
      <div className="cSection">
        <p className="cSectionTitle">Identidad</p>

        {/* Photo */}
        <div className="photoUploadCenter">
          <div className="photoCircle" onClick={() => photoRef.current?.click()}>
            {photo
              ? <img src={photo} alt="foto" />
              : <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="rgba(27,27,30,.3)" strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(27,27,30,.3)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="photoCircleHint">Foto del empleado</span>
                </>
            }
            <input
              ref={photoRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => readPhoto(e.target.files[0])}
            />
          </div>
        </div>

        <div className="cGrid">
          <div className="cField full">
            <label className="cLabel">Nombre completo *</label>
            <input
              className={`cInput ${errors.name ? "err" : ""}`}
              placeholder="Nombre Apellido"
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
            />
            {errors.name && <span className="cErr">{errors.name}</span>}
          </div>
          <div className="cField">
            <label className="cLabel">Fecha de nacimiento *</label>
            <input
              type="date" className={`cInput ${errors.dateOfBirth ? "err" : ""}`}
              value={form.dateOfBirth}
              onChange={(e) => setF("dateOfBirth", e.target.value)}
            />
            {errors.dateOfBirth && <span className="cErr">{errors.dateOfBirth}</span>}
          </div>
          <div className="cField">
            <label className="cLabel">RFC *</label>
            <input
              className={`cInput ${errors.rfc ? "err" : ""}`}
              placeholder="AAAA000000XX0"
              value={form.rfc}
              onChange={(e) => setF("rfc", e.target.value.toUpperCase())}
              maxLength={13}
            />
            {errors.rfc && <span className="cErr">{errors.rfc}</span>}
          </div>
          <div className="cField full">
            <label className="cLabel">CURP *</label>
            <input
              className={`cInput ${errors.curp ? "err" : ""}`}
              placeholder="AAAA000000XXXXXX00"
              value={form.curp}
              onChange={(e) => setF("curp", e.target.value.toUpperCase())}
              maxLength={18}
            />
            {errors.curp && <span className="cErr">{errors.curp}</span>}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: PERFIL PROFESIONAL ── */}
      <div className="cSection">
        <p className="cSectionTitle">Perfil Profesional</p>

        <div className="cField" style={{ marginBottom: "1rem" }}>
          <label className="cLabel">Especialización(es) *</label>
          {errors.specializations && <span className="cErr">{errors.specializations}</span>}

          {categorias.length === 0 ? (
            <p style={{
              marginTop: "0.45rem",
              padding: "0.65rem 0.85rem",
              background: "rgba(214, 118, 42, 0.06)",
              border: "1px dashed rgba(214, 118, 42, 0.30)",
              borderRadius: "8px",
              color: "#7a4520",
              fontSize: "0.82rem",
            }}>
              No hay categorías registradas. Pide al administrador que cree estilos desde el panel de Categorías.
            </p>
          ) : (
            <div className="specGrid" style={{ marginTop: "0.45rem" }}>
              {categorias.map((cat) => (
                <button
                  key={cat._id} type="button"
                  className={`specChip ${form.specializations.includes(cat.Titulo) ? "specChipOn" : ""}`}
                  onClick={() => toggleSpec(cat.Titulo)}
                >{cat.Titulo}</button>
              ))}
            </div>
          )}
        </div>

        <div className="cField" style={{ marginBottom: "1rem" }}>
          <label className="cLabel">Días laborales</label>
          <div className="daysRow" style={{ marginTop: "0.45rem" }}>
            {WORKING_DAYS.map((d) => (
              <button
                key={d} type="button"
                className={`dayChip ${form.workDays.includes(d) ? "dayChipOn" : ""}`}
                onClick={() => toggleDay(d)}
              >{d}</button>
            ))}
          </div>
        </div>

        <div className="timeRangeRow">
          <span className="cLabel">Horario</span>
          <input type="time" className="cInput" value={form.startTime}
            onChange={(e) => setF("startTime", e.target.value)} />
          <span style={{ color: "rgba(27,27,30,.4)", fontSize: "0.8rem" }}>a</span>
          <input type="time" className="cInput" value={form.endTime}
            onChange={(e) => setF("endTime", e.target.value)} />
        </div>

        <div className="cGrid" style={{ marginTop: "1rem" }}>
          <div className="cField">
            <label className="cLabel">Tarifa / hora ($ MXN) *</label>
            <input
              type="number" min="0"
              className={`cInput ${errors.hourlyFee ? "err" : ""}`}
              placeholder="800"
              value={form.hourlyFee}
              onChange={(e) => setF("hourlyFee", e.target.value)}
            />
            {errors.hourlyFee && <span className="cErr">{errors.hourlyFee}</span>}
          </div>
          <div className="cField">
            <label className="cLabel">Salario mensual ($ MXN) *</label>
            <input
              type="number" min="0"
              className={`cInput ${errors.monthlySalary ? "err" : ""}`}
              placeholder="18000"
              value={form.monthlySalary}
              onChange={(e) => setF("monthlySalary", e.target.value)}
            />
            {errors.monthlySalary && <span className="cErr">{errors.monthlySalary}</span>}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 3: DOCUMENTOS ── */}
      <div className="cSection">
        <p className="cSectionTitle">Documentos</p>
        <div className="cField">
          <label className="cLabel">Currículo (PDF o imagen)</label>
          <div className="resumeZone" onClick={() => resumeRef.current?.click()}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2.5" y="1.5" width="13" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="5.5" y1="5.5" x2="12.5" y2="5.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="5.5" y1="8.5" x2="12.5" y2="8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="5.5" y1="11.5" x2="9.5" y2="11.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            {resume
              ? <span className="resumeName">{resume.name}</span>
              : <span>Haz clic para subir currículo</span>
            }
            <input
              ref={resumeRef} type="file"
              accept=".pdf,image/*"
              style={{ display: "none" }}
              onChange={(e) => readResume(e.target.files[0])}
            />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 4: PORTAFOLIO ── */}
      <div className="cSection">
        <p className="cSectionTitle">Portafolio</p>
        <div
          className={`portfolioDropZone ${dragPort ? "drag" : ""}`}
          onClick={() => portRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragPort(true); }}
          onDragLeave={() => setDragPort(false)}
          onDrop={(e) => { e.preventDefault(); setDragPort(false); readPortfolio(e.dataTransfer.files); }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="5" width="24" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.3"/>
            <polyline points="2,21 9,14 15,19 20,15 26,21" stroke="currentColor" strokeWidth="1.3"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="pdHint">Arrastra imágenes o <span>haz clic para subir</span></p>
          <p className="pdTypes">JPG, JPEG, PNG</p>
          <input
            ref={portRef} type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            multiple style={{ display: "none" }}
            onChange={(e) => { readPortfolio(e.target.files); e.target.value = ""; }}
          />
        </div>

        {portfolio.length > 0 && (
          <div className="portfolioThumbGrid">
            {portfolio.map((img, i) => (
              <div key={i} className="ptWrap">
                <img src={img.url} alt={img.name} />
                <button
                  type="button" className="ptRemove"
                  onClick={() => setPortfolio((p) => p.filter((_, j) => j !== i))}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="cActions">
        <button type="button" className="cCancelBtn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="cSaveBtn" disabled={saving}>
          {saving ? "Guardando…" : "Crear empleado"}
        </button>
      </div>
    </form>
  );
}
