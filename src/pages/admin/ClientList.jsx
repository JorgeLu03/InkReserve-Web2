import { useState } from "react";
import Avatar from "../../components/Avatar";
import "./AdminShell.css";

const CLIENT_COLORS_MAP = {};

export default function ClientList({ appointments }) {
  const [search, setSearch] = useState("");

  const clientMap = {};
  appointments.forEach((a) => {
    if (!clientMap[a.clientName]) {
      clientMap[a.clientName] = {
        name: a.clientName,
        initials: a.clientInitials,
        color: a.clientColor,
        count: 0,
        total: 0,
        styles: new Set(),
        lastDate: "",
      };
    }
    clientMap[a.clientName].count += 1;
    clientMap[a.clientName].total += a.total;
    clientMap[a.clientName].styles.add(a.style);
    if (a.date > clientMap[a.clientName].lastDate) {
      clientMap[a.clientName].lastDate = a.date;
    }
  });

  const clients = Object.values(clientMap)
    .sort((a, b) => b.count - a.count)
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <div className="empListTop" style={{ marginBottom: "1rem" }}>
        <input
          className="empSearch"
          placeholder="Buscar cliente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="empCount">{clients.length} cliente{clients.length !== 1 ? "s" : ""}</span>
      </div>

      {clients.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,.6)", textAlign: "center", marginTop: "3rem" }}>
          Sin resultados.
        </p>
      ) : (
        <div className="clientGrid">
          {clients.map((c) => {
            const [, mm, dd] = (c.lastDate || "----").split("-");
            return (
              <div key={c.name} className="clientCard">
                <Avatar initials={c.initials} color={c.color} size={46} />
                <div className="clientCardInfo">
                  <div className="clientCardName">{c.name}</div>
                  <div className="clientCardMeta">
                    {c.count} cita{c.count !== 1 ? "s" : ""} · ${c.total.toLocaleString()} MXN
                  </div>
                  <div className="clientCardMeta">
                    Estilos: {[...c.styles].join(", ")}
                  </div>
                  {c.lastDate && (
                    <div className="clientCardMeta">Última cita: {dd}/{mm}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
