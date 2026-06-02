/*
  Warnings:

  - You are about to drop the column `id_medoc` on the `commande` table. All the data in the column will be lost.
  - You are about to drop the column `quantite` on the `commande` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "commande" DROP CONSTRAINT "commande_id_medoc_fkey";

-- AlterTable
ALTER TABLE "commande" DROP COLUMN "id_medoc",
DROP COLUMN "quantite",
ADD COLUMN     "motif_rejet" TEXT;

-- CreateTable
CREATE TABLE "lignecommande" (
    "id_ligne" SERIAL NOT NULL,
    "quantite" INTEGER NOT NULL,
    "id_commande" INTEGER NOT NULL,
    "id_medoc" INTEGER NOT NULL,

    CONSTRAINT "lignecommande_pkey" PRIMARY KEY ("id_ligne")
);

-- AddForeignKey
ALTER TABLE "lignecommande" ADD CONSTRAINT "lignecommande_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "commande"("id_commande") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignecommande" ADD CONSTRAINT "lignecommande_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE RESTRICT ON UPDATE CASCADE;
