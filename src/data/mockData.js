export const TODAY_ISO = new Date().toISOString().slice(0, 10);

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

