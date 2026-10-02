import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../api";

const FORM_VAZIO = { matricula: "", nome: "", email: "", senha: "", confirmarSenha: "" };

function CadastroUsuario() {
  const [form, setForm] = useState(FORM_VAZIO);
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

    // Validação rápida no próprio navegador (o servidor valida de novo)
    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setCarregando(true);

    try {
      const { confirmarSenha, ...dadosParaEnviar } = form; // não envia a confirmação
      const resposta = await fetch(`${API_URL}/Usuarios/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao cadastrar.");
      }

      // Deu certo: vai para o login com um aviso
      navigate("/login", { state: { aviso: "Conta criada! Faça login para continuar." } });
    } catch (error) {
      setErro(error.message === "Failed to fetch" ? "Não foi possível conectar ao servidor." : error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-card">
        <h1>Criar conta</h1>
        <p>Preencha seus dados para se cadastrar no sistema.</p>

        <form onSubmit={handleSubmit} className="cadastro-form">
          <label>
            Matrícula
            <input
              type="text"
              name="matricula"
              value={form.matricula}
              onChange={handleChange}
              placeholder="Somente números"
              inputMode="numeric"
              pattern="\d{4,20}"
              title="Use apenas números (4 a 20 dígitos)"
              required
            />
          </label>

          <label>
            Nome completo
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite seu nome"
              maxLength={200}
              required
            />
          </label>

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
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
            />
          </label>

          <label>
            Confirmar senha
            <input
              type="password"
              name="confirmarSenha"
              value={form.confirmarSenha}
              onChange={handleChange}
              placeholder="Repita a senha"
              required
            />
          </label>

          <button type="submit" disabled={carregando}>
            {carregando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {erro && <p className="erro">{erro}</p>}

        <p className="troca-pagina">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default CadastroUsuario;
