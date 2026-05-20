const _now = new Date();
export const TODAY_ISO = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

export const ARTISTS = [
  { id: 1, name: "Diego Ramírez",  initials: "DR", color: "#f472b6", clockedIn: true  },
  { id: 2, name: "Valentina Cruz", initials: "VC", color: "#38bdf8", clockedIn: true  },
  { id: 3, name: "Marcos Leal",    initials: "ML", color: "#fb923c", clockedIn: false },
  { id: 4, name: "Sofía Reyes",    initials: "SR", color: "#4ade80", clockedIn: true  },
];

export const STYLES = [
  "Blackwork", "Acuarela", "Linework", "Realismo",
  "Tribal", "Neotradicional", "Japonés", "Geométrico",
];

export const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

export const TATTOO_KEYS = {
  Blackwork: "rose", Acuarela: "butterfly", Linework: "geometric",
  Realismo: "rose", Tribal: "geometric", Neotradicional: "rose",
  Japonés: "butterfly", Geométrico: "geometric",
};

export const CLIENT_COLORS = [
  "#c084fc", "#fb923c", "#34d399", "#38bdf8", "#f472b6", "#facc15", "#a78bfa", "#4ade80",
];

export const STATUSES = ["pending", "confirmed", "in_progress", "completed"];
export const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};
export const STATUS_COLORS = {
  pending: "#facc15",
  confirmed: "#38bdf8",
  in_progress: "#fb923c",
  completed: "#4ade80",
  cancelled: "#ef4444",
};

export const CANCELLATION_FEE_RATE = 0.30;
export const CANCELLATION_FEE_STATUSES = ["confirmed", "in_progress"];

export const INITIAL_APPOINTMENTS = [
  {
    id: 1, clientName: "Camila Torres", clientInitials: "CT", clientColor: "#c084fc",
    artistId: 1, date: "2026-03-03", time: "10:00", hours: 3,
    style: "Blackwork", dimensions: "15 × 10 cm", total: 2400,
    tattooKey: "rose", status: "confirmed",
    notes: "Cliente prefiere tinta negra pura. Diseño aprobado.",
  },
  {
    id: 2, clientName: "Rodrigo Méndez", clientInitials: "RM", clientColor: "#fb923c",
    artistId: 2, date: "2026-03-03", time: "12:30", hours: 2,
    style: "Acuarela", dimensions: "12 × 8 cm", total: 1800,
    tattooKey: "butterfly", status: "confirmed", notes: "",
  },
  {
    id: 3, clientName: "Sara Vidal", clientInitials: "SV", clientColor: "#34d399",
    artistId: 3, date: "2026-03-03", time: "15:00", hours: 4,
    style: "Linework", dimensions: "20 × 15 cm", total: 3200,
    tattooKey: "geometric", status: "pending",
    notes: "Primera sesión. Diseño pendiente de aprobación.",
  },
  {
    id: 4, clientName: "Lucía Fernández", clientInitials: "LF", clientColor: "#38bdf8",
    artistId: 1, date: "2026-03-05", time: "11:00", hours: 2,
    style: "Realismo", dimensions: "10 × 10 cm", total: 1600,
    tattooKey: "rose", status: "pending", notes: "",
  },
  {
    id: 5, clientName: "Daniel Mora", clientInitials: "DM", clientColor: "#f472b6",
    artistId: 4, date: "2026-03-07", time: "13:00", hours: 3,
    style: "Tribal", dimensions: "18 × 12 cm", total: 2200,
    tattooKey: "geometric", status: "pending", notes: "",
  },
  {
    id: 6, clientName: "Ana Ruiz", clientInitials: "AR", clientColor: "#facc15",
    artistId: 2, date: "2026-03-10", time: "10:00", hours: 5,
    style: "Japonés", dimensions: "25 × 20 cm", total: 4500,
    tattooKey: "butterfly", status: "pending", notes: "",
  },
  {
    id: 7, clientName: "Carlos Pérez", clientInitials: "CP", clientColor: "#a78bfa",
    artistId: 3, date: "2026-03-12", time: "14:00", hours: 2,
    style: "Geométrico", dimensions: "10 × 10 cm", total: 1500,
    tattooKey: "geometric", status: "pending", notes: "",
  },
  {
    id: 8, clientName: "Mariana López", clientInitials: "ML", clientColor: "#4ade80",
    artistId: 1, date: "2026-03-17", time: "09:00", hours: 4,
    style: "Neotradicional", dimensions: "22 × 16 cm", total: 3600,
    tattooKey: "rose", status: "pending", notes: "",
  },
];
