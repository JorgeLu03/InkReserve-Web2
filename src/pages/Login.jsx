import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Login({ onGoRegister, onLoginSuccess }) {
  const [role, setRole] = useState("user"); // "user" | "admin"
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function validate() {
    const errors = {};
    const email = (form.email || "").trim();
    const password = (form.password || "").trim();

    if (!email) errors.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Correo no válido.";

    if (!password) errors.password = "La contraseña es obligatoria.";

    return { ok: Object.keys(errors).length === 0, errors };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const v = validate();
    if (!v.ok) {
      MySwal.fire({
        icon: "error",
        title: "Faltan datos",
        text: "Completa los campos para iniciar sesión.",
        confirmButtonText: "Ok",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Correo_Electronico: form.email.trim(),
          Contrasena: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        await MySwal.fire({
          icon: "error",
          title: "Error al ingresar",
          text: data.message || "Credenciales incorrectas.",
          confirmButtonText: "Ok",
        });
        return;
      }

      // Guardar token en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("nombre", data.Nombre_Completo ?? "");

      const resolvedRole = data.Es_Admin ? "admin" : "user";

      await MySwal.fire({
        icon: "success",
        title: "Ingreso correcto",
        text: `Bienvenido, ${data.Nombre_Completo ?? form.email}`,
        confirmButtonText: "Continuar",
      });

      onLoginSuccess?.(resolvedRole);
    } catch {
      await MySwal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor. Intenta más tarde.",
        confirmButtonText: "Ok",
      });
    } finally {
      setLoading(false);
    }
  }

  const { errors } = validate();

  return (
    <div className="authScreen">
      <div className="authCard" role="main" aria-label="InkReserve Login">
        {/* Decoraciones */}
        <img className="decor decorTopLeft" src="/assets/plant-top-left.png" alt="" aria-hidden="true" />
        <img className="decor decorTopRight" src="/assets/plant-top-right.png" alt="" aria-hidden="true" />
        <img className="decor decorBottomLeft" src="/assets/plant-bottom-left.png" alt="" aria-hidden="true" />
        <img className="decor decorBottomRight" src="/assets/plant-bottom-right.png" alt="" aria-hidden="true" />

        {/* Header */}
        <div className="brandRow">
          <img className="brandLogo" src="/assets/logo.png" alt="InkReserve" />
        </div>

        <h1 className="title">Iniciar sesión</h1>
        <p className="subtitle">Accede a tu cuenta para continuar.</p>

        {/* Toggle Admin/Usuario (YA funciona) */}
        <div className="roleToggle" aria-label="Seleccionar rol">
          <button
            className={`roleBtn ${role === "admin" ? "roleBtnActive" : "roleBtnGhost"}`}
            type="button"
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
          <button
            className={`roleBtn ${role === "user" ? "roleBtnActive" : "roleBtnGhost"}`}
            type="button"
            onClick={() => setRole("user")}
          >
            Usuario
          </button>
        </div>

        {/* Form */}
        <form className="form" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span className="label">Correo electrónico</span>
            <div className={`inputWrap ${touched.email && errors.email ? "inputWrapError" : ""}`}>
              <img className="inputIcon" src="/assets/269265_envelope-icon.png" alt="" />
              <input
                className="input"
                placeholder="tucorreo@dominio.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              />
            </div>
            {touched.email && errors.email && <small className="errorText">{errors.email}</small>}
          </label>

          <label className="field">
            <span className="label">Contraseña</span>
            <div className={`inputWrap ${touched.password && errors.password ? "inputWrapError" : ""}`}>
              <img className="inputIcon" src="/assets/269326_lock-icon.png" alt="" />
              <input
                className="input"
                placeholder="••••••••"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              />
              <button
                className="eyeBtn"
                type="button"
                aria-label="Mostrar contraseña"
                onClick={() => setShowPass((v) => !v)}
              >
                👁
              </button>
            </div>
            {touched.password && errors.password && <small className="errorText">{errors.password}</small>}
          </label>

          <div className="rowBetween">
            <label className="remember">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setField("remember", e.target.checked)}
              />
              <span>Recuérdame</span>
            </label>

            <button
              className="linkBtn"
              type="button"
              onClick={() =>
                MySwal.fire({
                  icon: "info",
                  title: "Demo",
                  text: "Aquí después conectamos la recuperación de contraseña.",
                  confirmButtonText: "Ok",
                })
              }
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button className="primaryBtn" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <div className="bottomText">
            <span>¿No tienes cuenta?</span>
            <button className="linkBtn" type="button" onClick={onGoRegister}>
              Crear una
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}