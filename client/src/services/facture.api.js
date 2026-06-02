import api from "./axios.instance";

/**
 * Appelle POST /api/factures/facturer
 * Génère le PDF ET envoie l'email automatiquement côté serveur.
 */
export async function facturer(payload) {
  const { data } = await api.post("/factures/facturer", payload);
  if (!data.success) {
    throw new Error(data.message || "Erreur lors de la facturation.");
  }
  return data;
  // retourne : { success, message, numeroFacture, totalGeneral,
  //              fileName, downloadUrl, email: { statut, erreur, destinataire } }
}

export function getDownloadUrl(fileName) {
  return `${api.defaults.baseURL}/factures/telecharger/${fileName}`;
}