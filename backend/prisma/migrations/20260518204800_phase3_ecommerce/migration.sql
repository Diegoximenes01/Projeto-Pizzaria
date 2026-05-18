-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "taxaEntrega" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "tipoEntrega" TEXT NOT NULL DEFAULT 'Retirada',
ADD COLUMN     "tipoPagamento" TEXT NOT NULL DEFAULT 'Dinheiro',
ADD COLUMN     "trocoPara" DOUBLE PRECISION,
ADD COLUMN     "usuarioId" TEXT;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
