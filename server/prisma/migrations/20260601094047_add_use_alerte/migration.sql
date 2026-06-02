-- AlterTable
ALTER TABLE "alerte" ADD COLUMN     "id_user" INTEGER;

-- AddForeignKey
ALTER TABLE "alerte" ADD CONSTRAINT "alerte_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
