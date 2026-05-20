let _nextNum = 1;

export const employeeService = {
  generateId() {
    const year = new Date().getFullYear();
    const suffix = String(Date.now()).slice(-4);
    return `INK-${year}-${String(_nextNum++).padStart(3, "0")}${suffix}`;
  },
};

export function calcAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
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
