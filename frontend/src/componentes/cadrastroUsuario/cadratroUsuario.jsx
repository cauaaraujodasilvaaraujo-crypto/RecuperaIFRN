import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Hash, UserPlus } from "lucide-react";
import "./cadastro.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FORM_VAZIO = { matricula: "", nome: "", email: "", senha: "", confirmarSenha: "" };

function CadastroUsuario() {
  const [form, setForm] = useState(FORM_VAZIO);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem. Digite novamente.");
      return;
    }

    if (form.senha.length < 6) {
      setErro("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      const { confirmarSenha, ...dadosParaEnviar } = form;
      const resposta = await fetch(`${API_URL}/usuarios/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      const tipoConteudo = resposta.headers.get("content-type") || "";
      const dados = tipoConteudo.includes("application/json")
        ? await resposta.json()
        : null;

      if (!resposta.ok) {
        throw new Error(dados?.error || `Falha ao cadastrar (HTTP ${resposta.status}).`);
      }
      if (!dados) {
        throw new Error("O servidor respondeu em formato inesperado.");
      }

      navigate("/login", {
        state: { aviso: "Conta criada com sucesso! Faça login para continuar." },
      });
    } catch (error) {
      setErro(
        error.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor. Verifique se o backend está ativo."
          : error.message
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="cadastro-page-wrapper">
      <div className="cadastro-modern-card">
        {/* Cabeçalho */}
        <div className="cadastro-header">
          <div className="cadastro-icon-badge" title="RecuperaIFRN">
            <UserPlus />
          </div>
          <h1 className="cadastro-title">Crie sua conta</h1>
          <p className="cadastro-subtitle">
            Cadastre-se para acessar o Achados e Perdidos do campus
          </p>
        </div>

        {/* Mensagem de Erro */}
        {erro && <div className="cadastro-alert-erro">{erro}</div>}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="cadastro-modern-form">
          {/* Matrícula */}
          <div className="cadastro-input-group">
            <Hash className="cadastro-input-icon" />
            <input
              type="text"
              name="matricula"
              value={form.matricula}
              onChange={handleChange}
              placeholder="Matrícula (somente números)"
              inputMode="numeric"
              pattern="[0-9]{1,20}"
              maxLength={20}
              className="cadastro-modern-input"
              required
            />
          </div>

          {/* Nome Completo */}
          <div className="cadastro-input-group">
            <User className="cadastro-input-icon" />
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome completo"
              maxLength={200}
              className="cadastro-modern-input"
              required
            />
          </div>

          {/* E-mail */}
          <div className="cadastro-input-group">
            <Mail className="cadastro-input-icon" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu.email@ifrn.edu.br"
              className="cadastro-modern-input"
              required
            />
          </div>

          {/* Senha */}
          <div className="cadastro-input-group">
            <Lock className="cadastro-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Senha (mínimo de 6 caracteres)"
              minLength={6}
              className="cadastro-modern-input has-right-toggle"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="btn-toggle-senha"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Confirmar Senha */}
          <div className="cadastro-input-group">
            <Lock className="cadastro-input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmarSenha"
              value={form.confirmarSenha}
              onChange={handleChange}
              placeholder="Repita sua senha"
              minLength={6}
              className="cadastro-modern-input has-right-toggle"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="btn-toggle-senha"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Ocultar confirmação" : "Exibir confirmação"}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Botão de Cadastro */}
          <button
            type="submit"
            disabled={carregando}
            className="btn-submit-cadastro"
          >
            {carregando ? "Cadastrando conta..." : "Criar minha conta"}
          </button>
        </form>

        {/* Rodapé com link de login */}
        <p className="cadastro-footer-link">
          <span>Já tem uma conta?</span>
          <Link to="/login">Entrar</Link>
        </p>
      </div>
    </section>
  );
}

export default CadastroUsuario;
