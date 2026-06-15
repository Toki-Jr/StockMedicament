/*
  Warnings:

  - You are about to drop the column `id_medoc` on the `lot` table. All the data in the column will be lost.
  - You are about to drop the column `quantite_entre` on the `lot` table. All the data in the column will be lost.
  - You are about to drop the column `quantite_sortie` on the `lot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lot" DROP COLUMN "id_medoc",
DROP COLUMN "quantite_entre",
DROP COLUMN "quantite_sortie";
