const prisma = require('./prisma/client');

async function seed() {
  const categorias = [
    "Eletrônicos (Celular, Fone, Carregador)",
    "Documentos e Cartões",
    "Chaves",
    "Mochilas, Bolsas e Estojos",
    "Garrafas e Copos",
    "Roupas e Casacos",
    "Livros e Cadernos",
    "Outros"
  ];

  console.log('Verificando categorias padrão...');
  for (const nome of categorias) {
    await prisma.classificacao.upsert({
      where: { nome },
      update: {},
      create: { nome }
    });
  }

  console.log('Categorias padrão cadastradas com sucesso!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
