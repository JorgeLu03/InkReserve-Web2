import { INITIAL_EMPLOYEES } from "../data/employeesMock";

/*
 * employeeService — DB-ready service layer
 * ─────────────────────────────────────────────────────────────────────────
 * Currently backed by in-memory state (mock data).
 * To connect a real database, replace each function body with the
 * appropriate API call (fetch / axios / supabase / etc.).
 * All functions are synchronous for now but can be made async without
 * changing call sites — just add async/await where needed.
 *
 * Example real-backend replacement for getAll():
 *   getAll: async () => {
 *     const res = await fetch("/api/employees");
 *     return res.json();
 *   }
 * ─────────────────────────────────────────────────────────────────────────
 */

let _nextNum = INITIAL_EMPLOYEES.length + 1;

export const employeeService = {
  generateId() {
    const year = new Date().getFullYear();
    return `INK-${year}-${String(_nextNum++).padStart(3, "0")}`;
  },
};

export function calcAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date("2026-03-03");
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function formatDob(dateOfBirth) {
  if (!dateOfBirth) return "—";
  const [y, m, d] = dateOfBirth.split("-");
  return `${d}/${m}/${y}`;
}
