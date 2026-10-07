const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de boas-vindas / teste (Evita o erro "Cannot GET /")
app.get('/', (req, res) => {
  res.json({ mensagem: "API do RecuperaIFRN está rodando com sucesso!" });
});

// 1. ROTA DE CADASTRO
app.post('/usuarios/cadastro', async (req, res) => {
  try {
    const { matricula, nome, email, senha } = req.body;
    const matriculaInt = parseInt(matricula, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        matricula: matriculaInt,
        nome,
        email,
        senha,
        coapac: false
      }
    });

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
  } catch (erro) {
    console.error(erro);
    res.status(400).json({ erro: "Erro ao cadastrar. Matrícula ou e-mail já existente." });
  }
});

// 2. ROTA DE LOGIN (SIMULADO)
app.post('/usuarios/login', async (req, res) => {
  try {
    const { matricula, senha } = req.body;
    const matriculaInt = parseInt(matricula, 10);

    const usuario = await prisma.usuario.findUnique({
      where: { matricula: matriculaInt }
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Matrícula não cadastrada." });
    }

    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    res.status(200).json({ 
      mensagem: "Login realizado com sucesso!", 
      usuario: { matricula: usuario.matricula, nome: usuario.nome, email: usuario.email }
    });
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});