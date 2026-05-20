const _now = new Date();

export const TODAY_ISO = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;

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

export const WORKING_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];