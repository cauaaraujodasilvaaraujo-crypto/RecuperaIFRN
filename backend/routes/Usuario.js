const express = require("express");
const router = express.Router();

// Usa o Prisma client centralizado, criado uma única vez para a aplicação.
const prisma = require("../prisma/client");

// LISTAR TODOS OS USUÁRIOS
// GET /Usuarios
router.get("/", async function (req, res) {
  try {
    const usuario = await prisma.usuario.findMany(); // SELECT * FROM usuarios    
    res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Falha ao listar usuários" });
  }
});

// BUSCAR UM USUÁRIO POR CPF
// GET /Usuarios/:cpf
router.get("/:cpf", async function (req, res) {
  try {
    const { cpf } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { cpf }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Falha ao buscar usuário" });
  }
});

// CRIAR UM NOVO USUÁRIO
// POST /Usuarios
router.post("/", async function (req, res) {
  try {
    const { cpf, nomeUsuario, emailUsuario, senhaUsuario } = req.body;

    if (!cpf || !nomeUsuario || !emailUsuario || !senhaUsuario) {
      return res.status(400).json({
        error: "CPF, nome, e-mail e senha são obrigatórios."
      });
    }

    const usuario = await prisma.usuario.create({
      data: {
        cpf,
        nomeUsuario,
        emailUsuario,
        senhaUsuario
      }
    });

    res.status(201).json(usuario);
  } catch (error) {
    console.error("Erro ao criar usuário:", error?.message || error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe um usuário com esse CPF ou e-mail." });
    }

    return res.status(500).json({
      error: "Falha ao criar usuário",
      detail: error?.message || "Erro interno do banco de dados"
    });
  }
});

// ATUALIZAR UM USUÁRIO
// PUT /Usuarios/:cpf
router.put("/:cpf", async function (req, res) {
  try {
    const { cpf } = req.params;
    const { nomeUsuario, emailUsuario, senhaUsuario } = req.body;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { cpf },
      data: {
        nomeUsuario,
        emailUsuario,
        senhaUsuario
      }
    });

    res.status(200).json(usuarioAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado para atualizar" });
    }

    return res.status(500).json({ error: "Falha ao atualizar usuário" });
  }
});

// EXCLUIR UM USUÁRIO
// DELETE /Usuarios/:cpf
router.delete("/:cpf", async function (req, res) {
  try {
    const { cpf } = req.params;

    await prisma.usuario.delete({
      where: { cpf }
    });

    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado para deletar" });
    }

    return res.status(500).json({ error: "Falha ao deletar usuário" });
  }
});

module.exports = router;