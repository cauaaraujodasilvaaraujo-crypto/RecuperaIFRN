import { Route, Routes } from "react-router-dom";

import Login from "./componentes/login/login";
import Home from "./componentes/home/telaInicial";
import Cadastro from "./componentes/cadrastroUsuario/cadratroUsuario";
import home2 from "./componentes/tela2/tela2";



import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/tela2" element={<home2 />} />
    </Routes>
  );
}

export default App;
