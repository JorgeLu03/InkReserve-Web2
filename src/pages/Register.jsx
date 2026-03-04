import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { validateRegister } from "../utils/validators";

const MySwal = withReactContent(Swal);

export default function Register({ onGoLogin }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);

  const validation = useMemo(() => validateRegister(form), [form]);
  const err = validation.errors;

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function touchAll() {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    touchAll();

    if (!validation.ok) {
      MySwal.fire({
        icon: "error",
        title: "Revisa tu información",
        text: "Hay campos con errores. Corrígelos para continuar.",
        confirmButtonText: "Ok",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nombre_Completo:    form.fullName.trim(),
          Correo_Electronico: form.email.trim(),
          Contrasena:         form.password,
          Telefono:           form.phone.trim(),
          Es_Admin:           false,
          Esta_Activo:        true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        await MySwal.fire({
          icon: "error",
          title: "Error al registrar",
          text: data.message || "No se pudo crear la cuenta.",
          confirmButtonText: "Ok",
        });
        return;
      }

      await MySwal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Tu cuenta fue registrada exitosamente. Ahora puedes iniciar sesión.",
        confirmButtonText: "Ir a iniciar sesión",
      });

      onGoLogin?.();
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

  return (
    <div className="authScreen">
      <div className="authCard" role="main" aria-label="InkReserve Register">
        {/* Decoraciones */}
        <img className="decor decorTopLeft" src="/assets/plant-top-left.png" alt="" aria-hidden="true" />
        <img className="decor decorTopRight" src="/assets/plant-top-right.png" alt="" aria-hidden="true" />
        <img className="decor decorBottomLeft" src="/assets/plant-bottom-left.png" alt="" aria-hidden="true" />
        <img className="decor decorBottomRight" src="/assets/plant-bottom-right.png" alt="" aria-hidden="true" />

        {/* Header */}
        <div className="brandRow">
          <img className="brandLogo" src="/assets/logo.png" alt="InkReserve" />
        </div>

        <h1 className="title">Crear cuenta</h1>
        <p className="subtitle">Crea tu cuenta para comenzar a gestionar tu estudio</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          {/* Nombre */}
          <label className="field">
            <span className="label">Nombre completo</span>
            <div className={`inputWrap ${touched.fullName && err.fullName ? "inputWrapError" : ""}`}>
              <img className="inputIcon" src="/assets/269275_user-icon.png" alt="" />
              <input
                className="input"
                placeholder="Nombre completo"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
              />
            </div>
            {touched.fullName && err.fullName && <small className="errorText">{err.fullName}</small>}
          </label>

          {/* Email */}
          <label className="field">
            <span className="label">Correo electrónico</span>
            <div className={`inputWrap ${touched.email && err.email ? "inputWrapError" : ""}`}>
              <img className="inputIcon" src="/assets/269265_envelope-icon.png" alt="" />
              <input
                className="input"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              />
            </div>
            {touched.email && err.email && <small className="errorText">{err.email}</small>}
          </label>

          {/* Teléfono */}
          <label className="field">
            <span className="label">Teléfono</span>
            <div className={`inputWrap ${touched.phone && err.phone ? "inputWrapError" : ""}`}>
              <img className="inputIcon" src="/assets/telephone_icon-icons.com_69286.png" alt="" />
              <input
                className="input"
                placeholder="Teléfono (10 dígitos)"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              />
            </div>
            {touched.phone && err.phone && <small className="errorText">{err.phone}</small>}
          </label>

          {/* Password */}
          <label className="field">
            <span className="label">Contraseña</span>
            <div className={`inputWrap ${touched.password && err.password ? "inputWrapError" : ""}`}>
              <img className="inputIcon" src="/assets/269326_lock-icon.png" alt="" />
              <input
                className="input"
                placeholder="Contraseña"
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
            {touched.password && err.password && <small className="errorText">{err.password}</small>}
          </label>

          {/* Confirm Password */}
          <label className="field">
            <span className="label">Confirmar contraseña</span>
            <div className={`inputWrap ${touched.confirmPassword && err.confirmPassword ? "inputWrapError" : ""}`}>
              <img className="inputIcon" src="/assets/269326_lock-icon.png" alt="" />
              <input
                className="input"
                placeholder="Confirmar contraseña"
                type={showPass2 ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
              />
              <button
                className="eyeBtn"
                type="button"
                aria-label="Mostrar contraseña"
                onClick={() => setShowPass2((v) => !v)}
              >
                👁
              </button>
            </div>
            {touched.confirmPassword && err.confirmPassword && (
              <small className="errorText">{err.confirmPassword}</small>
            )}
          </label>

          <button className="primaryBtn" type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </button>

          <div className="bottomText">
            <span>¿Ya tienes cuenta?</span>
            <button className="linkBtn" type="button" onClick={onGoLogin}>
              Inicia sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}