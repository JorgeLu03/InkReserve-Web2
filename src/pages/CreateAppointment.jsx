import { useState, useRef } from "react";
import "./CreateAppointment.css";
import Avatar from "../components/Avatar";
import AppointmentConfirmation from "./AppointmentConfirmation";
import { ARTISTS, STYLES, TIME_SLOTS, TATTOO_KEYS, CLIENT_COLORS } from "../data/mockData";

function initials(name) {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

const EMPTY_FORM = {
  clientName: "", style: "", artistId: null,
  date: "", time: "", hours: 2,
  dimensions: "", total: "", notes: "",
};

export default function CreateAppointment({ nav, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [refImages, setRefImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const fileInputRef = useRef(null);

  function set(key, val) { setForm((p) => ({ ...p, [key]: val })); }

  function readFiles(files) {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setRefImages((prev) => [
          ...prev,
          { url: e.target.result, name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleFileChange(e) { readFiles(e.target.files); e.target.value = ""; }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    readFiles(e.dataTransfer.files);
  }

  function removeImage(idx) {
    setRefImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function validate() {
    const e = {};
    if (!form.clientName.trim()) e.clientName = "Nombre requerido";
    if (!form.style)             e.style      = "Selecciona un estilo";
    if (!form.artistId)          e.artistId   = "Selecciona un artista";
    if (!form.date)              e.date       = "Selecciona una fecha";
    if (!form.time)              e.time       = "Selecciona una hora";
    if (!form.total || isNaN(Number(form.total))) e.total = "Total inválido";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const colorIdx = Math.floor(Math.random() * CLIENT_COLORS.length);
    const appt = {
      clientName:     form.clientName.trim(),
      clientInitials: initials(form.clientName).toUpperCase(),
      clientColor:    CLIENT_COLORS[colorIdx],
      artistId:       form.artistId,
      date:           form.date,
      time:           form.time,
      hours:          form.hours,
      style:          form.style,
      dimensions:     form.dimensions || "—",
      total:          Number(form.total),
      tattooKey:      TATTOO_KEYS[form.style] ?? "rose",
      status:         "pending",
      notes:          form.notes,
      refImages:      refImages,
    };

    try {
      const creada = await onAdd(appt);
      setSaving(false);
      setConfirmed(creada);
    } catch (err) {
      setSaving(false);
      setErrors({ submit: err.message || 'Error al guardar la cita. Intenta de nuevo.' });
    }
  }

  if (confirmed) {
    return (
      <AppointmentConfirmation
        appointment={confirmed}
        onViewCalendar={nav.toCalendar}
        onNewAppointment={() => {
          setConfirmed(null);
          setForm(EMPTY_FORM);
          setRefImages([]);
          setErrors({});
        }}
      />
    );
  }

  return (
    <div className="pageScreen">
      <div className="pageBg" />

      <header className="pageHeader">
        <button className="iconBtn" onClick={nav.goBack} aria-label="Volver">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
            <polyline points="10.5,5.5 6.5,9 10.5,12.5" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="pageTitle">Nueva Cita</h1>
        <div style={{ width: 36 }} />
      </header>

      <main className="createMain">
        <form className="createForm" onSubmit={handleSubmit} noValidate>

          {/* ── CLIENTE ── */}
          <div className="formSection">
            <label className="formLabel">Nombre del cliente *</label>
            <input
              className={`formInput ${errors.clientName ? "inputError" : ""}`}
              placeholder="Nombre completo"
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
            />
            {errors.clientName && <span className="fieldError">{errors.clientName}</span>}
          </div>

          {/* ── ESTILO ── */}
          <div className="formSection">
            <label className="formLabel">Estilo de tatuaje *</label>
            {errors.style && <span className="fieldError">{errors.style}</span>}
            <div className="styleGrid">
              {STYLES.map((s) => (
                <button
                  key={s} type="button"
                  className={`styleChip ${form.style === s ? "styleChipActive" : ""}`}
                  onClick={() => set("style", s)}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* ── ARTISTA ── */}
          <div className="formSection">
            <label className="formLabel">Artista asignado *</label>
            {errors.artistId && <span className="fieldError">{errors.artistId}</span>}
            <div className="artistPicker">
              {ARTISTS.map((a) => (
                <button
                  key={a.id} type="button"
                  className={`artistOption ${form.artistId === a.id ? "artistOptionActive" : ""}`}
                  onClick={() => set("artistId", a.id)}
                  style={{ borderColor: form.artistId === a.id ? a.color : undefined }}
                >
                  <Avatar initials={a.initials} color={a.color} size={36} />
                  <span className="artistOptionName">{a.name.split(" ")[0]}</span>
                  {!a.clockedIn && <span className="artistOffBadge">Off</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ── FECHA Y HORA ── */}
          <div className="formRow">
            <div className="formSection">
              <label className="formLabel">Fecha *</label>
              <input
                type="date"
                className={`formInput ${errors.date ? "inputError" : ""}`}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
              {errors.date && <span className="fieldError">{errors.date}</span>}
            </div>

            <div className="formSection">
              <label className="formLabel">Duración (horas)</label>
              <div className="hoursRow">
                {[1,2,3,4,5,6].map((h) => (
                  <button
                    key={h} type="button"
                    className={`hourChip ${form.hours === h ? "hourChipActive" : ""}`}
                    onClick={() => set("hours", h)}
                  >{h}h</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── HORA ── */}
          <div className="formSection">
            <label className="formLabel">Hora de inicio *</label>
            {errors.time && <span className="fieldError">{errors.time}</span>}
            <div className="timeGrid">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t} type="button"
                  className={`timeChip ${form.time === t ? "timeChipActive" : ""}`}
                  onClick={() => set("time", t)}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* ── DIMENSIONES Y TOTAL ── */}
          <div className="formRow">
            <div className="formSection">
              <label className="formLabel">Dimensiones</label>
              <input
                className="formInput"
                placeholder="ej. 15 × 10 cm"
                value={form.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
              />
            </div>
            <div className="formSection">
              <label className="formLabel">Total ($ MXN) *</label>
              <input
                type="number"
                className={`formInput ${errors.total ? "inputError" : ""}`}
                placeholder="2500"
                value={form.total}
                onChange={(e) => set("total", e.target.value)}
              />
              {errors.total && <span className="fieldError">{errors.total}</span>}
            </div>
          </div>

          {/* ── NOTAS ── */}
          <div className="formSection">
            <label className="formLabel">Notas internas</label>
            <textarea
              className="formTextarea"
              placeholder="Observaciones, referencias, preferencias del cliente..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* ── IMÁGENES DE REFERENCIA ── */}
          <div className="formSection">
            <label className="formLabel">Imágenes de referencia</label>
            <div
              className={`refUploadZone ${dragOver ? "refDragOver" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <polyline points="2,24 10,16 16,22 22,17 30,24" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <polyline points="12,6 16,2 20,6" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="refUploadHint">Arrastra imágenes aquí o <span>haz clic para subir</span></p>
              <p className="refUploadTypes">JPG, JPEG, PNG</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            {refImages.length > 0 && (
              <div className="refImageGrid">
                {refImages.map((img, idx) => (
                  <div key={idx} className="refThumb">
                    <img src={img.url} alt={img.name} />
                    <button
                      type="button"
                      className="refThumbRemove"
                      onClick={() => removeImage(idx)}
                      aria-label="Eliminar imagen"
                    >✕</button>
                    <span className="refThumbName">{img.name.length > 16 ? img.name.slice(0, 14) + "…" : img.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ACTIONS ── */}
          {errors.submit && (
            <p style={{ color: '#f87171', textAlign: 'center', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              {errors.submit}
            </p>
          )}
          <div className="formActions">
            <button type="button" className="cancelBtn" onClick={nav.goBack}>
              Cancelar
            </button>
            <button type="submit" className="submitBtn" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cita"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
