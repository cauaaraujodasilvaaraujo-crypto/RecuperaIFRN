const express = require("express");
const router = express.Router();

const prisma = require("../prisma/client");
const { authMiddleware, requireAdmin } = require("../auth");

const NOME_MAX = 60;

function parseId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) ? id : null;
}

function validarNome(nome) {
  if (typeof nome !== "string" || !nome.trim()) {
    return "O nome da classificação é obrigatório.";
  }
  if (nome.trim().length > NOME_MAX) {
    return `O nome deve ter no máximo ${NOME_MAX} caracteres.`;
  }
  return null;
}

// LISTAR TODAS AS CLASSIFICAÇÕES
// GET /Classificacoes
router.get("/", async function (req, res) {
  try {
    const classificacoes = await prisma.classificacao.findMany({
      orderBy: { nome: "asc" },
    });

    res.status(200).json(classificacoes);
  } catch (error) {
    console.error("Erro ao listar classificações:", error);
    res.status(500).json({ error: "Falha ao listar classificações" });
  }
});

// BUSCAR UMA CLASSIFICAÇÃO POR ID
// GET /Classificacoes/:id
router.get("/:id", async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const classificacao = await prisma.classificacao.findUnique({
      where: { id },
    });

    if (!classificacao) {
      return res.status(404).json({ error: "Classificação não encontrada" });
    }

    return res.status(200).json(classificacao);
  } catch (error) {
    console.error("Erro ao buscar classificação:", error);
    return res.status(500).json({ error: "Falha ao buscar classificação" });
  }
});

// CRIAR UMA NOVA CLASSIFICAÇÃO
// POST /Classificacoes
router.post("/", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const { nome } = req.body;

    const erroNome = validarNome(nome);
    if (erroNome) {
      return res.status(400).json({ error: erroNome });
    }

    const classificacao = await prisma.classificacao.create({
      data: { nome: nome.trim() },
    });

    res.status(201).json(classificacao);
  } catch (error) {
    console.error("Erro ao criar classificação:", error?.message || error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe uma classificação com esse nome." });
    }

    return res.status(500).json({ error: "Falha ao criar classificação" });
  }
});

// ATUALIZAR UMA CLASSIFICAÇÃO
// PUT /Classificacoes/:id
router.put("/:id", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const { nome } = req.body;

    const erroNome = validarNome(nome);
    if (erroNome) {
      return res.status(400).json({ error: erroNome });
    }

    const classificacaoAtualizada = await prisma.classificacao.update({
      where: { id },
      data: { nome: nome.trim() },
    });

    res.status(200).json(classificacaoAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar classificação:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Classificação não encontrada para atualizar" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe uma classificação com esse nome." });
    }

    return res.status(500).json({ error: "Falha ao atualizar classificação" });
  }
});

// EXCLUIR UMA CLASSIFICAÇÃO
// DELETE /Classificacoes/:id
router.delete("/:id", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    await prisma.classificacao.delete({
      where: { id },
    });

    res.status(200).json({ message: "Classificação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir classificação:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Classificação não encontrada para deletar" });
    }
    // Ainda existem itens usando essa classificação
    if (error.code === "P2003") {
      return res.status(409).json({
        error: "Não é possível excluir: existem itens vinculados a essa classificação.",
      });
    }

    return res.status(500).json({ error: "Falha ao deletar classificação" });
  }
});

module.exports = router;