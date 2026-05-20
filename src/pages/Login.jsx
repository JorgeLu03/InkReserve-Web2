import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Login({ onGoRegister, onLoginSuccess }) {
  const [role, setRole] = useState("user"); // "user" | "admin"
  const [form, setForm] = useState({
    email: "",
    password: "",
<<<<<<< HEAD
<<<<<<< HEAD
=======
    remember: false,
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
=======
    remember: false,
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
  });

  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate() {
    const errors = {};

    const email = (form.email || "").trim();
    const password = form.password || "";

    if (!email) {
      errors.email = "El correo es obligatorio.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Ingresa un correo válido.";
      }
    }

    if (!password.trim()) {
      errors.password = "La contraseña es obligatoria.";
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors,
    };
  }

  const validation = useMemo(() => validate(), [form.email, form.password]);

  function markAllTouched() {
    setTouched({
      email: true,
      password: true,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    markAllTouched();

    const v = validate();
    if (!v.ok) {
      await MySwal.fire({
        icon: "error",
        title: "Faltan datos",
        text: "Completa correctamente los campos para iniciar sesión.",
        confirmButtonText: "Ok",
        confirmButtonColor: "#d6762a",
        background: "#f4efe7",
        color: "#1b1b1e",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
          text: data?.message || "Correo o contraseña incorrectos.",
          confirmButtonText: "Ok",
          confirmButtonColor: "#d6762a",
          background: "#f4efe7",
          color: "#1b1b1e",
        });
        return;
      }

      const resolvedRole = data?.Es_Admin ? "admin" : "user";

      // Validación del toggle Admin / Usuario
      if (resolvedRole !== role) {
        await MySwal.fire({
          icon: "error",
          title: "Rol incorrecto",
          text:
            role === "admin"
              ? "Esta cuenta no tiene permisos de administrador."
              : "Esta cuenta no corresponde al rol de usuario.",
          confirmButtonText: "Ok",
          confirmButtonColor: "#d6762a",
          background: "#f4efe7",
          color: "#1b1b1e",
        });
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      localStorage.setItem("nombre", data?.Nombre_Completo ?? "");
      localStorage.setItem("correo", form.email.trim());
      localStorage.setItem("rol", resolvedRole);

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
      if (form.remember) {
        localStorage.setItem("remember_email", form.email.trim());
      } else {
        localStorage.removeItem("remember_email");
      }

<<<<<<< HEAD
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
=======
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
      await MySwal.fire({
        icon: "success",
        title: "Ingreso correcto",
        text: `Bienvenido, ${data?.Nombre_Completo ?? form.email.trim()}`,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#d6762a",
        background: "#f4efe7",
        color: "#1b1b1e",
      });

      onLoginSuccess?.(resolvedRole);
    } catch (error) {
      await MySwal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.",
        confirmButtonText: "Ok",
        confirmButtonColor: "#d6762a",
        background: "#f4efe7",
        color: "#1b1b1e",
      });
    } finally {
      setLoading(false);
    }
  }

  const emailError = touched.email ? validation.errors.email : "";
  const passwordError = touched.password ? validation.errors.password : "";

  return (
    <div className="authScreen">
      <div className="authCard">
        <img src="/assets/plant-top-left.png" alt="" className="decor decorTopLeft" />
        <img src="/assets/plant-top-right.png" alt="" className="decor decorTopRight" />
        <img src="/assets/plant-bottom-left.png" alt="" className="decor decorBottomLeft" />
        <img src="/assets/plant-bottom-right.png" alt="" className="decor decorBottomRight" />

        <div className="brandRow">
          <img src="/assets/Logo.png" alt="InkReserve" className="brandLogo" />
        </div>

        <h1 className="title">Iniciar sesión</h1>
        <p className="subtitle">Accede a tu cuenta para continuar.</p>

        <div className="roleToggle">
          <button
            type="button"
            className={`roleBtn ${role === "admin" ? "roleBtnActive" : "roleBtnGhost"}`}
            onClick={() => setRole("admin")}
            aria-pressed={role === "admin"}
          >
            Admin
          </button>

          <button
            type="button"
            className={`roleBtn ${role === "user" ? "roleBtnActive" : "roleBtnGhost"}`}
            onClick={() => setRole("user")}
            aria-pressed={role === "user"}
          >
            Usuario
          </button>
        </div>

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="login-email">
              Correo electrónico
            </label>

            <div className={`inputWrap ${emailError ? "inputWrapError" : ""}`}>
              <img
                src="/assets/269265_envelope-icon.png"
                alt=""
                className="inputIcon"
              />

              <input
                id="login-email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@dominio.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              />
            </div>

            {emailError ? <span className="errorText">{emailError}</span> : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="login-password">
              Contraseña
            </label>

            <div className={`inputWrap ${passwordError ? "inputWrapError" : ""}`}>
              <img
                src="/assets/269326_lock-icon.png"
                alt=""
                className="inputIcon"
              />

              <input
                id="login-password"
                className="input"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              />

              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowPass((prev) => !prev)}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.58 10.58A2 2 0 0013.42 13.42"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-0.55 1.22-1.35 2.35-2.35 3.31"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6.71 6.7C4.69 7.82 3.13 9.64 2 12c1.73 3.89 6 7 10 7 1.61 0 3.15-.31 4.56-.88"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 12C3.73 8.11 8 5 12 5s8.27 3.11 10 7c-1.73 3.89-6 7-10 7s-8.27-3.11-10-7z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>

            {passwordError ? <span className="errorText">{passwordError}</span> : null}
          </div>

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
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
              type="button"
              className="linkBtn"
              onClick={() => {
                MySwal.fire({
                  icon: "info",
                  title: "Recuperación de contraseña",
                  text: "Esta función todavía no está disponible.",
                  confirmButtonText: "Ok",
                  confirmButtonColor: "#d6762a",
                  background: "#f4efe7",
                  color: "#1b1b1e",
                });
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

<<<<<<< HEAD
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
=======
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
          <button type="submit" className="primaryBtn" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <div className="bottomText">
            <span>¿No tienes cuenta?</span>
            <button type="button" className="linkBtn" onClick={onGoRegister}>
              Crear una
            </button>
          </div>
        </form>
      </div>
    </div>
  );
<<<<<<< HEAD
<<<<<<< HEAD
}
=======
}
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
=======
}
>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
