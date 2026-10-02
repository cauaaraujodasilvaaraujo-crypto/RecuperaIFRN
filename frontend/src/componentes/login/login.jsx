import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_URL } from "../../api";

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const aviso = useLocation().state?.aviso; // mensagem vinda do cadastro

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(`${API_URL}/Usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao fazer login.");
      }

      onLogin({ usuario: dados.usuario, token: dados.token });
    } catch (error) {
      // "Failed to fetch" = a API está desligada ou o endereço está errado
      setErro(error.message === "Failed to fetch" ? "Não foi possível conectar ao servidor." : error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-card">
        <h1>Entrar</h1>
        <p>Acesse o sistema com seu e-mail e senha.</p>

        {aviso && <p className="sucesso">{aviso}</p>}

        <form onSubmit={handleSubmit} className="cadastro-form">
          <label>
            E-mail
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu.email@ifrn.edu.br"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
            />
          </label>

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {erro && <p className="erro">{erro}</p>}

        <p className="troca-pagina">
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
