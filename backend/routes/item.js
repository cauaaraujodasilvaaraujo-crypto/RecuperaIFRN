// ATUALIZAR UM ITEM
// PUT /Itens/:id
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

    if (tipo !== undefined && !Object.values(TipoRegistro).includes(tipo)) {
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
      ...(nome !== undefined && { nome }),
      ...(descricao !== undefined && { descricao: descricao || null }),
      ...(cor !== undefined && { cor: cor || null }),
      ...(classificacaoIdNum !== undefined && { classificacaoId: classificacaoIdNum }),
      ...(tipo !== undefined && { tipo }),
      ...(dataEncontradoDate !== undefined && { dataEncontrado: dataEncontradoDate }),
      ...(localEncontrado !== undefined && { localEncontrado }),
      ...(foto !== undefined && { foto: foto || null }),
    };

    const itemAtualizado = await prisma.item.update({
      where: { id },
      data: dadosAtualizados,
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
// PATCH /Itens/:id/retirar
router.patch("/:id/retirar", authMiddleware, requireAdmin, async function (req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const { retiradoPorMatricula, dataEntrega, localEntrega } = req.body;

    const retiradoPorNum = parseId(retiradoPorMatricula);
    const dataEntregaDate = dataEntrega ? parseData(dataEntrega) : new Date();

    if (retiradoPorNum === null || !dataEntregaDate || !localEntrega) {
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
        localEntrega,
        retiradoPorMatricula: retiradoPorNum,
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
// DELETE /Itens/:id
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