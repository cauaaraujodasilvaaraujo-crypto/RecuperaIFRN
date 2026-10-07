const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ROTA 1: CADASTRAR USUÁRIO
app.post('/usuarios/cadastro', async (req, res) => {
  try {
    const { matricula, nome, email, senha } = req.body;

    // Converte a matrícula para número caso venha como texto do frontend
    const matriculaInt = parseInt(matricula, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        matricula: matriculaInt,
        nome,
        email,
        senha, // No futuro, usaremos bcrypt aqui para não salvar a senha em texto limpo!
        coapac: false // Por padrão, alunos não são da COAPAC
      }
    });

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
  } catch (erro) {
    res.status(400).json({ erro: "Erro ao cadastrar usuário. Verifique se a matrícula ou email já existem." });
  }
});

// ROTA 2: LOGIN MOCK (Apenas verifica se o usuário existe)
app.post('/usuarios/login', async (req, res) => {
  const { matricula, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({
    where: { matricula: parseInt(matricula, 10) }
  });

  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado." });
  }

  // FUTURO: Aqui entra a verificação de hash e geração de JWT
  if (usuario.senha !== senha) {
    return res.status(401).json({ erro: "Senha incorreta." });
  }

  res.status(200).json({ mensagem: "Login efetuado com sucesso (simulado)!", usuario });
});
