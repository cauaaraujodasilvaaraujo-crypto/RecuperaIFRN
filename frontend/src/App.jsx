import { Route, Routes } from "react-router-dom";
import CadastroUsuario from "./Componentes/CadastroUsuario/CadastroUsuario";
import EditarUsuario from "./Componentes/EditarUsuario/EditarUsuario";
import ListaUsuarios from "./Componentes/ListaUsuarios/ListaUsuarios";
import CadastroProduto from "./Componentes/CadastroProduto/CadastroProduto";
import ListaProdutos from "./Componentes/ListaProdutos/ListaProdutos";
import EditarProduto from "./Componentes/EditarProduto/EditarProduto";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/CadastroUsuario" element={<CadastroUsuario />} />
      <Route path="/Usuarios" element={<ListaUsuarios />} />
      <Route path="/Usuarios/:cpf/editar" element={<EditarUsuario />} />

      <Route path="/CadastroProduto" element={<CadastroProduto />} />
      <Route path="/Produtos" element={<ListaProdutos />} />
      <Route path="/Produtos/:idProdutos/editar" element={<EditarProduto />} />
    </Routes>
  );
}

export default App;
