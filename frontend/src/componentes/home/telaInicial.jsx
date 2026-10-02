import { useEffect, useState } from "react";
import { API_URL } from "../../api";

// Página provisória: só prova que o login e o token estão funcionando.
// Depois vira a tela de itens (lista, busca, cadastro de item...).
function Home({ onSessaoExpirada }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function buscarUsuario() {
      const token = localStorage.getItem("authToken");
      const resposta = await fetch(`${API_URL}/Usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.status === 401) {
        onSessaoExpirada(); // token venceu: volta para o login
        return;
      }

      const dados = await resposta.json();
      setUsuario(dados.usuario);
    }

    buscarUsuario().catch(() => {});
  }, [onSessaoExpirada]);

  return (
    <div className="cadastro-page">
      <div className="cadastro-card">
        <h1>Bem-vindo(a)!</h1>
        {usuario ? (
          <>
            <p><strong>{usuario.nome}</strong></p>
            <p>Matrícula: {usuario.matricula}</p>
            <p>Perfil: {usuario.coapac ? "Servidor da COAPAC" : "Usuário"}</p>
          </>
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </div>
  );
}

export default Home;
