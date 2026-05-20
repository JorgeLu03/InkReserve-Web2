import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminShell.css";
import EmployeeList from "./EmployeeList";
import EmployeeDetail from "./EmployeeDetail";
import CreateEmployee from "./CreateEmployee";
import ClientList from "./ClientList";
import AdminAgenda from "./AdminAgenda";
import AdminReports from "./AdminReports";
import UserManagement from "./UserManagement";
import CategoryManagement from "./CategoryManagement";
import logo from "../../assets/logo.png";
const NAV_ITEMS = [
  {
    key: "employees",
    label: "Artistas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M1 14c0-3 2.2-5 5-5s5 2 5 5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="12" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.1" />
        <path
          d="M14 14c0-2.2-1.5-3.8-2-4"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "clients",
    label: "Clientes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="1.5"
          y="2"
          width="13"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="5.5" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.1" />
        <path
          d="M2 13c0-2 1.5-3 3.5-3s3.5 1 3.5 3"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="6"
          x2="13.5"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="8.5"
          x2="13.5"
          y2="8.5"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="11"
          x2="12"
          y2="11"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "week",
    label: "Agenda Semanal",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <line x1="1" y1="6.5" x2="15" y2="6.5" stroke="currentColor" strokeWidth="1.1" />
        <line x1="5.5" y1="1" x2="5.5" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="10.5" y1="1" x2="10.5" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="4" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="9" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "month",
    label: "Agenda Mensual",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <line x1="1" y1="6.5" x2="15" y2="6.5" stroke="currentColor" strokeWidth="1.1" />
        <line x1="5.5" y1="1" x2="5.5" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="10.5" y1="1" x2="10.5" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="4.5" cy="10.5" r="1" fill="currentColor" opacity=".5" />
        <circle cx="8" cy="10.5" r="1" fill="currentColor" opacity=".5" />
        <circle cx="11.5" cy="10.5" r="1" fill="currentColor" opacity=".5" />
      </svg>
    ),
  },
  {
    key: "users",
    label: "Usuarios",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M1 14c0-2.5 2-4.5 4.5-4.5S10 11.5 10 14"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="11.5" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.1" />
        <path
          d="M11 13c0-1.8 1-3.2 2.5-3.5"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "categories",
    label: "Categorías",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2.5 4.5L8 1.5l5.5 3-5.5 3-5.5-3z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 8L8 11l5.5-3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 11.5L8 14.5l5.5-3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "reports",
    label: "Reportes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M5 10.8V8.4M8 10.8V5.8M11 10.8V7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="4.5"
          y1="12.5"
          x2="11.8"
          y2="12.5"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const SECTION_TITLES = {
  employees: "Artistas",
  employeeDetail: "Perfil de Artista",
  createEmployee: "Nuevo Artista",
  clients: "Clientes",
  week: "Agenda Semanal",
  month: "Agenda Mensual",
  users: "Gestión de Usuarios",
  categories: "Categorías de Tatuaje",
  reports: "Reportes",
};

function topKey(section) {
  if (section === "employeeDetail" || section === "createEmployee") return "employees";
  return section;
}

export default function AdminShell({
  employees,
  appointments,
  onAddEmployee,
  onUpdateEmployee,
  nav,
  initialSection,
}) {
  const [section, setSection] = useState(initialSection ?? "employees");
  const [selEmp, setSelEmp] = useState(null);
<<<<<<< HEAD
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const adminNombre = localStorage.getItem("nombre") || "Administrador";
  const adminCorreo = localStorage.getItem("correo") || "";
  const adminInitials = adminNombre.trim().split(" ").filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join("");

=======
  const navigate = useNavigate();

>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
  function goDetail(emp) {
    setSelEmp(emp);
    setSection("employeeDetail");
  }

  function goCreate() {
    changeSection("createEmployee");
  }

  // Sincronizar cuando el prop cambia (navegación por URL)
  useEffect(() => {
    setSection(initialSection ?? "employees");
  }, [initialSection]);

  function changeSection(key) {
    setSection(key);
    navigate(`/admin/${key}`, { replace: true });
  }

  function goList() {
    changeSection("employees");
  }

  function handleAdd(emp) {
    onAddEmployee(emp);
    goList();
  }

  const isSubSection = section === "employeeDetail" || section === "createEmployee";

  return (
    <div className="adminScreen">
      <div className="adminBg" />

      <header className="adminHeader">
        <button className="iconBtn" onClick={nav.toAdminDashboard} aria-label="Volver al panel">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" />
            <polyline
              points="10.5,5.5 6.5,9 10.5,12.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

<<<<<<< HEAD
        <div className="adminHeaderCenter">
          <h1 className="adminTitle">{SECTION_TITLES[section]}</h1>
          <span className="adminHeaderDate">{new Date().toLocaleDateString("es-MX", { day: "numeric", month: "numeric", year: "numeric" })}</span>
        </div>

        <button className="adminProfileBtn" onClick={() => setProfileOpen(true)} aria-label="Ver perfil">
          <span className="adminProfileInitials">{adminInitials}</span>
        </button>
      </header>

      {/* ── PROFILE MODAL ── */}
      {profileOpen && (
        <div className="profileOverlay" onClick={() => setProfileOpen(false)}>
          <div className="profileModal" onClick={e => e.stopPropagation()}>
            <button className="profileModalClose" onClick={() => setProfileOpen(false)} aria-label="Cerrar">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="profileModalAvatar">{adminInitials}</div>
            <h3 className="profileModalName">{adminNombre}</h3>
            <p className="profileModalEmail">{adminCorreo}</p>

            <div className="profileModalBadge">Administrador</div>

            <div className="profileModalInfo">
              <div className="profileModalRow">
                <span className="profileModalLabel">Rol</span>
                <span className="profileModalValue">Administrador</span>
              </div>
              <div className="profileModalRow">
                <span className="profileModalLabel">Correo</span>
                <span className="profileModalValue">{adminCorreo || "—"}</span>
              </div>
              <div className="profileModalRow">
                <span className="profileModalLabel">Estado</span>
                <span className="profileModalValue profileModalActive">● Activo</span>
              </div>
            </div>

            <button className="profileModalLogout" onClick={nav.toLogin}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

=======
        <h1 className="adminTitle">{SECTION_TITLES[section]}</h1>
        <div style={{ width: 80 }} />
      </header>

>>>>>>> de7ba5106116ce9e4194491af23416fd43d42c85
      <div className="adminBody">
        <aside className="adminSidebar">
          <img src={logo} alt="InkReserve" className="adminSidebarLogo" />
          <p className="adminSidebarTagline">Panel de administración</p>

          <nav className="adminSidebarNav">
            {NAV_ITEMS.map((item) => {
              const active = topKey(section) === item.key;

              return (
                <button
                  key={item.key}
                  className={`adminSidebarItem ${active ? "adminSidebarItemActive" : ""}`}
                  onClick={() => changeSection(item.key)}
                >
                  <span className="adminSidebarIcon">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {isSubSection && (
            <div className="adminSidebarSub">
              <button className="adminSidebarBackBtn" onClick={goList}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline
                    points="7,2 3,6 7,10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Artistas
              </button>

              <span className="adminSidebarSubLabel">
                {section === "createEmployee" ? "Nuevo artista" : selEmp?.name}
              </span>
            </div>
          )}

          {topKey(section) === "employees" && !isSubSection && (
            <button className="adminSidebarNewBtn" onClick={goCreate}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <line
                  x1="6.5"
                  y1="1"
                  x2="6.5"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="1"
                  y1="6.5"
                  x2="12"
                  y2="6.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Nuevo artista
            </button>
          )}
        </aside>

        <main className="adminMain">
          {section === "employees" && (
            <EmployeeList employees={employees} onSelect={goDetail} />
          )}

          {section === "employeeDetail" && (
            <EmployeeDetail
              employee={selEmp}
              appointments={appointments}
              onUpdate={onUpdateEmployee}
              onBack={goList}
            />
          )}

          {section === "createEmployee" && (
            <CreateEmployee
              employees={employees}
              onAdd={handleAdd}
              onCancel={goList}
            />
          )}

          {section === "clients" && (
            <ClientList appointments={appointments} />
          )}

          {section === "week" && (
            <AdminAgenda
              appointments={appointments}
              employees={employees}
              mode="week"
            />
          )}

          {section === "month" && (
            <AdminAgenda
              appointments={appointments}
              employees={employees}
              mode="month"
            />
          )}

          {section === "users" && <UserManagement />}

          {section === "categories" && <CategoryManagement />}

          {section === "reports" && <AdminReports />}
        </main>
      </div>
    </div>
  );
}