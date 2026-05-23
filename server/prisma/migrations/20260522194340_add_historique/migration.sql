-- CreateTable
CREATE TABLE "historique" (
    "id_historique" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "id_user" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historique_pkey" PRIMARY KEY ("id_historique")
);

-- AddForeignKey
ALTER TABLE "historique" ADD CONSTRAINT "historique_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
