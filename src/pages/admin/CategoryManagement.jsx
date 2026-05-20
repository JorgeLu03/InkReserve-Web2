import { useEffect, useMemo, useState } from "react";
import "./CategoryManagement.css";
import {
  getServicios,
  createServicio,
  updateServicio,
  deleteServicio,
} from "../../services/apiService";

/* ──────────────────────────────────────────────────────────────
   Pantalla administrativa: CRUD de categorías de tatuaje.
   Estas categorías son las que alimentan los estilos disponibles
   en CreateAppointment y las especializaciones en CreateEmployee.
─────────────────────────────────────────────────────────────── */
export default function CategoryManagement() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [busqueda, setBusqueda]     = useState("");
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [creando, setCreando]       = useState(false);
  const [accionando, setAccionando] = useState(null); // id de la categoría en operación
  const [editando, setEditando]     = useState(null); // { id, titulo }
  const [mensaje, setMensaje]       = useState(null); // { tipo, texto }

  // ── Carga inicial ────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const data = await getServicios();
        if (!cancelado) setCategorias(data);
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter((c) => (c.Titulo || "").toLowerCase().includes(q));
  }, [categorias, busqueda]);

  function showMensaje(tipo, texto) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  }

  // ── Crear ────────────────────────────────────────────────────
  async function handleCrear(e) {
    e.preventDefault();
    const titulo = nuevoTitulo.trim();
    if (titulo.length < 2) {
      showMensaje("error", "El título debe tener al menos 2 caracteres.");
      return;
    }
    setCreando(true);
    try {
      const res = await createServicio(titulo);
      setCategorias((prev) => [...prev, res.servicio].sort((a, b) =>
        a.Titulo.localeCompare(b.Titulo, "es")
      ));
      setNuevoTitulo("");
      showMensaje("success", `Categoría "${titulo}" creada.`);
    } catch (err) {
      showMensaje("error", err.message || "No se pudo crear la categoría.");
    } finally {
      setCreando(false);
    }
  }

  // ── Editar inline ────────────────────────────────────────────
  function iniciarEdicion(cat) {
    setEditando({ id: cat._id, titulo: cat.Titulo });
  }

  function cancelarEdicion() {
    setEditando(null);
  }

  async function guardarEdicion() {
    if (!editando) return;
    const nuevoTituloTrim = editando.titulo.trim();
    if (nuevoTituloTrim.length < 2) {
      showMensaje("error", "El título debe tener al menos 2 caracteres.");
      return;
    }
    setAccionando(editando.id);
    try {
      const res = await updateServicio(editando.id, nuevoTituloTrim);
      setCategorias((prev) =>
        prev.map((c) => (c._id === editando.id ? res.servicio : c))
          .sort((a, b) => a.Titulo.localeCompare(b.Titulo, "es"))
      );
      showMensaje("success", "Categoría actualizada.");
      setEditando(null);
    } catch (err) {
      showMensaje("error", err.message || "No se pudo actualizar.");
    } finally {
      setAccionando(null);
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────
  async function handleEliminar(cat) {
    const ok = window.confirm(
      `¿Eliminar la categoría "${cat.Titulo}"?\n\n` +
      `Las citas y tatuadores que ya la usen conservarán el nombre como texto, ` +
      `pero la categoría dejará de aparecer en las listas de selección.`
    );
    if (!ok) return;
    setAccionando(cat._id);
    try {
      await deleteServicio(cat._id);
      setCategorias((prev) => prev.filter((c) => c._id !== cat._id));
      showMensaje("success", `Categoría "${cat.Titulo}" eliminada.`);
    } catch (err) {
      showMensaje("error", err.message || "No se pudo eliminar.");
    } finally {
      setAccionando(null);
    }
  }

  /* ── Render ──────────────────────────────────────────── */
  if (loading) {
    return (
      <section className="catMgmtView">
        <p className="catMgmtEmpty">Cargando categorías…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="catMgmtView">
        <p className="catMgmtEmpty catMgmtError">
          No se pudieron cargar las categorías: {error}
        </p>
      </section>
    );
  }

  return (
    <section className="catMgmtView">
      {/* HERO */}
      <header className="catMgmtHero">
        <div>
          <p className="catMgmtEyebrow">Panel administrativo</p>
          <h2 className="catMgmtTitle">Categorías de tatuaje</h2>
          <p className="catMgmtIntro">
            Define los estilos disponibles en todo el sistema. Estas categorías
            aparecen al crear citas y al registrar tatuadores.
          </p>
        </div>

        <div className="catMgmtStats">
          <div className="catMgmtStat">
            <span className="catMgmtStatVal">{categorias.length}</span>
            <span className="catMgmtStatLabel">Categorías</span>
          </div>
        </div>
      </header>

      {/* FORMULARIO DE CREACIÓN */}
      <form className="catMgmtCreate" onSubmit={handleCrear}>
        <div className="catMgmtCreateField">
          <label htmlFor="newCategory" className="catMgmtCreateLabel">
            Agregar nueva categoría
          </label>
          <input
            id="newCategory"
            type="text"
            placeholder="ej. Blackwork, Realismo, Fine Line…"
            value={nuevoTitulo}
            onChange={(e) => setNuevoTitulo(e.target.value)}
            className="catMgmtCreateInput"
            maxLength={80}
            disabled={creando}
          />
        </div>
        <button
          type="submit"
          className="catMgmtCreateBtn"
          disabled={creando || nuevoTitulo.trim().length < 2}
        >
          {creando ? "Agregando…" : "Agregar"}
        </button>
      </form>

      {/* MENSAJE FLOTANTE */}
      {mensaje && (
        <div className={`catMgmtFeedback catMgmtFeedback--${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* BÚSQUEDA */}
      {categorias.length > 0 && (
        <div className="catMgmtSearchWrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar categoría…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="catMgmtSearch"
          />
        </div>
      )}

      {/* LISTA */}
      <div className="catMgmtListWrap">
        {categorias.length === 0 ? (
          <div className="catMgmtEmpty catMgmtEmpty--info">
            <strong>Aún no hay categorías.</strong>
            <span>Agrega la primera arriba para que aparezca como estilo en las pantallas de cita y de registro de tatuadores.</span>
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <p className="catMgmtEmpty">No hay categorías que coincidan con la búsqueda.</p>
        ) : (
          <ul className="catMgmtList">
            {categoriasFiltradas.map((cat) => {
              const enEdicion = editando?.id === cat._id;
              const ocupado   = accionando === cat._id;

              return (
                <li key={cat._id} className={`catMgmtItem ${enEdicion ? "catMgmtItem--editing" : ""}`}>
                  {enEdicion ? (
                    <>
                      <input
                        type="text"
                        className="catMgmtEditInput"
                        value={editando.titulo}
                        onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
                        maxLength={80}
                        autoFocus
                      />
                      <div className="catMgmtItemActions">
                        <button
                          type="button"
                          className="catMgmtActionBtn catMgmtActionBtn--primary"
                          onClick={guardarEdicion}
                          disabled={ocupado}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="catMgmtActionBtn"
                          onClick={cancelarEdicion}
                          disabled={ocupado}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="catMgmtItemTitle">{cat.Titulo}</span>
                      <div className="catMgmtItemActions">
                        <button
                          type="button"
                          className="catMgmtActionBtn"
                          onClick={() => iniciarEdicion(cat)}
                          disabled={ocupado}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="catMgmtActionBtn catMgmtActionBtn--danger"
                          onClick={() => handleEliminar(cat)}
                          disabled={ocupado}
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
