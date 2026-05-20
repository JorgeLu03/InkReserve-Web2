import { useState, useEffect, useCallback } from "react";
import "./AppointmentDetail.css";
import Avatar from "../components/Avatar";
import TattooSvg from "../components/TattooSvg";
import { STATUSES, STATUS_LABELS, STATUS_COLORS, CANCELLATION_FEE_RATE, CANCELLATION_FEE_STATUSES } from "../data/constants";

function InfoItem({ label, value }) {
  return (
    <div className="detailInfoItem">
      <span className="detailInfoLabel">{label}</span>
      <span className="detailInfoValue">{value}</span>
    </div>
  );
}

export default function AppointmentDetail({ appointment, employees = [], nav, onUpdate }) {
  const [notes,           setNotes]          = useState(appointment?.notes ?? "");
  const [saved,           setSaved]          = useState(false);
  const [saving,          setSaving]         = useState(false);
  const [carouselIdx,     setCarouselIdx]    = useState(0);
  const [lightbox,        setLightbox]       = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const refs = appointment?.refImages ?? [];
  const hasRefs = refs.length > 0;
  const isCarousel = refs.length > 1;

  const prevSlide = () => setCarouselIdx((i) => (i - 1 + refs.length) % refs.length);
  const nextSlide = () => setCarouselIdx((i) => (i + 1) % refs.length);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox]);

  if (!appointment) {
    return (
      <div className="pageScreen">
        <div className="pageBg" />
        <header className="pageHeader">
          <button className="iconBtn" onClick={nav.goBack}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
              <polyline points="10.5,5.5 6.5,9 10.5,12.5" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="pageTitle">Detalle de Cita</h1>
          <div style={{ width: 36 }} />
        </header>
        <div className="detailNotFound">Cita no encontrada.</div>
      </div>
    );
  }

  const artist = employees.find(
    (a) => String(a._id) === String(appointment.artistId) || String(a.artistId) === String(appointment.artistId)
  );
  const [, mm, dd] = appointment.date.split("-");

  async function saveNotes() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onUpdate(appointment.id, { notes });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function changeStatus(s) {
    onUpdate(appointment.id, { status: s });
  }

  const isCancelled      = appointment.status === "cancelled";
  const canCancel        = !isCancelled && appointment.status !== "completed";
  const hasFee           = CANCELLATION_FEE_STATUSES.includes(appointment.status);
  const feeAmount        = hasFee ? Math.round(appointment.total * CANCELLATION_FEE_RATE) : 0;

  function handleConfirmCancel() {
    onUpdate(appointment.id, {
      status: "cancelled",
      cancellationFee: feeAmount,
    });
    setShowCancelModal(false);
  }

  const currentIdx = STATUSES.indexOf(appointment.status);

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
        <h1 className="pageTitle">Detalle de Cita</h1>
        <button className="primarySmallBtn" onClick={nav.toCalendar}>Ver Calendario</button>
      </header>

      <main className="detailMain">

        {/* ── CANCELLED BANNER ── */}
        {isCancelled && (
          <div className="cancelledBanner">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#ef4444" strokeWidth="1.5"/>
              <line x1="6" y1="6" x2="12" y2="12" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="12" y1="6" x2="6" y2="12" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <div className="cancelledBannerText">
              <span className="cancelledBannerTitle">Cita cancelada</span>
              {appointment.cancellationFee > 0 && (
                <span className="cancelledBannerFee">
                  Cargo por cancelación aplicado: <strong>${appointment.cancellationFee.toLocaleString()} MXN</strong> (30% del total)
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── STATUS TRACKER ── */}
        <div className="statusTrackerCard">
          <div className={`trackerSteps ${isCancelled ? "trackerDisabled" : ""}`}>
            {STATUSES.map((s, i) => {
              const isDone   = i <= currentIdx;
              const isActive = s === appointment.status;
              return (
                <button
                  key={s}
                  className={`statusStep ${isDone ? "stepDone" : ""} ${isActive ? "stepActive" : ""}`}
                  onClick={() => !isCancelled && changeStatus(s)}
                  disabled={isCancelled}
                  title={isCancelled ? "Cita cancelada" : `Cambiar a ${STATUS_LABELS[s]}`}
                >
                  <div className="stepDot" style={{ background: isDone ? STATUS_COLORS[s] : undefined }} />
                  {i < STATUSES.length - 1 && (
                    <div className={`stepLine ${isDone && i < currentIdx ? "stepLineDone" : ""}`} />
                  )}
                  <span className="stepLabel">{STATUS_LABELS[s]}</span>
                </button>
              );
            })}
          </div>

          {canCancel && (
            <div className="trackerFooter">
              {appointment.status === "pending" && (
                <button className="confirmApptBtn" onClick={() => changeStatus("confirmed")}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                    <polyline points="4,7 6.5,9.5 10,4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Confirmar cita
                </button>
              )}
              <button className="cancelApptBtn" onClick={() => setShowCancelModal(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                  <line x1="4.5" y1="4.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="9.5" y1="4.5" x2="4.5" y2="9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Cancelar cita
              </button>
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="detailBody">

          {/* LEFT */}
          <div className="detailLeft">

            {/* Client card */}
            <div className="detailCard">
              <h3 className="detailCardTitle">Cliente</h3>
              <div className="detailParty">
                <Avatar initials={appointment.clientInitials} color={appointment.clientColor} size={52} />
                <div>
                  <span className="detailPartyName">{appointment.clientName}</span>
                  <span className="detailPartyMeta">Cliente activo</span>
                </div>
              </div>
            </div>

            {/* Artist card */}
            {artist && (
              <div className="detailCard">
                <h3 className="detailCardTitle">Artista</h3>
                <div className="detailParty">
                  <Avatar initials={artist.initials} color={artist.color} size={52} />
                  <div>
                    <span className="detailPartyName">{artist.name}</span>
                    <div className={`clockBadgeInline ${artist.clockedIn ? "clockedIn" : "clockedOut"}`}>
                      <svg width="7" height="7" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="4" fill="currentColor" />
                      </svg>
                      {artist.clockedIn ? "Fichado hoy" : "Sin fichar"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointment details */}
            <div className="detailCard">
              <h3 className="detailCardTitle">Detalles de la cita</h3>
              <div className="detailInfoGrid">
                <InfoItem label="Fecha"      value={`${dd}/${mm}/${appointment.date.slice(0,4)}`} />
                <InfoItem label="Hora"       value={appointment.time} />
                <InfoItem label="Duración"   value={`${appointment.hours} hrs`} />
                <InfoItem label="Estilo"     value={appointment.style} />
                <InfoItem label="Dimensiones" value={appointment.dimensions} />
                <InfoItem label="Total"      value={`$${appointment.total.toLocaleString()}`} />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="detailRight">

            {/* Boceto / reference images */}
            <div className="detailCard tattooCard">
              <h3 className="detailCardTitle">
                Boceto de referencia
                {hasRefs && <span className="refCount">{refs.length} imagen{refs.length > 1 ? "es" : ""}</span>}
              </h3>

              {hasRefs ? (
                <div className="refCarouselWrap">
                  {/* Main image */}
                  <div className="refCarouselStage">
                    {isCarousel && (
                      <button className="carouselArrow carouselPrev" onClick={prevSlide} aria-label="Anterior">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <polyline points="11,4 6,9 11,14" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    <img
                      src={refs[carouselIdx].url}
                      alt={refs[carouselIdx].name}
                      className="refCarouselImg"
                      onClick={() => setLightbox(refs[carouselIdx])}
                      title="Clic para ampliar"
                    />
                    {isCarousel && (
                      <button className="carouselArrow carouselNext" onClick={nextSlide} aria-label="Siguiente">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <polyline points="7,4 12,9 7,14" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    <div className="refExpandHint">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M1 1h4M1 1v4M12 1h-4M12 1v4M1 12h4M1 12v-4M12 12h-4M12 12v-4"
                          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Ampliar
                    </div>
                  </div>

                  {/* Dot indicators */}
                  {isCarousel && (
                    <div className="carouselDots">
                      {refs.map((_, i) => (
                        <button
                          key={i}
                          className={`carouselDot ${i === carouselIdx ? "dotActive" : ""}`}
                          onClick={() => setCarouselIdx(i)}
                          aria-label={`Imagen ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Thumbnail strip (carousel only) */}
                  {isCarousel && (
                    <div className="carouselStrip">
                      {refs.map((img, i) => (
                        <button
                          key={i}
                          className={`stripThumb ${i === carouselIdx ? "stripActive" : ""}`}
                          onClick={() => setCarouselIdx(i)}
                        >
                          <img src={img.url} alt={img.name} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="tattooPreview">
                    <TattooSvg tattooKey={appointment.tattooKey} className="tattooSvgLarge" />
                  </div>
                  <span className="tattooLabel">{appointment.style} — diseño de referencia</span>
                </>
              )}
            </div>

            {/* Notes */}
            <div className="detailCard notesCard">
              <h3 className="detailCardTitle">Notas internas</h3>
              <textarea
                className="notesTextarea"
                placeholder="Agrega observaciones, preferencias del cliente, referencias..."
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
                rows={5}
              />
              <div className="notesActions">
                {saved && <span className="savedMsg">✓ Guardado</span>}
                <button
                  className="saveNotesBtn"
                  onClick={saveNotes}
                  disabled={saving || notes === appointment.notes}
                >
                  {saving ? "Guardando..." : "Guardar notas"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── CANCEL MODAL ── */}
      {showCancelModal && (
        <div className="cancelModalOverlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancelModal" onClick={(e) => e.stopPropagation()}>

            <div className="cancelModalIcon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" fill="rgba(239,68,68,.1)" stroke="#ef4444" strokeWidth="1.5"/>
                <line x1="16" y1="9" x2="16" y2="18" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="16" cy="22.5" r="1.3" fill="#ef4444"/>
              </svg>
            </div>

            <h3 className="cancelModalTitle">¿Cancelar esta cita?</h3>
            <p className="cancelModalSub">
              {hasFee
                ? `Esta cita ya fue ${STATUS_LABELS[appointment.status].toLowerCase()}. Se aplicará un cargo por cancelación.`
                : "Esta cita aún está pendiente. No se aplicará ningún cargo."}
            </p>

            {hasFee && (
              <div className="cancelFeeBox">
                <div className="cancelFeeRow">
                  <span className="cancelFeeLabel">Total de la cita</span>
                  <span className="cancelFeeValue">${appointment.total.toLocaleString()} MXN</span>
                </div>
                <div className="cancelFeeRow cancelFeeRowHighlight">
                  <span className="cancelFeeLabel">Cargo por cancelación (30%)</span>
                  <span className="cancelFeeValue cancelFeeRed">${feeAmount.toLocaleString()} MXN</span>
                </div>
              </div>
            )}

            <p className="cancelModalWarn">Esta acción no se puede deshacer.</p>

            <div className="cancelModalActions">
              <button className="cancelModalBack" onClick={() => setShowCancelModal(false)}>
                Volver
              </button>
              <button className="cancelModalConfirm" onClick={handleConfirmCancel}>
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightboxOverlay" onClick={closeLightbox}>
          <button className="lightboxClose" onClick={closeLightbox} aria-label="Cerrar">✕</button>
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="lightboxImg"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="lightboxCaption">{lightbox.name}</span>
        </div>
      )}
    </div>
  );
}
