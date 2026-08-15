-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "photo" TEXT,
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "approuve" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicament" (
    "id_medoc" SERIAL NOT NULL,
    "code_cip" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "forme" TEXT NOT NULL,
    "dosage" DECIMAL(65,30) NOT NULL,
    "prix_unitaire" INTEGER NOT NULL,
    "seuil_alerte_qte" INTEGER NOT NULL,
    "seuil_alerte_peremption" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicament_pkey" PRIMARY KEY ("id_medoc")
);

-- CreateTable
CREATE TABLE "lot" (
    "id_lot" SERIAL NOT NULL,
    "numero_lot" TEXT NOT NULL,
    "date_fabrication" TIMESTAMP(3) NOT NULL,
    "date_expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_pkey" PRIMARY KEY ("id_lot")
);

-- CreateTable
CREATE TABLE "lotmedicament" (
    "id" SERIAL NOT NULL,
    "id_lot" INTEGER NOT NULL,
    "id_medoc" INTEGER NOT NULL,
    "quantite_entre" INTEGER NOT NULL,
    "quantite_sortie" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lotmedicament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvementstock" (
    "id_mvt" SERIAL NOT NULL,
    "type_mvt" TEXT NOT NULL,
    "quantite_mvt" INTEGER NOT NULL,
    "date_mvt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT NOT NULL,
    "id_lot" INTEGER NOT NULL,
    "id_user" INTEGER,
    "id_medoc" INTEGER,

    CONSTRAINT "mouvementstock_pkey" PRIMARY KEY ("id_mvt")
);

-- CreateTable
CREATE TABLE "commande" (
    "id_commande" SERIAL NOT NULL,
    "date_commande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'brouillon',
    "motif_rejet" TEXT,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "commande_pkey" PRIMARY KEY ("id_commande")
);

-- CreateTable
CREATE TABLE "alerte" (
    "id_alerte" SERIAL NOT NULL,
    "type_alerte" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "role_cible" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_user" INTEGER,
    "id_medoc" INTEGER,

    CONSTRAINT "alerte_pkey" PRIMARY KEY ("id_alerte")
);

-- CreateTable
CREATE TABLE "historique" (
    "id_historique" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "id_user" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historique_pkey" PRIMARY KEY ("id_historique")
);

-- CreateTable
CREATE TABLE "lignecommande" (
    "id_ligne" SERIAL NOT NULL,
    "quantite" INTEGER NOT NULL,
    "id_commande" INTEGER NOT NULL,
    "id_medoc" INTEGER NOT NULL,

    CONSTRAINT "lignecommande_pkey" PRIMARY KEY ("id_ligne")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "medicament_code_cip_key" ON "medicament"("code_cip");

-- CreateIndex
CREATE UNIQUE INDEX "lotmedicament_id_lot_id_medoc_key" ON "lotmedicament"("id_lot", "id_medoc");

-- CreateIndex
CREATE INDEX "alerte_id_user_idx" ON "alerte"("id_user");

-- AddForeignKey
ALTER TABLE "lotmedicament" ADD CONSTRAINT "lotmedicament_id_lot_fkey" FOREIGN KEY ("id_lot") REFERENCES "lot"("id_lot") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotmedicament" ADD CONSTRAINT "lotmedicament_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvementstock" ADD CONSTRAINT "mouvementstock_id_lot_fkey" FOREIGN KEY ("id_lot") REFERENCES "lot"("id_lot") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvementstock" ADD CONSTRAINT "mouvementstock_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvementstock" ADD CONSTRAINT "mouvementstock_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "commande_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerte" ADD CONSTRAINT "alerte_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerte" ADD CONSTRAINT "alerte_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique" ADD CONSTRAINT "historique_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignecommande" ADD CONSTRAINT "lignecommande_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "commande"("id_commande") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignecommande" ADD CONSTRAINT "lignecommande_id_medoc_fkey" FOREIGN KEY ("id_medoc") REFERENCES "medicament"("id_medoc") ON DELETE RESTRICT ON UPDATE CASCADE;
