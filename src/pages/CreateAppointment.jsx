import { useMemo, useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./CreateAppointment.css";
import Avatar from "../components/Avatar";
import AppointmentConfirmation from "./AppointmentConfirmation";
import {
  TIME_SLOTS,
  TATTOO_KEYS,
  CLIENT_COLORS,
} from "../data/mockData";
import { getServicios } from "../services/apiService";

function initials(name) {
  const parts = name.trim().split(" ").filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

/* ── HELPERS DE DISPONIBILIDAD ────────────────────────────────────
   Calculan si un artista puede tomar una cita según fecha, hora,
   duración y citas existentes. Las mismas reglas las aplica el
   backend (hayTraslape en citasController) como segunda capa.
─────────────────────────────────────────────────────────────────── */

// JS Date.getDay() → abreviación que usa el frontend
const DIA_POR_GETDAY = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Normaliza una etiqueta de día (acepta con o sin acento, mayúsculas)
function normalizaDia(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .slice(0, 3);
}

function parseHM(s) {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function diaDeFechaISO(dateISO) {
  if (!dateISO) return null;
  const [y, mo, d] = dateISO.split("-").map(Number);
  if (!y || !mo || !d) return null;
  return new Date(y, mo - 1, d).getDay(); // 0-6 (local time, no TZ issues)
}

/** Devuelve { available, reason } para un artista dado el form actual.
 *  Si faltan datos (fecha o hora), solo evalúa lo que pueda. */
function disponibilidadArtista(artist, form, appointments) {
  const start = form.time ? parseHM(form.time) : null;
  const hours = Number(form.hours) || 1;
  const end   = start !== null ? start + hours * 60 : null;

  // 1) Día laboral del artista (solo se evalúa si hay fecha)
  if (form.date) {
    const idx = diaDeFechaISO(form.date);
    if (idx !== null && Array.isArray(artist.workingHours?.days) && artist.workingHours.days.length) {
      const diaSeleccionado = normalizaDia(DIA_POR_GETDAY[idx]);
      const diasArtista     = artist.workingHours.days.map(normalizaDia);
      if (!diasArtista.includes(diaSeleccionado)) {
        return { available: false, reason: `No trabaja en ${DIA_POR_GETDAY[idx]}.` };
      }
    }
  }

  // 2) Horario del artista (solo se evalúa si hay hora)
  if (start !== null) {
    const aStart = parseHM(artist.workingHours?.start);
    const aEnd   = parseHM(artist.workingHours?.end);
    if (aStart !== null && aEnd !== null) {
      if (start < aStart || end > aEnd) {
        return {
          available: false,
          reason: `Fuera de su horario (${artist.workingHours.start} – ${artist.workingHours.end}).`,
        };
      }
    }
  }

  // 3) Traslape con citas existentes (necesita fecha, hora y duración)
  if (form.date && start !== null) {
    const conflicto = appointments.find((c) => {
      if (String(c.artistId) !== String(artist.artistId)) return false;
      if (c.date !== form.date) return false;
      if (c.status === "cancelled") return false;
      const cStart = parseHM(c.time);
      if (cStart === null) return false;
      const cEnd = cStart + (Number(c.hours) || 1) * 60;
      return start < cEnd && cStart < end; // intervalos se cruzan
    });
    if (conflicto) {
      const cStart = conflicto.time;
      const cEnd   = (() => {
        const s = parseHM(conflicto.time);
        const e = s + (Number(conflicto.hours) || 1) * 60;
        return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
      })();
      return { available: false, reason: `Ocupado con otra cita ${cStart} – ${cEnd}.` };
    }
  }

  return { available: true, reason: null };
}

const EMPTY_FORM = {
  clientName: "",
  style: "",
  artistId: null,
  date: "",
  time: "",
  hours: 2,
  dimensions: "",
  total: "",
  notes: "",
};

const MAX_REF_IMAGES = 6;

/* ── STEP PROGRESS ───────────────────────────────────────────── */
function StepProgress({ stepStatus }) {
  const steps = [
    { label: "Cliente", icon: "👤" },
    { label: "Artista", icon: "🎨" },
    { label: "Agenda",  icon: "📅" },
    { label: "Detalles", icon: "📋" },
  ];

  const completedCount = stepStatus.filter(Boolean).length;

  return (
    <div className="stepProgress">
      <div className="stepProgressBar">
        <div
          className="stepProgressFill"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="stepItems">
        {steps.map((s, i) => {
          const done = stepStatus[i];
          return (
            <div key={s.label} className={`stepItem ${done ? "stepDone" : ""}`}>
              <div className="stepDot">
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 11 11">
                    <polyline
                      points="1.8,5.5 4.2,8 9,2.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="stepLabel">{s.label}</span>
            </div>
          );
        })}
      </div>

      <p className="stepSummaryText">
        {completedCount === 4
          ? "✓ Todos los campos requeridos completados"
          : `${completedCount} de ${steps.length} secciones completadas`}
      </p>
    </div>
  );
}

/* ── DURATION STEPPER ────────────────────────────────────────── */
function DurationStepper({ value, onChange }) {
  const MIN = 1;
  const MAX = 8;

  return (
    <div className="durationStepper">
      <button
        type="button"
        className="stepperBtn"
        onClick={() => onChange(Math.max(MIN, value - 1))}
        disabled={value <= MIN}
        aria-label="Reducir duración"
      >
        −
      </button>
      <div className="stepperValue">
        <span className="stepperNumber">{value}</span>
        <span className="stepperUnit">h</span>
      </div>
      <button
        type="button"
        className="stepperBtn"
        onClick={() => onChange(Math.min(MAX, value + 1))}
        disabled={value >= MAX}
        aria-label="Aumentar duración"
      >
        +
      </button>
    </div>
  );
}

/* ── TIME PICKER MODAL ───────────────────────────────────────── */
function TimePickerModal({ currentTime, onConfirm, onClose }) {
  const [selected, setSelected] = useState(currentTime || "");

  /* Cerrar con Escape */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Agrupar slots por período */
  const groups = useMemo(() => {
    const morning = TIME_SLOTS.filter((t) => {
      const h = parseInt(t.split(":")[0], 10);
      return h < 12;
    });
    const afternoon = TIME_SLOTS.filter((t) => {
      const h = parseInt(t.split(":")[0], 10);
      return h >= 12 && h < 17;
    });
    const evening = TIME_SLOTS.filter((t) => {
      const h = parseInt(t.split(":")[0], 10);
      return h >= 17;
    });
    return [
      { label: "🌅 Mañana", slots: morning },
      { label: "☀️ Tarde", slots: afternoon },
      { label: "🌆 Noche", slots: evening },
    ].filter((g) => g.slots.length > 0);
  }, []);

  return (
    <div className="modalOverlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalCard timeModal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modalHeader">
          <div className="modalHeaderContent">
            <div className="modalIconBadge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                <polyline points="12,7 12,12.5 15.5,14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="modalTitle">Hora de inicio</h3>
              <p className="modalSubtitle">Selecciona cuándo comenzará la sesión</p>
            </div>
          </div>
          <button className="modalCloseBtn" onClick={onClose} aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Time grid */}
        <div className="modalBody">
          {groups.map((g) => (
            <div key={g.label} className="timeGroup">
              <p className="timeGroupLabel">{g.label}</p>
              <div className="timeModalGrid">
                {g.slots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`timeModalChip ${selected === t ? "timeModalChipActive" : ""}`}
                    onClick={() => setSelected(t)}
                    aria-pressed={selected === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="modalFooter">
          {selected && (
            <p className="modalSelectedInfo">
              Hora elegida: <strong>{selected}</strong>
            </p>
          )}
          <div className="modalActions">
            <button type="button" className="modalCancelBtn" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="modalConfirmBtn"
              disabled={!selected}
              onClick={() => {
                onConfirm(selected);
                onClose();
              }}
            >
              Confirmar hora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ARTIST INFO MODAL ───────────────────────────────────────── */
function ArtistInfoModal({ artist, onClose }) {
  /* Cerrar con Escape */
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!artist) return null;

  const formatCurrency = (n) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n || 0);

  const horarioDias = Array.isArray(artist.workingHours?.days) && artist.workingHours.days.length
    ? artist.workingHours.days.join(", ")
    : "Sin horario definido";

  const horarioHoras = artist.workingHours?.start && artist.workingHours?.end
    ? `${artist.workingHours.start} – ${artist.workingHours.end}`
    : "—";

  const especialidades = Array.isArray(artist.specializations) && artist.specializations.length
    ? artist.specializations
    : ["Sin especialidades registradas"];

  return (
    <div className="modalOverlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalCard artistInfoModal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalHeaderContent">
            <Avatar initials={artist.initials} color={artist.color} size={48} />
            <div>
              <h3 className="modalTitle">{artist.name}</h3>
              <p className="modalSubtitle">
                {artist.clockedIn ? "Fichado · Disponible" : "Fuera de turno"}
              </p>
            </div>
          </div>
          <button className="modalCloseBtn" onClick={onClose} aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modalBody artistInfoBody">
          <div className="artistInfoSection">
            <p className="artistInfoLabel">Especialidades</p>
            <div className="artistInfoChips">
              {especialidades.map((e, i) => (
                <span key={i} className="artistInfoChip">{e}</span>
              ))}
            </div>
          </div>

          <div className="artistInfoGrid">
            <div className="artistInfoCell">
              <p className="artistInfoLabel">Horario</p>
              <strong>{horarioHoras}</strong>
            </div>
            <div className="artistInfoCell">
              <p className="artistInfoLabel">Días de trabajo</p>
              <strong>{horarioDias}</strong>
            </div>
            <div className="artistInfoCell">
              <p className="artistInfoLabel">Tarifa por hora</p>
              <strong>{formatCurrency(artist.hourlyFee)}</strong>
            </div>
            <div className="artistInfoCell">
              <p className="artistInfoLabel">Salario mensual</p>
              <strong>{formatCurrency(artist.monthlySalary)}</strong>
            </div>
          </div>

          {artist.dateOfBirth && (
            <div className="artistInfoSection">
              <p className="artistInfoLabel">Fecha de nacimiento</p>
              <strong>{artist.dateOfBirth}</strong>
            </div>
          )}
        </div>

        <div className="modalFooter">
          <button type="button" className="modalConfirmBtn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ──────────────────────────────────────────── */
export default function CreateAppointment({ nav, onAdd, employees = [], appointments = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [refImages, setRefImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [shakeErrors, setShakeErrors] = useState(false);
  const [artistInfoOpen, setArtistInfoOpen] = useState(null); // empleado a mostrar en el modal de info
  const [autoDeselectMsg, setAutoDeselectMsg] = useState(null);
  const [estilosDisponibles, setEstilosDisponibles] = useState([]); // categorías desde el backend
  const [estilosLoading, setEstilosLoading] = useState(true);

  const fileInputRef = useRef(null);

  // Cargar categorías de tatuaje desde el backend
  useEffect(() => {
    let cancelado = false;
    getServicios()
      .then((data) => {
        if (cancelado) return;
        // Ordenar alfabéticamente para que el orden no dependa de la BD
        const ordenadas = [...data].sort((a, b) =>
          (a.Titulo || "").localeCompare(b.Titulo || "", "es")
        );
        setEstilosDisponibles(ordenadas);
      })
      .catch(() => {
        if (!cancelado) setEstilosDisponibles([]);
      })
      .finally(() => {
        if (!cancelado) setEstilosLoading(false);
      });
    return () => { cancelado = true; };
  }, []);

  // El campo artistId en la cita es un Number (schema de Mongoose).
  // Cada tatuador tiene su Artist_Id_Numerico (mapeado a artistId en el FE),
  // que es el que se persiste en las citas.
  const selectedArtist = useMemo(
    () => employees.find((a) => a.artistId === form.artistId) || null,
    [employees, form.artistId]
  );

  // Disponibilidad por artista, recalculada cuando cambia el form o la lista
  const disponibilidades = useMemo(() => {
    const map = new Map();
    for (const a of employees) {
      map.set(a.artistId, disponibilidadArtista(a, form, appointments));
    }
    return map;
  }, [employees, form.date, form.time, form.hours, appointments]);

  // Si el artista seleccionado deja de estar disponible al cambiar fecha/hora/duración, lo deseleccionamos.
  useEffect(() => {
    if (!selectedArtist) return;
    const d = disponibilidades.get(selectedArtist.artistId);
    if (d && !d.available) {
      setForm((p) => ({ ...p, artistId: null }));
      setAutoDeselectMsg(`${selectedArtist.name.split(" ")[0]} se deseleccionó: ${d.reason}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.time, form.hours]);

  const formattedDate = useMemo(() => {
    if (!form.date) return null;
    const parsed = new Date(`${form.date}T12:00:00`);
    return new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsed);
  }, [form.date]);

  const formattedTotal = useMemo(() => {
    const amount = Number(form.total);
    if (!form.total || Number.isNaN(amount) || amount <= 0) return null;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount);
  }, [form.total]);

  /* Step completion status */
  const stepStatus = useMemo(
    () => [
      Boolean(form.clientName.trim() && form.style),
      Boolean(form.artistId !== null),
      Boolean(form.date && form.time),
      Boolean(form.total && Number(form.total) > 0),
    ],
    [form]
  );

  const isDirty = useMemo(() => {
    return (
      form.clientName.trim() !== "" ||
      form.style !== "" ||
      form.artistId !== null ||
      form.date !== "" ||
      form.time !== "" ||
      form.hours !== 2 ||
      form.dimensions.trim() !== "" ||
      form.total !== "" ||
      form.notes.trim() !== "" ||
      refImages.length > 0
    );
  }, [form, refImages.length]);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function clearSubmitError() {
    setErrors((prev) => {
      if (!prev.submit) return prev;
      const next = { ...prev };
      delete next.submit;
      return next;
    });
  }

  function formatMoneyInput(value) {
    return String(value).replace(/[^\d]/g, "");
  }

  function validate() {
    const next = {};
    if (!form.clientName.trim()) next.clientName = "Escribe el nombre del cliente.";
    if (!form.style) next.style = "Selecciona un estilo.";
    if (form.artistId === null) next.artistId = "Selecciona un artista.";
    if (!form.date) next.date = "Selecciona una fecha.";
    if (!form.time) next.time = "Selecciona una hora.";
    if (!form.total || Number(form.total) <= 0)
      next.total = "Ingresa un total válido.";
    return next;
  }

  async function handleCancel() {
    if (!isDirty) {
      nav.goBack?.();
      return;
    }
    const result = await Swal.fire({
      icon: "question",
      title: "¿Descartar cambios?",
      text: "Hay información sin guardar en esta cita.",
      showCancelButton: true,
      confirmButtonText: "Salir",
      cancelButtonText: "Seguir editando",
      confirmButtonColor: "#d6762a",
      cancelButtonColor: "#b0a79f",
      background: "#f4efe7",
      color: "#1b1b1e",
    });
    if (result.isConfirmed) nav.goBack?.();
  }

  async function showInvalidFilesAlert(count) {
    await Swal.fire({
      icon: "info",
      title: "Algunos archivos no se agregaron",
      text:
        count === 1
          ? "Solo se permiten imágenes JPG, JPEG o PNG."
          : `Se omitieron ${count} archivos. Solo se permiten JPG, JPEG o PNG.`,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#d6762a",
      background: "#f4efe7",
      color: "#1b1b1e",
    });
  }

  async function showMaxImagesAlert() {
    await Swal.fire({
      icon: "info",
      title: "Límite de imágenes",
      text: `Solo puedes agregar hasta ${MAX_REF_IMAGES} imágenes de referencia.`,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#d6762a",
      background: "#f4efe7",
      color: "#1b1b1e",
    });
  }

  function readFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const validFiles = files.filter((f) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(f.type)
    );
    const invalidCount = files.length - validFiles.length;
    if (invalidCount > 0) showInvalidFilesAlert(invalidCount);
    const availableSlots = MAX_REF_IMAGES - refImages.length;
    if (availableSlots <= 0) { showMaxImagesAlert(); return; }
    const filesToRead = validFiles.slice(0, availableSlots);
    if (validFiles.length > availableSlots) showMaxImagesAlert();
    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRefImages((prev) => [...prev, { url: e.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleFileChange(e) { readFiles(e.target.files); e.target.value = ""; }
  function handleDrop(e) { e.preventDefault(); setDragOver(false); readFiles(e.dataTransfer.files); }
  function removeImage(idx) { setRefImages((prev) => prev.filter((_, i) => i !== idx)); }

  async function handleArtistSelect(artist) {
    clearSubmitError();
    setAutoDeselectMsg(null);
    const dispo = disponibilidades.get(artist.artistId);
    if (dispo && !dispo.available) {
      await Swal.fire({
        icon: "warning",
        title: "Artista no disponible",
        text: dispo.reason,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#d6762a",
        background: "#f4efe7",
        color: "#1b1b1e",
      });
      return;
    }
    // Persistimos el id numérico que espera el schema de Cita.
    setField("artistId", artist.artistId);
  }

  function openArtistInfo(artist, e) {
    // Evitar que el click en el botón "i" dispare también la selección del artista
    e?.stopPropagation();
    setArtistInfoOpen(artist);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearSubmitError();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setShakeErrors(true);
      setTimeout(() => setShakeErrors(false), 600);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const colorIdx = Math.floor(Math.random() * CLIENT_COLORS.length);
    const appt = {
      clientName: form.clientName.trim(),
      clientInitials: initials(form.clientName).toUpperCase(),
      clientColor: CLIENT_COLORS[colorIdx],
      artistId: form.artistId,
      date: form.date,
      time: form.time,
      hours: form.hours,
      style: form.style,
      dimensions: form.dimensions.trim() || "—",
      total: Number(form.total),
      tattooKey: TATTOO_KEYS[form.style] ?? "rose",
      status: "pending",
      notes: form.notes.trim(),
      refImages,
    };
    try {
      const creada = await onAdd(appt);
      setSaving(false);
      setConfirmed(creada);
    } catch (err) {
      setSaving(false);
      setErrors({ submit: err.message || "Error al guardar la cita." });
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err.message || "Ocurrió un error al guardar la cita.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#d6762a",
        background: "#f4efe7",
        color: "#1b1b1e",
      });
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

      {/* ── HEADER ── */}
      <header className="pageHeader">
        <button className="iconBtn" onClick={handleCancel} aria-label="Volver">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
            <polyline points="10.5,5.5 6.5,9 10.5,12.5" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="pageTitle">Nueva Cita</h1>
        <div style={{ width: 38, flexShrink: 0 }} />
      </header>

      {/* ── FORM ── */}
      <main className="createMain">
        <form
          className={`createForm ${shakeErrors ? "formShake" : ""}`}
          onSubmit={handleSubmit}
          noValidate
        >

          {/* ── INTRO ── */}
          <div className="introBlock">
            <p className="eyebrowText">Agenda del estudio</p>
            <h2 className="sectionHeroTitle">Programa una nueva sesión</h2>
            <p className="sectionHeroCopy">
              Completa los 4 pasos para registrar la cita. Puedes rellenar las secciones
              en cualquier orden.
            </p>
          </div>

          {/* ── PROGRESS ── */}
          <StepProgress stepStatus={stepStatus} />

          {/* ═══ SECTION 1: CLIENTE ══════════════════════════════ */}
          <section className="contentSection" style={{ "--section-delay": "0.05s" }}>
            <div className="sectionHeader">
              <div className="sectionBadge">1</div>
              <div>
                <h3 className="sectionTitle">Cliente y estilo</h3>
                <p className="sectionSubtitle">Nombre del cliente y tipo de tatuaje</p>
              </div>
              {stepStatus[0] && <div className="sectionCheck">✓</div>}
            </div>

            <div className="sectionBody">
              {/* Nombre */}
              <div className="formSection">
                <label className="formLabel">
                  Nombre del cliente <span className="reqStar">*</span>
                </label>
                <input
                  className={`formInput ${errors.clientName ? "inputError" : ""}`}
                  placeholder="Nombre completo"
                  value={form.clientName}
                  onChange={(e) => setField("clientName", e.target.value)}
                  autoComplete="off"
                />
                {errors.clientName && (
                  <span className="fieldError">{errors.clientName}</span>
                )}
              </div>

              {/* Estilo */}
              <div className="formSection">
                <div className="labelRow">
                  <label className="formLabel">
                    Estilo de tatuaje <span className="reqStar">*</span>
                  </label>
                  {form.style && (
                    <span className="selectedBadge">{form.style}</span>
                  )}
                </div>
                {errors.style && <span className="fieldError">{errors.style}</span>}

                {estilosLoading ? (
                  <p className="fieldHint">Cargando categorías…</p>
                ) : estilosDisponibles.length === 0 ? (
                  <div className="artistEmptyState">
                    <strong>No hay categorías registradas.</strong>
                    <span>El administrador debe agregar al menos un estilo desde el panel de Categorías antes de poder agendar citas.</span>
                  </div>
                ) : (
                  <div className="styleGrid">
                    {estilosDisponibles.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        className={`styleChip ${form.style === cat.Titulo ? "styleChipActive" : ""}`}
                        onClick={() => setField("style", cat.Titulo)}
                      >
                        {cat.Titulo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ═══ SECTION 2: ARTISTA ══════════════════════════════ */}
          <section className="contentSection" style={{ "--section-delay": "0.1s" }}>
            <div className="sectionHeader">
              <div className="sectionBadge">2</div>
              <div>
                <h3 className="sectionTitle">Artista asignado</h3>
                <p className="sectionSubtitle">¿Quién realizará la sesión?</p>
              </div>
              {stepStatus[1] && <div className="sectionCheck">✓</div>}
            </div>

            <div className="sectionBody">
              <div className="formSection">
                {errors.artistId && (
                  <span className="fieldError">{errors.artistId}</span>
                )}

                {/* Aviso si se deseleccionó automáticamente */}
                {autoDeselectMsg && (
                  <div className="artistAutoDeselect">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                      <line x1="12" y1="7.5" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="16.5" r="0.9" fill="currentColor"/>
                    </svg>
                    <span>{autoDeselectMsg}</span>
                  </div>
                )}

                {/* Hint contextual sobre disponibilidad */}
                {employees.length > 0 && (
                  <p className="artistHint">
                    {form.date && form.time
                      ? "Mostrando disponibilidad para la fecha y hora elegidas. Los artistas con conflicto aparecen deshabilitados."
                      : "Selecciona fecha y hora para filtrar artistas disponibles según su horario y citas existentes."}
                  </p>
                )}

                {employees.length === 0 ? (
                  <div className="artistEmptyState">
                    <strong>No hay artistas registrados todavía.</strong>
                    <span>El administrador debe crear al menos un tatuador desde el panel de Artistas antes de poder agendar citas.</span>
                  </div>
                ) : (
                  <div className="artistPicker">
                    {employees.map((a) => {
                      const artistKey = a.artistId;
                      const isActive  = form.artistId === artistKey;
                      const isOff     = !a.clockedIn;
                      const dispo     = disponibilidades.get(artistKey) || { available: true, reason: null };
                      const isUnavailable = !dispo.available;
                      const tooltip   = isUnavailable ? dispo.reason : `Seleccionar a ${a.name}`;
                      return (
                        <div
                          key={artistKey}
                          className={`artistOption ${isActive ? "artistOptionActive" : ""} ${isOff ? "artistOff" : ""} ${isUnavailable ? "artistUnavailable" : ""}`}
                          style={{ "--artist-color": a.color }}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleArtistSelect(a)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleArtistSelect(a);
                            }
                          }}
                          aria-label={`Seleccionar a ${a.name}`}
                          aria-pressed={isActive}
                          aria-disabled={isUnavailable}
                          title={tooltip}
                        >
                          <Avatar initials={a.initials} color={a.color} size={40} />
                          <span className="artistOptionName">{a.name.split(" ")[0]}</span>
                          {isOff && !isUnavailable && <span className="artistOffBadge">Off</span>}
                          {isUnavailable && <span className="artistBusyBadge">Ocupado</span>}
                          {isActive && (
                            <span className="artistCheckmark">
                              <svg width="12" height="12" viewBox="0 0 12 12">
                                <polyline points="1.5,6 4.5,9 10.5,3" stroke="currentColor" strokeWidth="2"
                                  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                          )}
                          <button
                            type="button"
                            className="artistInfoBtn"
                            onClick={(e) => openArtistInfo(a, e)}
                            aria-label={`Ver información de ${a.name}`}
                            title="Ver información del artista"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                              <line x1="12" y1="10.5" x2="12" y2="16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                              <circle cx="12" cy="7.5" r="0.9" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ═══ SECTION 3: AGENDA ═══════════════════════════════ */}
          <section className="contentSection" style={{ "--section-delay": "0.15s" }}>
            <div className="sectionHeader">
              <div className="sectionBadge">3</div>
              <div>
                <h3 className="sectionTitle">Fecha y horario</h3>
                <p className="sectionSubtitle">Cuándo y por cuánto tiempo</p>
              </div>
              {stepStatus[2] && <div className="sectionCheck">✓</div>}
            </div>

            <div className="sectionBody">
              <div className="scheduleGrid">

                {/* Fecha */}
                <div className="formSection">
                  <label className="formLabel">
                    Fecha <span className="reqStar">*</span>
                  </label>
                  <input
                    type="date"
                    className={`formInput dateInput ${errors.date ? "inputError" : ""}`}
                    value={form.date}
                    onChange={(e) => setField("date", e.target.value)}
                  />
                  {errors.date && <span className="fieldError">{errors.date}</span>}
                  {formattedDate && (
                    <p className="fieldConfirm">📅 {formattedDate}</p>
                  )}
                </div>

                {/* Duración */}
                <div className="formSection">
                  <label className="formLabel">Duración de la sesión</label>
                  <DurationStepper
                    value={form.hours}
                    onChange={(v) => setField("hours", v)}
                  />
                  <p className="fieldHint">
                    Duración estimada en horas.
                  </p>
                </div>
              </div>

              {/* Hora - botón que abre modal */}
              <div className="formSection">
                <div className="labelRow">
                  <label className="formLabel">
                    Hora de inicio <span className="reqStar">*</span>
                  </label>
                  {form.time && (
                    <span className="selectedBadge">{form.time}</span>
                  )}
                </div>
                {errors.time && <span className="fieldError">{errors.time}</span>}

                <button
                  type="button"
                  className={`timePickerTrigger ${form.time ? "timePickerTriggerFilled" : ""} ${errors.time ? "timePickerTriggerError" : ""}`}
                  onClick={() => setTimeModalOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
                    <polyline points="12,7 12,12.5 15.5,14.5" stroke="currentColor" strokeWidth="1.7"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>
                    {form.time ? `Inicio a las ${form.time}` : "Seleccionar hora de inicio"}
                  </span>
                  <svg className="triggerChevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <polyline points="4,6 8,10 12,6" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* ═══ SECTION 4: DETALLES ══════════════════════════════ */}
          <section className="contentSection" style={{ "--section-delay": "0.2s" }}>
            <div className="sectionHeader">
              <div className="sectionBadge">4</div>
              <div>
                <h3 className="sectionTitle">Medidas, costo y referencias</h3>
                <p className="sectionSubtitle">Información de apoyo para la sesión</p>
              </div>
              {stepStatus[3] && <div className="sectionCheck">✓</div>}
            </div>

            <div className="sectionBody">
              <div className="formRow">
                {/* Dimensiones */}
                <div className="formSection">
                  <label className="formLabel">Dimensiones</label>
                  <input
                    className="formInput"
                    placeholder="ej. 15 × 10 cm"
                    value={form.dimensions}
                    onChange={(e) => setField("dimensions", e.target.value)}
                  />
                  <p className="fieldHint">Aproximación del tamaño del tatuaje.</p>
                </div>

                {/* Total */}
                <div className="formSection">
                  <div className="labelRow">
                    <label className="formLabel">
                      Total ($ MXN) <span className="reqStar">*</span>
                    </label>
                    {formattedTotal && (
                      <span className="selectedBadge">{formattedTotal}</span>
                    )}
                  </div>
                  <input
                    inputMode="numeric"
                    className={`formInput ${errors.total ? "inputError" : ""}`}
                    placeholder="2500"
                    value={form.total}
                    onChange={(e) => setField("total", formatMoneyInput(e.target.value))}
                  />
                  {errors.total && <span className="fieldError">{errors.total}</span>}
                </div>
              </div>

              {/* Notas */}
              <div className="formSection">
                <div className="labelRow">
                  <label className="formLabel">Notas internas</label>
                  <span className="charCount">{form.notes.trim().length} caracteres</span>
                </div>
                <textarea
                  className="formTextarea"
                  placeholder="Observaciones del cliente, zona del cuerpo, referencias o indicaciones importantes..."
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>

              {/* Imágenes de referencia */}
              <div className="formSection">
                <div className="labelRow">
                  <label className="formLabel">Imágenes de referencia</label>
                  <span className="charCount">
                    {refImages.length}/{MAX_REF_IMAGES} subidas
                  </span>
                </div>

                <div
                  className={`refUploadZone ${dragOver ? "refDragOver" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                >
                  <div className="uploadIcon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16V8M12 8l-3 3M12 8l3 3M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5"
                        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="4" width="18" height="14" rx="2.4"
                        stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                    </svg>
                  </div>
                  <p className="refUploadHint">
                    Arrastra aquí o <span>haz clic para subir</span>
                  </p>
                  <p className="refUploadTypes">JPG, JPEG, PNG · máx. {MAX_REF_IMAGES} imágenes</p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    multiple
                    hidden
                    onChange={handleFileChange}
                  />
                </div>

                {refImages.length > 0 && (
                  <div className="refImageGrid">
                    {refImages.map((img, idx) => (
                      <div key={`${img.name}-${idx}`} className="refThumb">
                        <button
                          type="button"
                          className="refThumbRemove"
                          onClick={() => removeImage(idx)}
                          aria-label={`Eliminar ${img.name}`}
                        >
                          <svg width="9" height="9" viewBox="0 0 10 10">
                            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round"/>
                          </svg>
                        </button>
                        <img src={img.url} alt={img.name} />
                        <div className="refThumbName" title={img.name}>{img.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ═══ RESUMEN ══════════════════════════════════════════ */}
          {stepStatus.some(Boolean) && (
            <section className="summaryCard" style={{ "--section-delay": "0.25s" }}>
              <div className="summaryCardHeader">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.7"
                    strokeLinecap="round"/>
                </svg>
                <span>Resumen de la cita</span>
              </div>

              <div className="summaryGrid">
                {[
                  { label: "Cliente",   value: form.clientName.trim() || null },
                  { label: "Estilo",    value: form.style || null },
                  { label: "Artista",   value: selectedArtist?.name || null },
                  { label: "Fecha",     value: formattedDate },
                  { label: "Hora",      value: form.time || null },
                  { label: "Duración",  value: `${form.hours}h` },
                  { label: "Total",     value: formattedTotal },
                  { label: "Refs.",     value: refImages.length > 0 ? `${refImages.length} imagen(es)` : null },
                ].map(({ label, value }) => (
                  <div key={label} className={`summaryItem ${!value ? "summaryItemEmpty" : ""}`}>
                    <span className="summaryLabel">{label}</span>
                    <strong className="summaryValue">{value ?? "—"}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── ERROR SUBMIT ── */}
          {errors.submit && (
            <div className="submitErrorBox">{errors.submit}</div>
          )}

          {/* ── ACTIONS ── */}
          <div className="formActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="submitBtn" disabled={saving}>
              {saving ? (
                <>
                  <span className="savingSpinner" />
                  Guardando...
                </>
              ) : (
                "Guardar cita"
              )}
            </button>
          </div>
        </form>
      </main>

      {/* ── TIME MODAL ── */}
      {timeModalOpen && (
        <TimePickerModal
          currentTime={form.time}
          onConfirm={(t) => setField("time", t)}
          onClose={() => setTimeModalOpen(false)}
        />
      )}

      {/* ── ARTIST INFO MODAL ── */}
      {artistInfoOpen && (
        <ArtistInfoModal
          artist={artistInfoOpen}
          onClose={() => setArtistInfoOpen(null)}
        />
      )}
    </div>
  );
}