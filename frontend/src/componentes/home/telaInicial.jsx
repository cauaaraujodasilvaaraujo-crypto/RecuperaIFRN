import { Link } from "react-router-dom";
import { PackageSearch, LogIn, UserPlus, Search, ArrowRight } from "lucide-react";
import "./telaInicial.css";

function Home({ usuario, onLogout }) {
  const usuarioSalvo = usuario || (localStorage.getItem("recupera_usuario") ? JSON.parse(localStorage.getItem("recupera_usuario")) : null);

  return (
    <main className="home-page-wrapper">
      <div className="home-card">
        {/* Ícone de Destaque */}
        <div className="home-badge-wrapper">
          <div className="home-icon-badge" title="RecuperaIFRN">
            <PackageSearch />
          </div>
        </div>

        <span className="home-pill-tag">Campus IFRN</span>
        <h1 className="home-title">
          Recupera<span>IFRN</span>
        </h1>
        <p className="home-desc">
          O sistema oficial de Achados e Perdidos do seu campus. Perdeu ou encontrou algo? Acesse para consultar ou registrar.
        </p>

        {/* Se o usuário já estiver conectado */}
        {usuarioSalvo ? (
          <div className="home-actions">
            <div className="user-logged-box">
              <p>
                Conectado como <strong>{usuarioSalvo.nome}</strong>
              </p>
            </div>
            <Link to="/tela2" className="btn-home btn-home-primary">
              Ir para o Painel de Itens
              <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => {
                if (typeof onLogout === "function") {
                  onLogout();
                } else {
                  localStorage.removeItem("recupera_token");
                  localStorage.removeItem("recupera_usuario");
                  window.location.reload();
                }
              }}
              className="btn-home btn-home-outline"
            >
              Sair da conta
            </button>
          </div>
        ) : (
          /* Se for visitante */
          <div className="home-actions">
            <Link to="/login" className="btn-home btn-home-primary">
              <LogIn size={18} />
              Entrar (Fazer Login)
            </Link>

            <Link to="/cadastro" className="btn-home btn-home-secondary">
              <UserPlus size={18} />
              Criar Cadastro
            </Link>

            <Link to="/tela2" className="btn-home btn-home-outline">
              <Search size={16} />
              Consultar Itens sem Entrar
            </Link>
          </div>
        )}

        <p className="home-footer-note">
          Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Norte
        </p>
      </div>
    </main>
  );
}

export default Home;
