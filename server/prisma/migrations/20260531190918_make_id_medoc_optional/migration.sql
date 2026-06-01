-- DropForeignKey
ALTER TABLE "alerte" DROP CONSTRAINT "alerte_id_medoc_fkey";

-- AlterTable
ALTER TABLE "alerte" ALTER COLUMN "id_medoc" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "alerte" ADD CONSTRAINT "alerte_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE SET NULL ON UPDATE CASCADE;
