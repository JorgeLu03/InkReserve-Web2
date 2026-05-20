import { useState, useEffect } from "react";
import "./AdminReports.css";
import {
  getReporteGanancias,
  getReporteServicios,
  getReporteCitasPorMes,
  getReporteClientesFrecuentes,
} from "../../services/apiService";

/* ══════════════════════════════════════════════════════════════
   CONSTANTES
══════════════════════════════════════════════════════════════ */
const PERIOD_OPTIONS = ["Hoy", "Semana", "Mes", "Año", "Todo"];
const NOMBRES_MES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const COLORES_AVATAR = ["#7c3aed", "#0ea5e9", "#16a34a", "#d97706", "#ec4899", "#0891b2"];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

/** Convierte un periodo legible (Hoy/Semana/Mes/Año/Todo) a { inicio, fin } ISO */
function rangoDePeriodo(periodo) {
  const hoy = new Date();
  const fin = toISODate(hoy);
  const inicio = new Date(hoy);

  switch (periodo) {
    case "Hoy":
      return { inicio: fin, fin };
    case "Semana":
      inicio.setDate(inicio.getDate() - 6);
      return { inicio: toISODate(inicio), fin };
    case "Mes":
      inicio.setMonth(inicio.getMonth() - 1);
      return { inicio: toISODate(inicio), fin };
    case "Año":
      inicio.setFullYear(inicio.getFullYear() - 1);
      return { inicio: toISODate(inicio), fin };
    case "Todo":
    default:
      return { inicio: null, fin: null };
  }
}

function iniciales(nombre) {
  return (nombre || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "??";
}

const RANK_COLORS = [
  { bar: "linear-gradient(90deg,#fbbf24,#d97706)", badge: "#d97706", bg: "rgba(251,191,36,.12)" },
  { bar: "linear-gradient(90deg,#94a3b8,#64748b)", badge: "#64748b", bg: "rgba(148,163,184,.12)" },
  { bar: "linear-gradient(90deg,#c67c4e,#a0522d)", badge: "#a0522d", bg: "rgba(198,124,78,.12)"  },
  { bar: "linear-gradient(90deg,#e08a3f,#d6762a)", badge: "#d6762a", bg: "rgba(214,118,42,.10)"  },
  { bar: "linear-gradient(90deg,#e08a3f,#d6762a)", badge: "#d6762a", bg: "rgba(214,118,42,.08)"  },
];

const RANK_LABELS = ["🥇", "🥈", "🥉", "4°", "5°"];

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTES VISUALES
══════════════════════════════════════════════════════════════ */

function TrendBadge({ value, label }) {
  if (value === null || value === undefined) return <span className="kpiTrendNeutral">{label}</span>;
  const up = value >= 0;
  return (
    <span className={`kpiTrend kpiTrend--${up ? "up" : "down"}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        {up
          ? <polyline points="1,7 4,3 7,5.5 9,2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          : <polyline points="1,3 4,7 7,4.5 9,8"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
      {up ? "+" : ""}{value}% {label}
    </span>
  );
}

function KpiCard({ card }) {
  return (
    <article className={`reportsKpiCard reportsKpiCard--${card.accent}`}>
      <div className="kpiTop">
        <div className={`kpiIconWrap kpiIconWrap--${card.accent}`}>
          {card.icon}
        </div>
        <TrendBadge value={card.trend} label={card.trendLabel} />
      </div>
      <strong className="reportsKpiValue">{card.value}</strong>
      <span className="reportsKpiLabel">{card.label}</span>
    </article>
  );
}

function ServicesRank({ data }) {
  if (!data.length) return <p className="reportsEmpty">Sin servicios registrados aún.</p>;
  const maxQty = Math.max(...data.map((d) => d.qty));
  const totalIncome = data.reduce((s, d) => s + d.income, 0) || 1;

  return (
    <div className="serviceRankList">
      {data.slice(0, 5).map((service, idx) => {
        const rank = RANK_COLORS[idx] || RANK_COLORS[3];
        const incomePct = ((service.income / totalIncome) * 100).toFixed(0);

        return (
          <div key={service.name} className="serviceRankItem" style={{ "--rank-bg": rank.bg }}>
            <div className="serviceRankLeft">
              <span className="serviceRankMedal">{RANK_LABELS[idx]}</span>
              <div>
                <strong className="serviceRankName">{service.name}</strong>
                <span className="serviceRankMeta">{service.qty} sesiones</span>
              </div>
            </div>
            <div className="serviceRankRight">
              <strong className="serviceRankIncome">{formatCurrency(service.income)}</strong>
              <span className="serviceRankPct">{incomePct}% del total</span>
            </div>
            <div className="serviceRankTrack">
              <div
                className="serviceRankFill"
                style={{ width: `${(service.qty / maxQty) * 100}%`, background: rank.bar }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyChart({ data }) {
  if (!data.length) return <p className="reportsEmpty">Sin citas registradas aún.</p>;
  const max = Math.max(...data.map((d) => d.value));
  const lastIdx = data.length - 1;

  return (
    <div className="monthlyBars">
      {data.map((item, idx) => {
        const pct = (item.value / max) * 100;
        const isCurrent = idx === lastIdx;
        const intensityClass =
          pct >= 90 ? "monthlyBarFill--high"
          : pct >= 60 ? "monthlyBarFill--mid"
          : "monthlyBarFill--low";

        return (
          <div key={`${item.month}-${idx}`} className={`monthlyBarCol ${isCurrent ? "monthlyBarCol--current" : ""}`}>
            <span className="monthlyBarValue">{item.value}</span>
            <div className="monthlyBarTrack">
              <div
                className={`monthlyBarFill ${intensityClass} ${isCurrent ? "monthlyBarFill--current" : ""}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="monthlyBarLabel">{item.month}</span>
            {isCurrent && <span className="monthlyCurrentDot" />}
          </div>
        );
      })}
    </div>
  );
}

function ClientTable({ data }) {
  if (!data.length) return <p className="reportsEmpty">Sin clientes registrados aún.</p>;
  const maxSpent = Math.max(...data.map((d) => d.spent)) || 1;

  return (
    <div className="clientTable">
      <div className="clientTableHead">
        <span>Cliente</span>
        <span>Visitas</span>
        <span>Gasto total</span>
        <span>Ticket promedio</span>
      </div>

      {data.map((client, idx) => (
        <div key={`${client.name}-${idx}`} className="clientTableRow">
          <div className="clientNameCell">
            <div
              className="clientAvatar"
              style={{ background: client.color, "--c": client.color }}
            >
              {client.initials}
            </div>
            <div>
              <strong className="clientNameText">{client.name}</strong>
              {idx === 0 && <span className="clientTopBadge">Top cliente</span>}
            </div>
          </div>

          <span className="clientVisitsCell">
            <strong>{client.visits}</strong>
            <span className="clientVisitsUnit">visitas</span>
          </span>

          <div className="clientSpentCell">
            <strong>{formatCurrency(client.spent)}</strong>
            <div className="clientSpentBar">
              <div
                className="clientSpentFill"
                style={{ width: `${(client.spent / maxSpent) * 100}%`, background: client.color }}
              />
            </div>
          </div>

          <span className="clientFavChip">
            {client.visits > 0 ? formatCurrency(client.spent / client.visits) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function AdminReports() {
  const [periodo, setPeriodo] = useState("Mes");

  const [ganancias, setGanancias] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [citasPorMes, setCitasPorMes] = useState([]);
  const [clientesFrec, setClientesFrec] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-fetch de ganancias cuando cambia el periodo
  useEffect(() => {
    const { inicio, fin } = rangoDePeriodo(periodo);
    getReporteGanancias(inicio, fin)
      .then(setGanancias)
      .catch((e) => setError(e.message));
  }, [periodo]);

  // Fetch inicial del resto de reportes (no dependen de periodo)
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [serv, citas, clientes] = await Promise.all([
          getReporteServicios(),
          getReporteCitasPorMes(),
          getReporteClientesFrecuentes(),
        ]);
        if (cancelado) return;
        setServicios(serv);
        setCitasPorMes(citas);
        setClientesFrec(clientes);
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  if (loading) {
    return (
      <section className="reportsView">
        <p className="reportsEmpty">Cargando reportes…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="reportsView">
        <p className="reportsEmpty reportsError">No se pudieron cargar los reportes: {error}</p>
      </section>
    );
  }

  /* ─── Derivar datos a la forma que esperan los sub-componentes ─── */

  const totalCitas = citasPorMes.reduce((s, m) => s + (m.Cantidad || 0), 0);
  const totalGanancias = ganancias?.Total_Ganancias || 0;
  const totalVentas    = ganancias?.Total_Ventas    || 0;
  const totalAnticipos = ganancias?.Total_Anticipos || 0;
  const ticketPromedio = totalVentas > 0 ? totalGanancias / totalVentas : 0;
  const servicioTop    = servicios[0] || null;

  const KPI_CARDS = [
    {
      id: "income",
      label: "Ingresos del periodo",
      value: formatCurrency(totalGanancias),
      trend: null,
      trendLabel: `${totalVentas} ventas registradas`,
      accent: "orange",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "Citas registradas",
      value: String(totalCitas),
      trend: null,
      trendLabel: "Histórico completo",
      accent: "blue",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: "ticket",
      label: "Ticket promedio",
      value: formatCurrency(ticketPromedio),
      trend: null,
      trendLabel: `Sobre ${totalVentas} ventas`,
      accent: "green",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 10V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-2"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      id: "topService",
      label: "Servicio más solicitado",
      value: servicioTop?.Estilo || "—",
      trend: null,
      trendLabel: servicioTop
        ? `${servicioTop.Cantidad} sesiones · ${formatCurrency(servicioTop.Ingreso_Total)}`
        : "Sin datos aún",
      accent: "purple",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const serviciosUI = servicios.map((s) => ({
    name:   s.Estilo,
    qty:    s.Cantidad,
    income: s.Ingreso_Total,
  }));

  const citasMesUI = citasPorMes.map((m) => ({
    month: NOMBRES_MES[m.Mes - 1] || `M${m.Mes}`,
    value: m.Cantidad,
  }));

  const clientesUI = clientesFrec.slice(0, 5).map((c, idx) => ({
    name:     c.Cliente,
    initials: iniciales(c.Cliente),
    color:    COLORES_AVATAR[idx % COLORES_AVATAR.length],
    visits:   c.Total_Citas,
    spent:    c.Total_Gastado,
  }));

  const { inicio, fin } = rangoDePeriodo(periodo);
  const rangoLabel = inicio && fin ? `${inicio} — ${fin}` : "Todos los registros";

  return (
    <section className="reportsView">

      {/* ── HERO ── */}
      <div className="reportsHero">
        <div className="reportsHeroCopy">
          <p className="reportsEyebrow">Panel administrativo</p>
          <h2 className="reportsTitle">Reportes</h2>
          <p className="reportsIntro">
            Visualiza ingresos, actividad del estudio, estilos con mayor demanda y
            clientes con más recurrencia.
          </p>

          <div className="heroQuickStats">
            <div className="heroQuickStat">
              <span className="heroQuickStatVal">{formatCurrency(totalGanancias)}</span>
              <span className="heroQuickStatLabel">Ingresos del periodo</span>
            </div>
            <div className="heroQuickStatDivider" />
            <div className="heroQuickStat">
              <span className="heroQuickStatVal">{totalCitas}</span>
              <span className="heroQuickStatLabel">Citas totales</span>
            </div>
            <div className="heroQuickStatDivider" />
            <div className="heroQuickStat">
              <span className="heroQuickStatVal">{servicios.length}</span>
              <span className="heroQuickStatLabel">Estilos registrados</span>
            </div>
          </div>
        </div>

        <div className="reportsFiltersCard">
          <div className="reportsFiltersTop">
            <span className="reportsFiltersLabel">Periodo de ingresos</span>
            <div className="reportsPeriodSwitch">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`reportsPeriodBtn ${option === periodo ? "reportsPeriodBtnActive" : ""}`}
                  onClick={() => setPeriodo(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="reportsRangePreview">
            <div className="rangePreviewRow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="reportsRangeKey">Rango activo</span>
            </div>
            <strong className="reportsRangeValue">{rangoLabel}</strong>
            <span className="reportsRangeDays">Aplica solo al reporte de ingresos</span>
          </div>

          <div className="reportsStatusRow">
            <span className="statusDot statusDot--live" />
            <span className="statusText">Datos en vivo</span>
            <span className="statusTime">desde MongoDB</span>
          </div>
        </div>
      </div>

      {/* ── KPI GRID ── */}
      <div className="reportsKpiGrid">
        {KPI_CARDS.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </div>

      {/* ── REPORTE 1 + 2 ── */}
      <div className="reportsGrid reportsGrid--top">

        {/* Reporte 1: Resumen Financiero */}
        <article className="reportsCard reportsCard--wide">
          <div className="reportsCardHead">
            <div>
              <p className="reportsCardKicker">Reporte 1 · Ingresos</p>
              <h3 className="reportsCardTitle">Resumen financiero del periodo</h3>
            </div>
            <span className="reportsBadge reportsBadge--orange">{periodo}</span>
          </div>

          <div className="finSummary">
            <div className="finSummaryItem finSummaryItem--main">
              <span className="finSummaryLabel">Ganancia total</span>
              <strong className="finSummaryValue">{formatCurrency(totalGanancias)}</strong>
            </div>
            <div className="finSummaryItem">
              <span className="finSummaryLabel">Anticipos cobrados</span>
              <strong className="finSummaryValue">{formatCurrency(totalAnticipos)}</strong>
            </div>
            <div className="finSummaryItem">
              <span className="finSummaryLabel">Ventas registradas</span>
              <strong className="finSummaryValue">{totalVentas}</strong>
            </div>
          </div>

          <div className="reportsInsight">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span>
              <strong>Insight:</strong>{" "}
              {totalVentas > 0
                ? `Ticket promedio de ${formatCurrency(ticketPromedio)} por venta en el periodo seleccionado.`
                : "No hay ventas registradas en el periodo seleccionado."}
            </span>
          </div>
        </article>

        {/* Reporte 2: Servicios */}
        <article className="reportsCard">
          <div className="reportsCardHead">
            <div>
              <p className="reportsCardKicker">Reporte 2 · Servicios</p>
              <h3 className="reportsCardTitle">Estilos más solicitados</h3>
            </div>
            <span className="reportsBadge reportsBadge--gold">Ranking</span>
          </div>

          <ServicesRank data={serviciosUI} />

          {servicioTop && (
            <div className="reportsMiniNote">
              <strong>{servicioTop.Estilo}</strong> lidera con {servicioTop.Cantidad} sesiones registradas.
            </div>
          )}
        </article>
      </div>

      {/* ── REPORTE 3 + 4 ── */}
      <div className="reportsGrid reportsGrid--bottom">

        {/* Reporte 3: Citas por mes */}
        <article className="reportsCard">
          <div className="reportsCardHead">
            <div>
              <p className="reportsCardKicker">Reporte 3 · Actividad</p>
              <h3 className="reportsCardTitle">Citas por mes</h3>
            </div>
            <div className="chartLegend">
              <span className="legendDot legendDot--low" /> Baja
              <span className="legendDot legendDot--mid" /> Media
              <span className="legendDot legendDot--high" /> Alta
            </div>
          </div>

          <MonthlyChart data={citasMesUI} />

          <div className="reportsMiniNote">
            Total acumulado: <strong>{totalCitas}</strong> citas en {citasPorMes.length} meses con actividad.
          </div>
        </article>

        {/* Reporte 4: Clientes frecuentes */}
        <article className="reportsCard">
          <div className="reportsCardHead">
            <div>
              <p className="reportsCardKicker">Reporte 4 · Clientes</p>
              <h3 className="reportsCardTitle">Clientes más frecuentes</h3>
            </div>
            <span className="reportsBadge reportsBadge--purple">Fidelización</span>
          </div>

          <ClientTable data={clientesUI} />

          {clientesUI[0] && (
            <div className="reportsMiniNote">
              <strong>{clientesUI[0].name}</strong> lidera en recurrencia con {clientesUI[0].visits} visitas.
            </div>
          )}
        </article>
      </div>

    </section>
  );
}
