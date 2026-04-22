import "./AdminReports.css";

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const PERIOD_OPTIONS = ["Hoy", "Semana", "Mes", "Año", "Personalizado"];

const KPI_CARDS = [
  {
    id: "income",
    label: "Ingresos del periodo",
    value: "$48,600",
    rawValue: 48600,
    trend: +12.4,
    trendLabel: "vs mes anterior",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: "orange",
  },
  {
    id: "appointments",
    label: "Citas registradas",
    value: "36",
    rawValue: 36,
    trend: +8.2,
    trendLabel: "vs mes anterior",
    breakdown: [
      { label: "Completadas", value: 28, color: "green" },
      { label: "Pendientes",  value: 5,  color: "amber" },
      { label: "Canceladas",  value: 3,  color: "red"   },
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    accent: "blue",
  },
  {
    id: "ticket",
    label: "Ticket promedio",
    value: "$1,350",
    rawValue: 1350,
    trend: +3.6,
    trendLabel: "vs mes anterior",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 10V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-2"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    accent: "green",
  },
  {
    id: "artist",
    label: "Artista más productivo",
    value: "Diego R.",
    rawValue: null,
    trend: null,
    trendLabel: "12 citas · $18,400 generados",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    accent: "purple",
  },
];

const REVENUE_SERIES = [
  { label: "Sem 1", value: 8200  },
  { label: "Sem 2", value: 11400 },
  { label: "Sem 3", value: 9800  },
  { label: "Sem 4", value: 14600 },
  { label: "Sem 5", value: 4600  },
];

const TOP_SERVICES = [
  { name: "Blackwork",      qty: 14, income: 19600 },
  { name: "Fine Line",      qty: 9,  income: 10800 },
  { name: "Neotradicional", qty: 6,  income: 9600  },
  { name: "Geométrico",     qty: 4,  income: 5200  },
  { name: "Acuarela",       qty: 3,  income: 3400  },
];

const MONTHLY_APPOINTMENTS = [
  { month: "Ene", value: 18 },
  { month: "Feb", value: 22 },
  { month: "Mar", value: 27 },
  { month: "Abr", value: 24 },
  { month: "May", value: 31 },
  { month: "Jun", value: 29 },
  { month: "Jul", value: 34 },
  { month: "Ago", value: 30 },
];

const TOP_CLIENTS = [
  { name: "Mariana López",    initials: "ML", color: "#7c3aed", visits: 6, spent: 12400, favorite: "Blackwork"      },
  { name: "Carlos Hernández", initials: "CH", color: "#0ea5e9", visits: 5, spent: 9800,  favorite: "Fine Line"      },
  { name: "Valeria Torres",   initials: "VT", color: "#16a34a", visits: 4, spent: 9100,  favorite: "Neotradicional" },
  { name: "José Ramírez",     initials: "JR", color: "#d97706", visits: 4, spent: 7600,  favorite: "Geométrico"     },
];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
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
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

/* Trend chip */
function TrendBadge({ value, label }) {
  if (value === null) return <span className="kpiTrendNeutral">{label}</span>;
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

/* KPI Card */
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

      {card.breakdown && (
        <div className="kpiBreakdown">
          {card.breakdown.map((b) => (
            <span key={b.label} className={`kpiBreakdownChip kpiBreakdownChip--${b.color}`}>
              <span className="kpiBreakdownDot" />
              {b.value} {b.label}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

/* Revenue bar chart */
function RevenueChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const GRID_LINES = [0, 25, 50, 75, 100];

  return (
    <div className="revenueChartWrap">
      {/* Y-axis grid */}
      <div className="chartGridLines" aria-hidden="true">
        {GRID_LINES.map((pct) => (
          <div
            key={pct}
            className="chartGridLine"
            style={{ bottom: `${pct}%` }}
          >
            <span className="chartGridValue">
              {pct === 0 ? "$0" : formatCurrency((max * pct) / 100)}
            </span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="revenueChart">
        {data.map((item) => {
          const pct = (item.value / max) * 100;
          const isMax = item.value === max;
          const share = ((item.value / total) * 100).toFixed(0);

          return (
            <div key={item.label} className="revenueBarCol">
              <div className={`revenueBarTrack ${isMax ? "revenueBarTrack--peak" : ""}`}>
                {isMax && (
                  <span className="revenuePeakBadge">Máximo</span>
                )}
                <div
                  className={`revenueBarFill ${isMax ? "revenueBarFill--peak" : ""}`}
                  style={{ height: `${pct}%` }}
                >
                  <span className="revenueBarTooltip">
                    <strong>{formatCurrency(item.value)}</strong>
                    <span>{share}% del total</span>
                  </span>
                </div>
              </div>
              <span className="revenueBarLabel">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Services ranking */
function ServicesRank({ data }) {
  const maxQty = Math.max(...data.map((d) => d.qty));
  const totalIncome = data.reduce((s, d) => s + d.income, 0);

  return (
    <div className="serviceRankList">
      {data.map((service, idx) => {
        const rank = RANK_COLORS[idx] || RANK_COLORS[3];
        const incomePct = ((service.income / totalIncome) * 100).toFixed(0);

        return (
          <div
            key={service.name}
            className="serviceRankItem"
            style={{ "--rank-bg": rank.bg }}
          >
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
                style={{
                  width: `${(service.qty / maxQty) * 100}%`,
                  background: rank.bar,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Monthly appointments chart */
function MonthlyChart({ data }) {
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
          <div key={item.month} className={`monthlyBarCol ${isCurrent ? "monthlyBarCol--current" : ""}`}>
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

/* Client table */
function ClientTable({ data }) {
  const maxSpent = Math.max(...data.map((d) => d.spent));

  return (
    <div className="clientTable">
      <div className="clientTableHead">
        <span>Cliente</span>
        <span>Visitas</span>
        <span>Gasto total</span>
        <span>Estilo preferido</span>
      </div>

      {data.map((client, idx) => (
        <div key={client.name} className="clientTableRow">
          {/* Avatar + nombre */}
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

          {/* Visitas */}
          <span className="clientVisitsCell">
            <strong>{client.visits}</strong>
            <span className="clientVisitsUnit">visitas</span>
          </span>

          {/* Gasto con barra inline */}
          <div className="clientSpentCell">
            <strong>{formatCurrency(client.spent)}</strong>
            <div className="clientSpentBar">
              <div
                className="clientSpentFill"
                style={{
                  width: `${(client.spent / maxSpent) * 100}%`,
                  background: client.color,
                }}
              />
            </div>
          </div>

          {/* Preferencia */}
          <span className="clientFavChip">{client.favorite}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AdminReports() {
  const selectedPeriod = "Mes";
  const totalRevenue = REVENUE_SERIES.reduce((s, d) => s + d.value, 0);
  const totalAppointments = MONTHLY_APPOINTMENTS.reduce((s, d) => s + d.value, 0);

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

          {/* Quick stats strip */}
          <div className="heroQuickStats">
            <div className="heroQuickStat">
              <span className="heroQuickStatVal">{formatCurrency(totalRevenue)}</span>
              <span className="heroQuickStatLabel">Ingresos acumulados (5 sem.)</span>
            </div>
            <div className="heroQuickStatDivider" />
            <div className="heroQuickStat">
              <span className="heroQuickStatVal">{totalAppointments}</span>
              <span className="heroQuickStatLabel">Citas en el año (8 meses)</span>
            </div>
            <div className="heroQuickStatDivider" />
            <div className="heroQuickStat">
              <span className="heroQuickStatVal">5</span>
              <span className="heroQuickStatLabel">Estilos activos</span>
            </div>
          </div>
        </div>

        <div className="reportsFiltersCard">
          <div className="reportsFiltersTop">
            <span className="reportsFiltersLabel">Periodo de análisis</span>
            <div className="reportsPeriodSwitch">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`reportsPeriodBtn ${option === selectedPeriod ? "reportsPeriodBtnActive" : ""}`}
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
            <strong className="reportsRangeValue">01 Mar 2026 — 31 Mar 2026</strong>
            <span className="reportsRangeDays">31 días · 5 semanas completas</span>
          </div>

          <div className="reportsStatusRow">
            <span className="statusDot statusDot--live" />
            <span className="statusText">Datos actualizados</span>
            <span className="statusTime">hace 2 min</span>
          </div>
        </div>
      </div>

      {/* ── KPI GRID ── */}
      <div className="reportsKpiGrid">
        {KPI_CARDS.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="reportsGrid reportsGrid--top">

        {/* Revenue Chart */}
        <article className="reportsCard reportsCard--wide">
          <div className="reportsCardHead">
            <div>
              <p className="reportsCardKicker">Reporte 1 · Ingresos</p>
              <h3 className="reportsCardTitle">Ganancia total por semana</h3>
            </div>
            <div className="cardHeadRight">
              <span className="reportsBadge reportsBadge--orange">ingresos</span>
              <span className="cardTotalPill">{formatCurrency(totalRevenue)} total</span>
            </div>
          </div>

          <RevenueChart data={REVENUE_SERIES} />

          <div className="reportsInsight">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span>
              <strong>Insight:</strong> La semana 4 fue la más rentable con{" "}
              {formatCurrency(14600)} — 30% más que el promedio del mes.
            </span>
          </div>
        </article>

        {/* Services Rank */}
        <article className="reportsCard">
          <div className="reportsCardHead">
            <div>
              <p className="reportsCardKicker">Reporte 2 · Servicios</p>
              <h3 className="reportsCardTitle">Estilos más solicitados</h3>
            </div>
            <span className="reportsBadge reportsBadge--gold">Ranking</span>
          </div>

          <ServicesRank data={TOP_SERVICES} />

          <div className="reportsMiniNote">
            <strong>Blackwork</strong> lidera con el 40% del ingreso total del periodo.
          </div>
        </article>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="reportsGrid reportsGrid--bottom">

        {/* Monthly appointments */}
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

          <MonthlyChart data={MONTHLY_APPOINTMENTS} />

          <div className="reportsMiniNote">
            Crecimiento sostenido: <strong>+88%</strong> de Ene a Jul. Agosto mantiene
            el nivel alto con 30 citas.
          </div>
        </article>

        {/* Clients */}
        <article className="reportsCard">
          <div className="reportsCardHead">
            <div>
              <p className="reportsCardKicker">Reporte 4 · Clientes</p>
              <h3 className="reportsCardTitle">Clientes más frecuentes</h3>
            </div>
            <span className="reportsBadge reportsBadge--purple">Fidelización</span>
          </div>

          <ClientTable data={TOP_CLIENTS} />

          <div className="reportsMiniNote">
            <strong>Mariana López</strong> lidera en recurrencia y gasto acumulado.
          </div>
        </article>
      </div>

    </section>
  );
}