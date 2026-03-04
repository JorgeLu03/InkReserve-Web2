import { useState } from "react";
import "./index.css";
import { INITIAL_APPOINTMENTS } from "./data/mockData";
import { INITIAL_EMPLOYEES }    from "./data/employeesMock";
import { getCitas, createCita, updateCita } from "./services/apiService";

import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import Calendar          from "./pages/Calendar";
import CreateAppointment from "./pages/CreateAppointment";
import AppointmentDetail from "./pages/AppointmentDetail";
import AdminShell        from "./pages/admin/AdminShell";
import AdminDashboard    from "./pages/admin/AdminDashboard";

export default function App() {
  const [screen,        setScreen]        = useState("login");
  const [homeDashboard, setHomeDashboard] = useState("dashboard");
  const [detailId,      setDetailId]      = useState(null);
  const [adminSection,  setAdminSection]  = useState("employees");
  const [appointments,  setAppts]         = useState(INITIAL_APPOINTMENTS);
  const [employees,     setEmployees]     = useState(INITIAL_EMPLOYEES);

  const nav = {
    toDashboard      : ()   => setScreen("dashboard"),
    toCalendar       : ()   => setScreen("calendar"),
    toCreate         : ()   => setScreen("create"),
    toDetail         : (id) => { setDetailId(id); setScreen("detail"); },
    toLogin          : ()   => setScreen("login"),
    toRegister       : ()   => setScreen("register"),
    toAdminDashboard : ()   => setScreen("adminDashboard"),
    toAdminEmployees : ()   => { setAdminSection("employees"); setScreen("admin"); },
    toAdminClients   : ()   => { setAdminSection("clients");   setScreen("admin"); },
    toAdminWeek      : ()   => { setAdminSection("week");      setScreen("admin"); },
    toAdminMonth     : ()   => { setAdminSection("month");     setScreen("admin"); },
    goBack           : ()   => setScreen(homeDashboard),
  };

  async function addAppointment(appt) {
    const data = await createCita(appt); // deja que el error suba al caller
    setAppts((p) => [...p, data.cita]);
    return data.cita;
  }

  async function updateAppointment(id, changes) {
    // Actualización optimista inmediata (UI no se congela)
    setAppts((p) => p.map((a) => (String(a.id) === String(id) ? { ...a, ...changes } : a)));
    try {
      const data = await updateCita(id, changes);
      // Sincronizar con la versión real del servidor
      setAppts((p) => p.map((a) => (String(a.id) === String(data.cita.id) ? data.cita : a)));
    } catch {
      // La actualización optimista ya se aplicó, se deja como está
    }
  }

  function addEmployee(emp) {
    setEmployees((p) => [...p, emp]);
  }

  function updateEmployee(id, changes) {
    setEmployees((p) => p.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }

  async function handleLoginSuccess(role) {
    try {
      const citas = await getCitas();
      setAppts(citas);
    } catch {
      // Si falla la carga, se usan los datos mock como fallback
    }
    if (role === "admin") {
      setHomeDashboard("adminDashboard");
      setScreen("adminDashboard");
    } else {
      setHomeDashboard("dashboard");
      setScreen("dashboard");
    }
  }

  const detailAppt = appointments.find((a) => a.id === detailId) ?? null;

  switch (screen) {
    case "dashboard":
      return <Dashboard appointments={appointments} employees={employees} onUpdate={updateAppointment} nav={nav} />;
    case "calendar":
      return <Calendar  appointments={appointments} nav={nav} />;
    case "create":
      return <CreateAppointment nav={nav} onAdd={addAppointment} />;
    case "detail":
      return <AppointmentDetail appointment={detailAppt} nav={nav} onUpdate={updateAppointment} />;
    case "admin":
      return (
        <AdminShell
          employees={employees}
          appointments={appointments}
          onAddEmployee={addEmployee}
          onUpdateEmployee={updateEmployee}
          nav={nav}
          initialSection={adminSection}
        />
      );
    case "adminDashboard":
      return (
        <AdminDashboard
          appointments={appointments}
          employees={employees}
          nav={nav}
        />
      );
    case "register":
      return <Register onGoLogin={nav.toLogin} />;
    default:
      return (
        <Login
          onGoRegister={nav.toRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      );
  }
}
