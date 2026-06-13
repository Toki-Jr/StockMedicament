-- AlterTable
ALTER TABLE "mouvementstock" ADD COLUMN     "id_user" INTEGER;

-- AddForeignKey
ALTER TABLE "mouvementstock" ADD CONSTRAINT "mouvementstock_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
