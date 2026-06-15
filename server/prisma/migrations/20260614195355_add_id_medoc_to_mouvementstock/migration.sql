-- AlterTable
ALTER TABLE "mouvementstock" ADD COLUMN     "id_medoc" INTEGER;

-- AddForeignKey
ALTER TABLE "mouvementstock" ADD CONSTRAINT "mouvementstock_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE SET NULL ON UPDATE CASCADE;
