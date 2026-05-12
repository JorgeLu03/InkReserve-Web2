import { useState } from "react";
import "./CatalogoServicios.css";

const CATEGORIAS = ["Blackwork", "Fine Line", "Neotradicional", "Geométrico", "Acuarela", "Realismo", "Japonés", "Tribal"];

const MOCK_SERVICIOS = [
  { id: 1, nombre: "Tatuaje pequeño",         categoria: "Fine Line",      precio: 800,  duracion: 60,  descripcion: "Diseños de hasta 5 cm." },
  { id: 2, nombre: "Tatuaje mediano",          categoria: "Blackwork",      precio: 1500, duracion: 120, descripcion: "Diseños de 5 a 15 cm." },
  { id: 3, nombre: "Tatuaje grande",           categoria: "Neotradicional", precio: 3000, duracion: 240, descripcion: "Diseños de 15 cm en adelante." },
  { id: 4, nombre: "Manga completa",           categoria: "Japonés",        precio: 15000,duracion: 480, descripcion: "Cubierta total del brazo." },
  { id: 5, nombre: "Retoque / touch-up",       categoria: "Realismo",       precio: 400,  duracion: 45,  descripcion: "Corrección de tatuajes existentes." },
  { id: 6, nombre: "Diseño geométrico básico", categoria: "Geométrico",     precio: 1200, duracion: 90,  descripcion: "Figuras y patrones geométricos." },
  { id: 7, nombre: "Acuarela artística",       categoria: "Acuarela",       precio: 2200, duracion: 150, descripcion: "Estilo acuarela multicolor." },
  { id: 8, nombre: "Tribal tradicional",       categoria: "Tribal",         precio: 1800, duracion: 120, descripcion: "Patrones tribales auténticos." },
];

function formatCurrency(v) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(v);
}

function formatDuration(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

const EMPTY_FORM = { nombre: "", categoria: CATEGORIAS[0], precio: "", duracion: "", descripcion: "" };

export default function CatalogoServicios() {
  const [servicios, setServicios] = useState(MOCK_SERVICIOS);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [modal, setModal]         = useState(null); // null | "create" | { ...servicio }
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [deleteId, setDeleteId]   = useState(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal("create");
  }

  function openEdit(s) {
    setForm({ nombre: s.nombre, categoria: s.categoria, precio: String(s.precio), duracion: String(s.duracion), descripcion: s.descripcion });
    setErrors({});
    setModal(s);
  }

  function closeModal() { setModal(null); setErrors({}); }

  function setField(key, val) { setForm((p) => ({ ...p, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.nombre.trim())          e.nombre    = "Requerido";
    if (!form.precio || isNaN(+form.precio) || +form.precio <= 0)  e.precio    = "Precio inválido";
    if (!form.duracion || isNaN(+form.duracion) || +form.duracion <= 0) e.duracion = "Duración inválida";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const data = { nombre: form.nombre.trim(), categoria: form.categoria, precio: +form.precio, duracion: +form.duracion, descripcion: form.descripcion.trim() };

    if (modal === "create") {
      const newId = Math.max(...servicios.map((s) => s.id)) + 1;
      setServicios((p) => [...p, { id: newId, ...data }]);
    } else {
      setServicios((p) => p.map((s) => s.id === modal.id ? { ...s, ...data } : s));
    }
    closeModal();
  }

  function handleDelete(id) {
    setServicios((p) => p.filter((s) => s.id !== id));
    setDeleteId(null);
  }

  const categories = ["Todas", ...CATEGORIAS];

  const filtered = servicios.filter((s) => {
    const matchCat  = catFilter === "Todas" || s.categoria === catFilter;
    const matchText = s.nombre.toLowerCase().includes(search.toLowerCase()) ||
                      s.categoria.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchText;
  });

  const totalServicios = servicios.length;
  const avgPrecio = servicios.length ? Math.round(servicios.reduce((a, s) => a + s.precio, 0) / servicios.length) : 0;
  const minPrecio = servicios.length ? Math.min(...servicios.map((s) => s.precio)) : 0;
  const maxPrecio = servicios.length ? Math.max(...servicios.map((s) => s.precio)) : 0;

  return (
    <div className="csView">

      {/* ── STATS ── */}
      <div className="csStatsRow">
        <div className="csStat">
          <span className="csStatVal">{totalServicios}</span>
          <span className="csStatLabel">Servicios</span>
        </div>
        <div className="csStat">
          <span className="csStatVal csStatOrange">{CATEGORIAS.filter((c) => servicios.some((s) => s.categoria === c)).length}</span>
          <span className="csStatLabel">Categorías activas</span>
        </div>
        <div className="csStat">
          <span className="csStatVal csStatGreen">{formatCurrency(avgPrecio)}</span>
          <span className="csStatLabel">Precio promedio</span>
        </div>
        <div className="csStat">
          <span className="csStatVal csStatBlue">{formatCurrency(minPrecio)} – {formatCurrency(maxPrecio)}</span>
          <span className="csStatLabel">Rango de precios</span>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="csToolbar">
        <input
          className="csSearch"
          type="text"
          placeholder="Buscar servicio o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="csCatScroll">
          {categories.map((c) => (
            <button
              key={c}
              className={`csCatBtn ${catFilter === c ? "csCatBtnOn" : ""}`}
              onClick={() => setCatFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <button className="csAddBtn" onClick={openCreate}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Nuevo servicio
        </button>
      </div>

      {/* ── TABLE ── */}
      <div className="csTableCard">
        <div className="csTableHead">
          <span>Servicio</span>
          <span>Categoría</span>
          <span>Precio</span>
          <span>Duración</span>
          <span>Acciones</span>
        </div>

        {filtered.length === 0 && (
          <p className="csEmpty">No se encontraron servicios con ese criterio.</p>
        )}

        {filtered.map((s) => (
          <div key={s.id} className="csTableRow">
            <div className="csServiceCell">
              <strong className="csServiceName">{s.nombre}</strong>
              {s.descripcion && <span className="csServiceDesc">{s.descripcion}</span>}
            </div>

            <span className="csCatChip">{s.categoria}</span>

            <span className="csPrecio">{formatCurrency(s.precio)}</span>

            <span className="csDuracion">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {formatDuration(s.duracion)}
            </span>

            <div className="csRowActions">
              <button className="csEditBtn" onClick={() => openEdit(s)} title="Editar">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                Editar
              </button>
              <button className="csDeleteBtn" onClick={() => setDeleteId(s.id)} title="Eliminar">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <polyline points="2,3 11,3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M4 3V2h5v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M3 3l.7 8h5.6L10 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {modal !== null && (
        <div className="csOverlay" onClick={closeModal}>
          <div className="csModal" onClick={(e) => e.stopPropagation()}>
            <div className="csModalHeader">
              <h3 className="csModalTitle">{modal === "create" ? "Nuevo servicio" : "Editar servicio"}</h3>
              <button className="csModalClose" onClick={closeModal}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="csModalBody">
              <div className="csFormField">
                <label className="csFormLabel">Nombre del servicio</label>
                <input
                  className={`csFormInput ${errors.nombre ? "csFormInputErr" : ""}`}
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  placeholder="Ej: Tatuaje en brazo"
                />
                {errors.nombre && <span className="csFormErr">{errors.nombre}</span>}
              </div>

              <div className="csFormField">
                <label className="csFormLabel">Categoría / Estilo</label>
                <select
                  className="csFormInput csFormSelect"
                  value={form.categoria}
                  onChange={(e) => setField("categoria", e.target.value)}
                >
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="csFormRow">
                <div className="csFormField">
                  <label className="csFormLabel">Precio (MXN)</label>
                  <input
                    className={`csFormInput ${errors.precio ? "csFormInputErr" : ""}`}
                    type="number"
                    min="0"
                    value={form.precio}
                    onChange={(e) => setField("precio", e.target.value)}
                    placeholder="1500"
                  />
                  {errors.precio && <span className="csFormErr">{errors.precio}</span>}
                </div>
                <div className="csFormField">
                  <label className="csFormLabel">Duración (minutos)</label>
                  <input
                    className={`csFormInput ${errors.duracion ? "csFormInputErr" : ""}`}
                    type="number"
                    min="0"
                    value={form.duracion}
                    onChange={(e) => setField("duracion", e.target.value)}
                    placeholder="120"
                  />
                  {errors.duracion && <span className="csFormErr">{errors.duracion}</span>}
                </div>
              </div>

              <div className="csFormField">
                <label className="csFormLabel">Descripción (opcional)</label>
                <textarea
                  className="csFormInput csFormTextarea"
                  value={form.descripcion}
                  onChange={(e) => setField("descripcion", e.target.value)}
                  placeholder="Breve descripción del servicio…"
                  rows={3}
                />
              </div>
            </div>

            <div className="csModalFooter">
              <button className="csModalCancel" onClick={closeModal}>Cancelar</button>
              <button className="csModalSave" onClick={handleSave}>
                {modal === "create" ? "Crear servicio" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId !== null && (
        <div className="csOverlay" onClick={() => setDeleteId(null)}>
          <div className="csConfirm" onClick={(e) => e.stopPropagation()}>
            <div className="csConfirmIcon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#dc2626" strokeWidth="1.5"/>
                <line x1="14" y1="8" x2="14" y2="16" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="14" cy="20" r="1.2" fill="#dc2626"/>
              </svg>
            </div>
            <strong className="csConfirmTitle">¿Eliminar servicio?</strong>
            <p className="csConfirmText">Esta acción no se puede deshacer.</p>
            <div className="csConfirmActions">
              <button className="csConfirmCancel" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="csConfirmDelete" onClick={() => handleDelete(deleteId)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
