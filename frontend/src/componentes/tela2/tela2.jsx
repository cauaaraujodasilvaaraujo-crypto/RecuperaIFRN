import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./tela2.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Tela2({ usuario, onLogout }) {
  const [itens, setItens] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // Modal / Formulário de Cadastro de Item
  const [modalAberto, setModalAberto] = useState(false);
  const [salvandoItem, setSalvandoItem] = useState(false);
  const [novoItem, setNovoItem] = useState({
    nome: "",
    descricao: "",
    cor: "",
    tipo: "ENCONTRADO",
    localEncontrado: "",
    classificacaoId: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("recupera_token");

  useEffect(() => {
    carregarClassificacoes();
    carregarItens();
  }, [filtroTipo]);

  async function carregarClassificacoes() {
    try {
      const res = await fetch(`${API_URL}/classificacao`);
      if (res.ok) {
        const dados = await res.json();
        setClassificacoes(dados);
        if (dados.length > 0 && !novoItem.classificacaoId) {
          setNovoItem((prev) => ({ ...prev, classificacaoId: dados[0].id }));
        }
      }
    } catch (e) {
      console.warn("Não foi possível carregar classificações:", e);
    }
  }

  async function carregarItens() {
    setCarregando(true);
    setErro("");
    try {
      let url = `${API_URL}/item`;
      const params = new URLSearchParams();
      if (filtroTipo) params.append("tipo", filtroTipo);
      if (busca) params.append("q", busca);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao carregar itens.");
      const dados = await res.json();
      setItens(dados);
    } catch (e) {
      setErro("Não foi possível carregar os itens no momento.");
    } finally {
      setCarregando(false);
    }
  }

  function handleBuscaSubmit(e) {
    e.preventDefault();
    carregarItens();
  }

  function handleNovoItemChange(e) {
    const { name, value } = e.target;
    setNovoItem((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCadastrarItem(e) {
    e.preventDefault();
    if (!token) {
      setErro("Você precisa estar logado para cadastrar um item.");
      return;
    }

    setSalvandoItem(true);
    setErro("");
    setSucesso("");

    try {
      const res = await fetch(`${API_URL}/item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...novoItem,
          classificacaoId: Number(novoItem.classificacaoId),
        }),
      });

      const dados = await res.json();
      if (!res.ok) {
        throw new Error(dados.error || "Erro ao salvar o item.");
      }

      setSucesso("Item registrado com sucesso!");
      setModalAberto(false);
      setNovoItem({
        nome: "",
        descricao: "",
        cor: "",
        tipo: "ENCONTRADO",
        localEncontrado: "",
        classificacaoId: classificacoes[0]?.id || "",
      });
      carregarItens();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvandoItem(false);
    }
  }

  function handleSair() {
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      localStorage.removeItem("recupera_token");
      localStorage.removeItem("recupera_usuario");
    }
    navigate("/login");
  }

  return (
    <div className="painel-container">
      {/* Topo / Navbar */}
      <header className="painel-header">
        <div className="header-brand">
          <Link to="/" className="brand-logo">Recupera<strong>IFRN</strong></Link>
          <span className="badge-campus">Campus IFRN</span>
        </div>

        <div className="header-actions">
          {usuario ? (
            <div className="usuario-info">
              <span>Olá, <strong>{usuario.nome}</strong></span>
              <button onClick={handleSair} className="btn-logout" title="Sair da conta">
                Sair
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-sm">Entrar</Link>
              <Link to="/cadastro" className="btn-sm btn-verde">Cadastrar</Link>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="painel-main">
        <section className="painel-top-bar">
          <div>
            <h1>Achados & Perdidos</h1>
            <p>Consulte ou cadastre itens encontrados ou perdidos nas dependências do campus.</p>
          </div>

          <button
            className="btn-novo-item"
            onClick={() => {
              if (!usuario && !token) {
                navigate("/login", { state: { aviso: "Faça login para registrar um item." } });
              } else {
                setModalAberto(true);
              }
            }}
          >
            + Cadastrar Novo Item
          </button>
        </section>

        {sucesso && <div className="sucesso">{sucesso}</div>}
        {erro && <div className="erro">{erro}</div>}

        {/* Barra de Filtro e Busca */}
        <section className="painel-filtros">
          <form onSubmit={handleBuscaSubmit} className="filtro-busca-form">
            <input
              type="text"
              placeholder="Buscar por nome, local ou detalhes..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>

          <div className="filtro-tipo-tags">
            <button
              className={filtroTipo === "" ? "tag-ativa" : ""}
              onClick={() => setFiltroTipo("")}
            >
              Todos
            </button>
            <button
              className={filtroTipo === "ENCONTRADO" ? "tag-ativa" : ""}
              onClick={() => setFiltroTipo("ENCONTRADO")}
            >
              Encontrados
            </button>
            <button
              className={filtroTipo === "PERDIDO" ? "tag-ativa" : ""}
              onClick={() => setFiltroTipo("PERDIDO")}
            >
              Perdidos
            </button>
          </div>
        </section>

        {/* Lista de Itens */}
        {carregando ? (
          <p className="status-msg">Carregando itens...</p>
        ) : itens.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum item encontrado no momento.</p>
            <small>Se você encontrou ou perdeu algo, use o botão acima para registrar.</small>
          </div>
        ) : (
          <div className="itens-grid">
            {itens.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-header">
                  <span className={`tag-tipo ${item.tipo.toLowerCase()}`}>
                    {item.tipo}
                  </span>
                  <span className={`tag-status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>

                <h3>{item.nome}</h3>
                {item.descricao && <p className="item-desc">{item.descricao}</p>}

                <div className="item-detalhes">
                  {item.localEncontrado && (
                    <p><strong>Local:</strong> {item.localEncontrado}</p>
                  )}
                  {item.classificacao?.nome && (
                    <p><strong>Categoria:</strong> {item.classificacao.nome}</p>
                  )}
                  {item.cor && (
                    <p><strong>Cor:</strong> {item.cor}</p>
                  )}
                  {item.dataEncontrado && (
                    <p>
                      <strong>Data:</strong>{" "}
                      {new Date(item.dataEncontrado).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Cadastro de Item */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Item</h2>
              <button className="btn-fechar" onClick={() => setModalAberto(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCadastrarItem} className="cadastro-form">
              <label>
                O que aconteceu?
                <select
                  name="tipo"
                  value={novoItem.tipo}
                  onChange={handleNovoItemChange}
                  required
                >
                  <option value="ENCONTRADO">Encontrei este item</option>
                  <option value="PERDIDO">Perdi este item</option>
                </select>
              </label>

              <label>
                Nome do Item
                <input
                  type="text"
                  name="nome"
                  value={novoItem.nome}
                  onChange={handleNovoItemChange}
                  placeholder="Ex: Garrafa térmica preta, Carteira, Caderno..."
                  required
                />
              </label>

              <label>
                Categoria
                <select
                  name="classificacaoId"
                  value={novoItem.classificacaoId}
                  onChange={handleNovoItemChange}
                  required
                >
                  {classificacoes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Local no Campus
                <input
                  type="text"
                  name="localEncontrado"
                  value={novoItem.localEncontrado}
                  onChange={handleNovoItemChange}
                  placeholder="Ex: Sala 12, Pátio, Biblioteca, Quadra..."
                  required
                />
              </label>

              <label>
                Cor aproximada (opcional)
                <input
                  type="text"
                  name="cor"
                  value={novoItem.cor}
                  onChange={handleNovoItemChange}
                  placeholder="Ex: Azul, Preto, Prata"
                />
              </label>

              <label>
                Descrição / Detalhes adicionais
                <input
                  type="text"
                  name="descricao"
                  value={novoItem.descricao}
                  onChange={handleNovoItemChange}
                  placeholder="Detalhes que ajudam a identificar"
                />
              </label>

              <div className="modal-acoes">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={salvandoItem}>
                  {salvandoItem ? "Salvando..." : "Salvar Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tela2;
