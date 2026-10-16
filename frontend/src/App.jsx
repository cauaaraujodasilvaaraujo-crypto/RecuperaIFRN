import { Route, Routes } from "react-router-dom";

import Login from "./componentes/login/login";
import Home from "./componentes/home/telaInicial";
import Cadastro from "./componentes/cadrastroUsuario/cadratroUsuario";


import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
    </Routes>
  );
}

export default App;
