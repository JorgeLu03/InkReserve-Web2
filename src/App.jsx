import { useState } from "react";
import { Routes, Route, useNavigate, Navigate, useParams } from "react-router-dom";
import "./index.css";
import { INITIAL_APPOINTMENTS } from "./data/mockData";
import {
  getCitas,
  createCita,
  updateCita,
  getTatuadores,
  createTatuador,
  updateTatuador,
} from "./services/apiService";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import CreateAppointment from "./pages/CreateAppointment";
import AppointmentDetail from "./pages/AppointmentDetail";
import AdminShell from "./pages/admin/AdminShell";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import GestionUsuarios from "./pages/admin/GestionUsuarios";
import CatalogoServicios from "./pages/admin/CatalogoServicios";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  if (!token) return <Navigate to="/" replace />;
  if (adminOnly && rol !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function AppointmentDetailPage({ appointments, onUpdate, nav }) {
  const { id } = useParams();
  const appt = appointments.find((a) => String(a._id ?? a.id) === id) ?? null;
  return <AppointmentDetail appointment={appt} nav={nav} onUpdate={onUpdate} />;
}

function AdminShellPage({ employees, appointments, onAddEmployee, onUpdateEmployee, nav }) {
  const { section = "employees" } = useParams();
  return (
    <AdminShell
      employees={employees}
      appointments={appointments}
      onAddEmployee={onAddEmployee}
      onUpdateEmployee={onUpdateEmployee}
      nav={nav}
      initialSection={section}
    />
  );
}

export default function App() {
  const [appointments, setAppts] = useState(INITIAL_APPOINTMENTS);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol") ?? "user";

  const nav = {
    toDashboard: () => navigate("/dashboard"),
    toCalendar: () => navigate("/calendar"),
    toCreate: () => navigate("/cita/nueva"),
    toDetail: (id) => navigate(`/cita/${id}`),
    toLogin: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("rol");
      navigate("/");
    },
    toRegister: () => navigate("/register"),
    toAdminDashboard: () => navigate("/admin"),
    toAdminEmployees: () => navigate("/admin/employees"),
    toAdminClients: () => navigate("/admin/clients"),
    toAdminWeek: () => navigate("/admin/week"),
    toAdminMonth: () => navigate("/admin/month"),
    toAdminReports: () => navigate("/admin/reports"),
    toAdminUsuarios: () => navigate("/admin/usuarios"),
    toAdminServicios: () => navigate("/admin/servicios"),
    goBack: () => navigate(rol === "admin" ? "/admin" : "/dashboard"),
  };

  async function addAppointment(appt) {
    const data = await createCita(appt);
    setAppts((p) => [...p, data.cita]);
    return data.cita;
  }

  async function updateAppointment(id, changes) {
    setAppts((p) => p.map((a) => (String(a.id) === String(id) ? { ...a, ...changes } : a)));
    try {
      const data = await updateCita(id, changes);
      setAppts((p) => p.map((a) => (String(a.id) === String(data.cita.id) ? data.cita : a)));
    } catch {
      // Se mantiene actualización optimista
    }
  }

  async function addEmployee(emp) {
    try {
      const saved = await createTatuador(emp);
      setEmployees((p) => [...p, saved]);
    } catch {
      setEmployees((p) => [...p, emp]);
    }
  }

  async function updateEmployee(id, changes) {
    const emp = employees.find((e) => String(e._id ?? e.id) === String(id) || String(e.id) === String(id));
    setEmployees((p) =>
      p.map((e) =>
        String(e._id ?? e.id) === String(id) || String(e.id) === String(id)
          ? { ...e, ...changes }
          : e
      )
    );

    if (emp?._id) {
      try {
        const updated = await updateTatuador(emp._id, { ...emp, ...changes });
        setEmployees((p) => p.map((e) => (String(e._id) === String(updated._id) ? updated : e)));
      } catch {
        // Se mantiene actualización optimista
      }
    }
  }

  async function handleLoginSuccess(role) {
    const [citas, tats] = await Promise.allSettled([getCitas(), getTatuadores()]);
    if (citas.status === "fulfilled") setAppts(citas.value);
    if (tats.status === "fulfilled") setEmployees(tats.value);
    navigate(role === "admin" ? "/admin/reports" : "/dashboard");
  }

  return (
    <Routes>
      <Route path="/" element={<Login onGoRegister={nav.toRegister} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<Register onGoLogin={nav.toLogin} />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard appointments={appointments} employees={employees} onUpdate={updateAppointment} nav={nav} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar appointments={appointments} nav={nav} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cita/nueva"
        element={
          <ProtectedRoute>
            <CreateAppointment nav={nav} onAdd={addAppointment} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cita/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetailPage appointments={appointments} onUpdate={updateAppointment} nav={nav} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard appointments={appointments} employees={employees} nav={nav} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/:section"
        element={
          <ProtectedRoute adminOnly>
            <AdminShellPage
              employees={employees}
              appointments={appointments}
              onAddEmployee={addEmployee}
              onUpdateEmployee={updateEmployee}
              nav={nav}
            />
          </ProtectedRoute>
        }
      />

      <Route path="/preview/reports"   element={<AdminReports />} />
      <Route path="/preview/usuarios"  element={<GestionUsuarios />} />
      <Route path="/preview/servicios" element={<CatalogoServicios />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
