const express = require("express");
const router = express.Router();

const prisma = require("../prisma/client");
const { authMiddleware, requireAdmin } = require("../auth");

const TipoRegistro = {
  PERDIDO: "PERDIDO",
  ENCONTRADO: "ENCONTRADO",
};

const StatusItem = {
  DISPONIVEL: "DISPONIVEL",
  RETIRADO: "RETIRADO",
};

function parseId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseData(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

function parseMatricula(valor) {
  if (typeof valor !== "string" && typeof valor !== "number") {
    return null;
  }
  if (typeof valor === "number" && !Number.isSafeInteger(valor)) {
    return null;
  }

  const matricula = String(valor).trim();
  return /^\d{1,20}$/.test(matricula) ? matricula : null;
}

// LISTAR ITENS (com suporte a filtros por tipo, status, classificacaoId e busca textual)
// GET /item ou GET /itens
router.get("/", async function (req, res) {
  try {
    const { tipo, status, classificacaoId, q } = req.query;

    const where = {};
    if (tipo && Object.values(TipoRegistro).includes(tipo.toUpperCase())) {
      where.tipo = tipo.toUpperCase();
    }
    if (status && Object.values(StatusItem).includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }
    if (classificacaoId) {
      const classIdNum = parseId(classificacaoId);
      if (classIdNum) where.classificacaoId = classIdNum;
    }
    if (q && typeof q === "string" && q.trim()) {
      const termo = q.trim();
      where.OR = [
        { nome: { contains: termo } },
        { descricao: { contains: termo } },
        { localEncontrado: { contains: termo } },
      ];
    }

    const itens = await prisma.item.findMany({
      where,
      include: {
        classificacao: true,
        cadastradoPor: {
          select: { matricula: true, nome: true, email: true },
        },
        retiradoPor: {
          select: { matricula: true, nome: true, email: true },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    res.status(200).json(itens);
  } catch (error) {
    console.error("Erro ao listar itens:", error);
    res.status(500).json({ error: "Falha ao listar itens" });
  }
});

// BUSCAR UM ITEM POR ID
// GET /item/:id
router.get("/:id", async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        classificacao: true,
        cadastradoPor: {
          select: { matricula: true, nome: true, email: true },
        },
        retiradoPor: {
          select: { matricula: true, nome: true, email: true },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error("Erro ao buscar item:", error);
    return res.status(500).json({ error: "Falha ao buscar item" });
  }
});

// CADASTRAR UM NOVO ITEM
// POST /item
router.post("/", authMiddleware, async function (req, res) {
  try {
    const {
      nome,
      descricao,
      cor,
      classificacaoId,
      tipo = TipoRegistro.ENCONTRADO,
      dataEncontrado,
      localEncontrado,
      foto,
    } = req.body;

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({ error: "O nome do item é obrigatório." });
    }

    const classificacaoIdNum = parseId(classificacaoId);
    if (!classificacaoIdNum) {
      return res.status(400).json({ error: "Classificação válida é obrigatória." });
    }

    const tipoNormalizado = typeof tipo === "string" ? tipo.toUpperCase() : tipo;
    if (!Object.values(TipoRegistro).includes(tipoNormalizado)) {
      return res.status(400).json({ error: "Tipo deve ser PERDIDO ou ENCONTRADO." });
    }

    const dataDate = parseData(dataEncontrado) || new Date();
    if (!localEncontrado || typeof localEncontrado !== "string" || !localEncontrado.trim()) {
      return res.status(400).json({ error: "O local onde foi encontrado/perdido é obrigatório." });
    }

    const cadastradoPorMatricula = String(req.user.matricula);

    const novoItem = await prisma.item.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? String(descricao).trim() : null,
        cor: cor ? String(cor).trim() : null,
        classificacaoId: classificacaoIdNum,
        tipo: tipoNormalizado,
        status: StatusItem.DISPONIVEL,
        dataEncontrado: dataDate,
        localEncontrado: localEncontrado.trim(),
        foto: foto ? String(foto).trim() : null,
        cadastradoPorMatricula,
      },
      include: {
        classificacao: true,
      },
    });

    return res.status(201).json(novoItem);
  } catch (error) {
    console.error("Erro ao cadastrar item:", error);
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Classificação ou usuário informado não existe." });
    }
    return res.status(500).json({ error: "Falha ao cadastrar item." });
  }
});

// ATUALIZAR UM ITEM
// PUT /item/:id
router.put("/:id", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const {
      nome,
      descricao,
      cor,
      classificacaoId,
      tipo,
      dataEncontrado,
      localEncontrado,
      foto,
    } = req.body;

    const tipoNormalizado = tipo !== undefined && typeof tipo === "string" ? tipo.toUpperCase() : tipo;
    if (tipoNormalizado !== undefined && !Object.values(TipoRegistro).includes(tipoNormalizado)) {
      return res.status(400).json({ error: "Tipo inválido." });
    }

    let classificacaoIdNum;
    if (classificacaoId !== undefined) {
      classificacaoIdNum = parseId(classificacaoId);
      if (classificacaoIdNum === null) {
        return res.status(400).json({ error: "Classificação inválida." });
      }
    }

    let dataEncontradoDate;
    if (dataEncontrado !== undefined) {
      dataEncontradoDate = parseData(dataEncontrado);
      if (!dataEncontradoDate) {
        return res.status(400).json({ error: "Data encontrado inválida." });
      }
    }

    const dadosAtualizados = {
      ...(nome !== undefined && { nome: nome.trim() }),
      ...(descricao !== undefined && { descricao: descricao ? String(descricao).trim() : null }),
      ...(cor !== undefined && { cor: cor ? String(cor).trim() : null }),
      ...(classificacaoIdNum !== undefined && { classificacaoId: classificacaoIdNum }),
      ...(tipoNormalizado !== undefined && { tipo: tipoNormalizado }),
      ...(dataEncontradoDate !== undefined && { dataEncontrado: dataEncontradoDate }),
      ...(localEncontrado !== undefined && { localEncontrado: String(localEncontrado).trim() }),
      ...(foto !== undefined && { foto: foto ? String(foto).trim() : null }),
    };

    const itemAtualizado = await prisma.item.update({
      where: { id },
      data: dadosAtualizados,
      include: {
        classificacao: true,
      },
    });

    res.status(200).json(itemAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Item não encontrado para atualizar" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Classificação inexistente." });
    }

    return res.status(500).json({ error: "Falha ao atualizar item" });
  }
});

// REGISTRAR A RETIRADA DE UM ITEM (RF_F3)
// PATCH /item/:id/retirar
router.patch("/:id/retirar", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const { retiradoPorMatricula, dataEntrega, localEntrega } = req.body;

    const retiradoPor = parseMatricula(retiradoPorMatricula);
    const dataEntregaDate = dataEntrega ? parseData(dataEntrega) : new Date();

    if (retiradoPor === null || !dataEntregaDate || !localEntrega) {
      return res.status(400).json({
        error: "Matrícula de quem retirou e local de entrega são obrigatórios.",
      });
    }

    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }
    if (item.status === StatusItem.RETIRADO) {
      return res.status(409).json({ error: "Este item já foi retirado." });
    }

    const itemAtualizado = await prisma.item.update({
      where: { id },
      data: {
        status: StatusItem.RETIRADO,
        dataEntrega: dataEntregaDate,
        localEntrega: String(localEntrega).trim(),
        retiradoPorMatricula: retiradoPor,
      },
      include: {
        classificacao: true,
        retiradoPor: {
          select: { matricula: true, nome: true, email: true },
        },
      },
    });

    res.status(200).json(itemAtualizado);
  } catch (error) {
    console.error("Erro ao registrar retirada:", error);

    if (error.code === "P2003") {
      return res.status(400).json({ error: "Usuário que retirou não existe." });
    }

    return res.status(500).json({ error: "Falha ao registrar retirada" });
  }
});

// EXCLUIR UM ITEM
// DELETE /item/:id
router.delete("/:id", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    await prisma.item.delete({
      where: { id },
    });

    res.status(200).json({ message: "Item deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir item:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Item não encontrado para deletar" });
    }

    return res.status(500).json({ error: "Falha ao deletar item" });
  }
});

module.exports = router;