/* ===============================
   InkReserve — Login JS
   - Partículas sutiles
   - Toggle password
   - Validación + SweetAlert2 theme
   - Remember me (localStorage)
   =============================== */

(() => {
  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);

  const emailEl = $("#email");
  const passEl = $("#password");
  const rememberEl = $("#remember");
  const form = $("#loginForm");
  const btnLogin = $("#btnLogin");
  const togglePassword = $("#togglePassword");
  const forgotLink = $("#forgotLink");
  const goRegister = $("#goRegister");

  /* ---------- SweetAlert2 Theme ---------- */
  const InkSwal = Swal.mixin({
    buttonsStyling: false,
    backdrop: "rgba(10, 10, 14, .72)",
    customClass: {
      popup: "ir-swal",
      title: "ir-swal__title",
      htmlContainer: "ir-swal__text",
      confirmButton: "ir-swal__btn ir-swal__btn--confirm",
      cancelButton: "ir-swal__btn ir-swal__btn--cancel",
      icon: "ir-swal__icon"
    }
  });

  // Inyecta CSS de SweetAlert2 (para que NO tengas que tocar tu login.css)
  injectSwalStyles();

  function injectSwalStyles() {
    const css = `
      .ir-swal {
        position: relative;
        border-radius: 18px !important;
        padding: 22px 22px 18px !important;
        background:
          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0)),
          repeating-linear-gradient(
            45deg,
            rgba(255,255,255,.012) 0px,
            rgba(255,255,255,.012) 1px,
            transparent 1px,
            transparent 3px
          ),
          #15161c !important;
        color: #cfd6d3 !important;
        box-shadow: 0 30px 90px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.06) !important;
        overflow: hidden;
      }
      .ir-swal::before{
        content:"";
        position:absolute; inset:-40%;
        background:
          radial-gradient(circle at 30% 30%, rgba(225,59,140,.22), transparent 55%),
          radial-gradient(circle at 70% 70%, rgba(111,174,160,.18), transparent 55%);
        filter: blur(70px);
        pointer-events:none;
      }
      .ir-swal__title{
        font-family: 'Cinzel', serif !important;
        color: #8fbfb3 !important;
        letter-spacing: .08em !important;
      }
      .ir-swal__text{
        color: rgba(207,214,211,.82) !important;
        font-family: 'Inter', system-ui, sans-serif !important;
        line-height: 1.5 !important;
      }
      .ir-swal__btn{
        border: 0;
        border-radius: 14px;
        padding: 12px 14px;
        cursor: pointer;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: .82rem;
        letter-spacing: .16em;
        text-transform: uppercase;
        transition: transform .12s ease, filter .12s ease;
      }
      .ir-swal__btn:active{ transform: translateY(1px); }
      .ir-swal__btn--confirm{
        color: #fff;
        background: linear-gradient(135deg, #e13b8c, #ff6fb6);
        box-shadow: 0 12px 34px rgba(225,59,140,.35);
      }
      .ir-swal__btn--confirm:hover{ filter: brightness(1.05); }
      .ir-swal__btn--cancel{
        color: rgba(207,214,211,.9);
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.12);
      }
      .ir-swal__icon{
        filter: drop-shadow(0 10px 25px rgba(225,59,140,.25));
      }

      /* Barra superior sutil */
      .ir-swal .swal2-timer-progress-bar{
        background: linear-gradient(90deg, rgba(225,59,140,.9), rgba(111,174,160,.9)) !important;
      }
    `;
    const style = document.createElement("style");
    style.setAttribute("data-ir-swal", "true");
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- Remember me ---------- */
  const STORAGE_KEY = "inkreserve_remember";
  const STORAGE_EMAIL = "inkreserve_email";

  try {
    const remember = localStorage.getItem(STORAGE_KEY);
    const savedEmail = localStorage.getItem(STORAGE_EMAIL);

    if (remember === "1") rememberEl.checked = true;
    if (savedEmail) emailEl.value = savedEmail;
  } catch (_) {
    // si localStorage está bloqueado, no pasa nada
  }

  rememberEl?.addEventListener("change", () => {
    try {
      localStorage.setItem(STORAGE_KEY, rememberEl.checked ? "1" : "0");
      if (!rememberEl.checked) localStorage.removeItem(STORAGE_EMAIL);
    } catch (_) {}
  });

  /* ---------- Toggle password ---------- */
  togglePassword?.addEventListener("click", () => {
    const isPass = passEl.type === "password";
    passEl.type = isPass ? "text" : "password";
    const txt = togglePassword.querySelector(".ir-eyeBtn__txt");
    if (txt) txt.textContent = isPass ? "Ocultar" : "Ver";
  });

  /* ---------- Links extras (demo) ---------- */
  forgotLink?.addEventListener("click", (e) => {
    e.preventDefault();
    InkSwal.fire({
      icon: "info",
      title: "Recuperación",
      html: "Por ahora esto es una demo. Conéctalo luego a tu flujo de <b>reset password</b>.",
      confirmButtonText: "Entendido"
    });
  });

  goRegister?.addEventListener("click", (e) => {
    e.preventDefault();
    InkSwal.fire({
      icon: "question",
      title: "Registro",
      html: "¿Quieres que esta pantalla te mande a <b>Registro</b>?<br><span style='opacity:.75'>Puedo armarte esa ventana con el mismo estilo.</span>",
      showCancelButton: true,
      confirmButtonText: "Sí, crear registro",
      cancelButtonText: "Luego"
    });
  });

  /* ---------- Validación ---------- */
  const isValidEmail = (email) => {
    // simple pero decente
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  };

  const setLoading = (loading) => {
    if (!btnLogin) return;
    btnLogin.disabled = loading;
    btnLogin.style.opacity = loading ? "0.85" : "1";
    btnLogin.style.cursor = loading ? "not-allowed" : "pointer";
    btnLogin.textContent = loading ? "Procesando..." : "Iniciar sesión";
  };

  /* ---------- Submit (demo) ---------- */
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (emailEl.value || "").trim();
    const pass = passEl.value || "";

    // Guardar email si remember está activo
    if (rememberEl.checked) {
      try { localStorage.setItem(STORAGE_EMAIL, email); } catch (_) {}
    }

    // Validaciones
    if (!email || !pass) {
      InkSwal.fire({
        icon: "warning",
        title: "Faltan datos",
        html: "Completa <b>correo</b> y <b>contraseña</b> para continuar.",
        confirmButtonText: "Ok"
      });
      pulseCard();
      return;
    }

    if (!isValidEmail(email)) {
      InkSwal.fire({
        icon: "error",
        title: "Correo inválido",
        html: "Revisa el formato del correo. Ej: <b>tu@correo.com</b>.",
        confirmButtonText: "Corregir"
      });
      emailEl.focus();
      shake(emailEl);
      return;
    }

    if (pass.length < 6) {
      InkSwal.fire({
        icon: "error",
        title: "Contraseña muy corta",
        html: "Usa al menos <b>6</b> caracteres (recomendado 8+).",
        confirmButtonText: "Entiendo"
      });
      passEl.focus();
      shake(passEl);
      return;
    }

    // Simulación de login (aquí conectas tu fetch al backend)
    setLoading(true);

    try {
      // Demo delay
      await wait(700);

      // DEMO: credenciales ejemplo (cámbialo o bórralo cuando conectes backend)
      const DEMO_USER = "demo@inkreserve.com";
      const DEMO_PASS = "123456";

      if (email.toLowerCase() === DEMO_USER && pass === DEMO_PASS) {
        await InkSwal.fire({
          icon: "success",
          title: "¡Bienvenido!",
          html: "Inicio de sesión exitoso. <span style='opacity:.78'>Entrando a InkReserve…</span>",
          confirmButtonText: "Continuar",
          timer: 1600,
          timerProgressBar: true
        });

        // Redirección demo
        // window.location.href = "./dashboard.html";
        return;
      }

      // Si no coincide demo:
      InkSwal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        html: "Correo o contraseña incorrectos. <br><span style='opacity:.75'>Tip: demo@inkreserve.com / 123456</span>",
        confirmButtonText: "Intentar otra vez"
      });

      shakeCard();
    } catch (err) {
      InkSwal.fire({
        icon: "error",
        title: "Error",
        html: "Hubo un problema inesperado. Intenta nuevamente.",
        confirmButtonText: "Ok"
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  function wait(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  /* ---------- Micro-animaciones ---------- */
  function shake(el) {
    if (!el) return;
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0)" }
      ],
      { duration: 280, easing: "ease-out" }
    );
  }

  function shakeCard() {
    const card = document.querySelector(".ir-card");
    if (!card) return;
    card.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(0)" }
      ],
      { duration: 320, easing: "ease-out" }
    );
  }

  function pulseCard() {
    const card = document.querySelector(".ir-card");
    if (!card) return;
    card.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.01)" },
        { transform: "scale(1)" }
      ],
      { duration: 240, easing: "ease-out" }
    );
  }

  /* ===============================
     Partículas suaves (canvas)
     =============================== */
  const canvas = $("#irParticles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let particles = [];
    let rafId = null;

    const SETTINGS = {
      count: 70,             // pocas para que no distraiga
      speed: 0.18,
      drift: 0.35,
      radiusMin: 0.6,
      radiusMax: 2.2,
      linkDist: 140,         // líneas muy sutiles
      linkAlpha: 0.05,
      dotAlpha: 0.35
    };

    function resize() {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticles() {
      particles = Array.from({ length: SETTINGS.count }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-SETTINGS.speed, SETTINGS.speed),
        vy: rand(-SETTINGS.speed, SETTINGS.speed),
        r: rand(SETTINGS.radiusMin, SETTINGS.radiusMax),
        // mezcla sutil entre fucsia y verde
        hue: Math.random() < 0.5 ? 330 : 160,
        a: rand(0.15, SETTINGS.dotAlpha)
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // dots
      for (const p of particles) {
        p.x += p.vx + Math.sin(p.y * 0.002) * SETTINGS.drift * 0.06;
        p.y += p.vy + Math.cos(p.x * 0.002) * SETTINGS.drift * 0.06;

        // wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // links (muy sutil)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < SETTINGS.linkDist) {
            const t = 1 - dist / SETTINGS.linkDist;
            ctx.strokeStyle = `rgba(255, 255, 255, ${SETTINGS.linkAlpha * t})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(step);
    }

    function start() {
      resize();
      createParticles();
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(step);
    }

    window.addEventListener("resize", () => {
      // reacomoda sin parpadeos
      resize();
      createParticles();
    });

    // reduce motion support
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (prefersReduced?.matches) {
      // si el usuario no quiere animación, apagamos partículas
      canvas.style.display = "none";
    } else {
      start();
    }
  }
})();
