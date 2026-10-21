import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Login from "./componentes/login/login";
import Home from "./componentes/home/telaInicial";
import Cadastro from "./componentes/cadrastroUsuario/cadratroUsuario";
import Home2 from "./componentes/tela2/tela2";

import "./App.css";

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("recupera_usuario");
    if (usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch (e) {
        console.error("Erro ao carregar usuário salvo:", e);
      }
    }
  }, []);

  function handleLogin({ usuario }) {
    setUsuario(usuario);
  }

  function handleLogout() {
    localStorage.removeItem("recupera_token");
    localStorage.removeItem("recupera_usuario");
    setUsuario(null);
  }

  return (
    <Routes>
      <Route path="/" element={<Home usuario={usuario} onLogout={handleLogout} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/tela2" element={<Home2 usuario={usuario} onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;
