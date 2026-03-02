export function validateRegister(form) {
  const errors = {};

  // 1) Nombre
  const fullName = (form.fullName || "").trim().replace(/\s+/g, " ");
  if (fullName.length < 4) errors.fullName = "Escribe tu nombre completo (mín. 4 caracteres).";
  else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(fullName))
    errors.fullName = "El nombre solo debe contener letras y espacios.";

  // 2) Email
  const email = (form.email || "").trim().toLowerCase();
  if (!email) errors.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Correo no válido.";

  // 3) Teléfono (México: 10 dígitos, o con +52 que normalizamos)
  const phoneDigits = (form.phone || "").replace(/\D/g, "");
  const normalizedPhone =
    phoneDigits.length === 12 && phoneDigits.startsWith("52") ? phoneDigits.slice(2) : phoneDigits;

  if (!phoneDigits) errors.phone = "El teléfono es obligatorio.";
  else if (normalizedPhone.length !== 10) errors.phone = "Teléfono no válido (deben ser 10 dígitos).";

  // 4) Password
  const password = form.password || "";
  if (password.length < 8) errors.password = "La contraseña debe tener mínimo 8 caracteres.";
  else {
    if (!/[a-z]/.test(password)) errors.password = "Debe incluir al menos una minúscula.";
    else if (!/[A-Z]/.test(password)) errors.password = "Debe incluir al menos una mayúscula.";
    else if (!/[0-9]/.test(password)) errors.password = "Debe incluir al menos un número.";
  }

  // 5) Confirmación
  const confirmPassword = form.confirmPassword || "";
  if (!confirmPassword) errors.confirmPassword = "Confirma tu contraseña.";
  else if (confirmPassword !== password) errors.confirmPassword = "Las contraseñas no coinciden.";

  const ok = Object.keys(errors).length === 0;

  // Payload listo para backend (sin mandar todavía)
  const payloadReady = {
    fullName,
    email,
    phone: normalizedPhone,
    password,
    role: "user",
  };

  return { ok, errors, payloadReady };
}