-- DropForeignKey
ALTER TABLE "lot" DROP CONSTRAINT "lot_id_medoc_fkey";

-- CreateTable
CREATE TABLE "lotmedicament" (
    "id" SERIAL NOT NULL,
    "id_lot" INTEGER NOT NULL,
    "id_medoc" INTEGER NOT NULL,
    "quantite_entre" INTEGER NOT NULL,
    "quantite_sortie" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lotmedicament_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lotmedicament_id_lot_id_medoc_key" ON "lotmedicament"("id_lot", "id_medoc");

-- AddForeignKey
ALTER TABLE "lotmedicament" ADD CONSTRAINT "lotmedicament_id_lot_fkey" FOREIGN KEY ("id_lot") REFERENCES "lot"("id_lot") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotmedicament" ADD CONSTRAINT "lotmedicament_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE RESTRICT ON UPDATE CASCADE;
