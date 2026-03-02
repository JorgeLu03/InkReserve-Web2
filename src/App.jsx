import { useState } from "react";
import "./index.css";

import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const [screen, setScreen] = useState("login");

  return screen === "login" ? (
    <Login onGoRegister={() => setScreen("register")} />
  ) : (
    <Register onGoLogin={() => setScreen("login")} />
  );
}