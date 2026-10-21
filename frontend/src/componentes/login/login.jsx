import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import "./login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();
  const aviso = useLocation().state?.aviso;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "E-mail ou senha incorretos.");
      }

      if (dados.token) {
        localStorage.setItem("recupera_token", dados.token);
      }
      if (dados.usuario) {
        localStorage.setItem("recupera_usuario", JSON.stringify(dados.usuario));
      }

      if (typeof onLogin === "function") {
        onLogin({ usuario: dados.usuario, token: dados.token });
      }

      navigate("/tela2");
    } catch (error) {
      setErro(
        error.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor. Verifique se o backend está ligado."
          : error.message
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="login-page-wrapper">
      <div className="login-card">
        {/* Cabeçalho com Emblema/Ícone e Boas-Vindas */}
        <div className="login-header">
          <div className="login-icon-badge" title="RecuperaIFRN">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="login-title">Bem-vindo de volta!</h1>
          <p className="login-subtitle">
            Acesse o sistema de Achados e Perdidos do campus
          </p>
        </div>

        {/* Mensagens de Sucesso ou Erro */}
        {aviso && <div className="login-feedback-alert sucesso">{aviso}</div>}
        {erro && <div className="login-feedback-alert erro">{erro}</div>}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo de E-mail */}
          <div className="input-group">
            <Mail className="input-icon-left" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu.email@ifrn.edu.br"
              className="login-input"
              autoComplete="email"
              required
            />
          </div>

          {/* Campo de Senha com Alternância de Visibilidade */}
          <div className="input-group">
            <Lock className="input-icon-left" />
            <input
              type={showPassword ? "text" : "password"}
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Sua senha de acesso"
              className="login-input has-right-button"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="btn-toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Linha Lembrar de Mim & Esqueci a Senha */}
          <div className="remember-forgot-row">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={lembrarMe}
                onChange={(e) => setLembrarMe(e.target.checked)}
                className="remember-checkbox"
              />
              Lembrar de mim
            </label>
            <a
              href="#esqueceu-senha"
              onClick={(e) => {
                e.preventDefault();
                alert("Entre em contato com a COAPAC do campus para redefinir sua senha.");
              }}
              className="forgot-password-link"
            >
              Esqueceu a senha?
            </a>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={carregando}
            className="btn-submit-login"
          >
            {carregando ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>

        {/* Link para Criar Conta */}
        <p className="login-footer-link">
          <span>Ainda não tem conta?</span>
          <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
