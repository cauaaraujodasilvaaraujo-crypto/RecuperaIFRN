const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const prisma = require("../prisma/client");
const { signUserToken, authMiddleware, requireAdmin } = require("../auth");

const SALT_ROUNDS = 10;

function sanitizeUsuario(usuario) {
  if (!usuario) return null;

  const { senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

function parseMatricula(valor) {
  const matricula = Number(valor);
  return Number.isInteger(matricula) ? matricula : null;
}

// POST /Usuarios/login
router.post("/login", async function (req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Usuários sem senha (não servidores) não autenticam
    if (!usuario || !usuario.senha) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = signUserToken(usuario);

    return res.status(200).json({
      token,
      usuario: sanitizeUsuario(usuario),
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Falha ao fazer login." });
  }
});

// GET /Usuarios/me
router.get("/me", authMiddleware, async function (req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { matricula: Number(req.user.matricula) },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.status(200).json({ usuario: sanitizeUsuario(usuario) });
  } catch (error) {
    console.error("Erro ao buscar usuário autenticado:", error);
    return res.status(500).json({ error: "Falha ao buscar usuário autenticado." });
  }
});

// LISTAR TODOS OS USUÁRIOS
// GET /Usuarios
router.get("/", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.status(200).json(usuarios.map(sanitizeUsuario));
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Falha ao listar usuários" });
  }
});

// BUSCAR UM USUÁRIO POR MATRÍCULA
// GET /Usuarios/:matricula
router.get("/:matricula", authMiddleware, async function (req, res) {
  try {
    const matricula = parseMatricula(req.params.matricula);
    if (matricula === null) {
      return res.status(400).json({ error: "Matrícula inválida." });
    }

    const isCoapac = Boolean(req.user?.coapac);
    const isSameUser = Number(req.user?.matricula) === matricula;

    if (!isCoapac && !isSameUser) {
      return res.status(403).json({ error: "Você não tem permissão para ver este usuário." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { matricula },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json(sanitizeUsuario(usuario));
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Falha ao buscar usuário" });
  }
});

// CRIAR UM NOVO USUÁRIO
// POST /Usuarios
router.post("/", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const { matricula, nome, email, senha, coapac = false } = req.body;

    const matriculaNum = parseMatricula(matricula);
    if (matriculaNum === null || !nome) {
      return res.status(400).json({
        error: "Matrícula (número inteiro) e nome são obrigatórios.",
      });
    }

    // Servidores COAPAC precisam de e-mail e senha para autenticar
    if (coapac && (!email || !senha)) {
      return res.status(400).json({
        error: "Servidores da COAPAC precisam de e-mail e senha.",
      });
    }

    const usuario = await prisma.usuario.create({
      data: {
        matricula: matriculaNum,
        nome,
        email: email || null,
        senha: senha ? await bcrypt.hash(senha, SALT_ROUNDS) : null,
        coapac: Boolean(coapac),
      },
    });

    res.status(201).json(sanitizeUsuario(usuario));
  } catch (error) {
    console.error("Erro ao criar usuário:", error?.message || error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe um usuário com essa matrícula ou e-mail." });
    }

    return res.status(500).json({ error: "Falha ao criar usuário" });
  }
});

// ATUALIZAR UM USUÁRIO
// PUT /Usuarios/:matricula
router.put("/:matricula", authMiddleware, async function (req, res) {
  try {
    const matricula = parseMatricula(req.params.matricula);
    if (matricula === null) {
      return res.status(400).json({ error: "Matrícula inválida." });
    }

    const isCoapac = Boolean(req.user?.coapac);
    const isSameUser = Number(req.user?.matricula) === matricula;

    if (!isCoapac && !isSameUser) {
      return res.status(403).json({ error: "Você não tem permissão para atualizar este usuário." });
    }

    const { nome, email, senha, coapac } = req.body;
    const dadosAtualizados = {
      ...(nome !== undefined && { nome }),
      ...(email !== undefined && { email: email || null }),
      ...(senha !== undefined && {
        senha: senha ? await bcrypt.hash(senha, SALT_ROUNDS) : null,
      }),
      // Só quem é COAPAC pode alterar essa flag
      ...(isCoapac && coapac !== undefined && { coapac: Boolean(coapac) }),
    };

    const usuarioAtualizado = await prisma.usuario.update({
      where: { matricula },
      data: dadosAtualizados,
    });

    res.status(200).json(sanitizeUsuario(usuarioAtualizado));
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado para atualizar" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe um usuário com esse e-mail." });
    }

    return res.status(500).json({ error: "Falha ao atualizar usuário" });
  }
});

// EXCLUIR UM USUÁRIO
// DELETE /Usuarios/:matricula
router.delete("/:matricula", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const matricula = parseMatricula(req.params.matricula);
    if (matricula === null) {
      return res.status(400).json({ error: "Matrícula inválida." });
    }

    await prisma.usuario.delete({
      where: { matricula },
    });

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado para deletar" });
    }
    // Usuário ainda referenciado por itens cadastrados/retirados
    if (error.code === "P2003") {
      return res.status(409).json({
        error: "Não é possível excluir: o usuário possui itens vinculados.",
      });
    }

    return res.status(500).json({ error: "Falha ao deletar usuário" });
  }
});

module.exports = router;