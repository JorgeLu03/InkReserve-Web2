export const SPECIALIZATION_OPTIONS = [
  "Fine Line", "Anime", "American Traditional", "Neotradicional",
  "Blackwork", "Realismo", "Acuarela", "Tribal", "Linework",
  "Geométrico", "New School", "Japonés",
];

export const WORKING_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const INITIAL_EMPLOYEES = [
  {
    id: "INK-2026-001", artistId: 1,
    name: "Diego Ramírez", initials: "DR", color: "#f472b6",
    photo: null, resume: null,
    dateOfBirth: "1995-04-12",
    rfc: "RADE950412HM0", curp: "RADE950412HDFRML09",
    specializations: ["Blackwork", "Linework", "Geométrico"],
    workingHours: { start: "10:00", end: "18:00", days: ["Lun", "Mar", "Mié", "Jue", "Vie"] },
    hourlyFee: 800, monthlySalary: 18000,
    portfolio: [], clockedIn: true, createdAt: "2024-01-15",
  },
  {
    id: "INK-2026-002", artistId: 2,
    name: "Valentina Cruz", initials: "VC", color: "#38bdf8",
    photo: null, resume: null,
    dateOfBirth: "1998-07-22",
    rfc: "CUVA980722MJ0", curp: "CUVA980722MDFRZL01",
    specializations: ["Acuarela", "Fine Line", "Japonés"],
    workingHours: { start: "09:00", end: "17:00", days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] },
    hourlyFee: 750, monthlySalary: 16500,
    portfolio: [], clockedIn: true, createdAt: "2024-03-20",
  },
  {
    id: "INK-2026-003", artistId: 3,
    name: "Marcos Leal", initials: "ML", color: "#fb923c",
    photo: null, resume: null,
    dateOfBirth: "1990-11-05",
    rfc: "LEAM901105HV0", curp: "LEAM901105HDFRCR08",
    specializations: ["Tribal", "American Traditional", "Neotradicional"],
    workingHours: { start: "11:00", end: "19:00", days: ["Mar", "Mié", "Jue", "Vie", "Sáb"] },
    hourlyFee: 900, monthlySalary: 20000,
    portfolio: [], clockedIn: false, createdAt: "2023-09-01",
  },
  {
    id: "INK-2026-004", artistId: 4,
    name: "Sofía Reyes", initials: "SR", color: "#4ade80",
    photo: null, resume: null,
    dateOfBirth: "2000-02-18",
    rfc: "RESF000218MJ0", curp: "RESF000218MDFYFS03",
    specializations: ["Realismo", "Fine Line", "Anime"],
    workingHours: { start: "10:00", end: "18:00", days: ["Lun", "Mié", "Jue", "Vie", "Sáb"] },
    hourlyFee: 700, monthlySalary: 15000,
    portfolio: [], clockedIn: true, createdAt: "2025-02-10",
  },
];
