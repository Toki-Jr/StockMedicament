import { useState, useEffect } from 'react';
import { useCommandes } from '../hooks/useCommandes';
import { useAuth } from '../context/AuthContext';
import { getMedicaments } from '../services/medicament.api';
import MedicamentSearch from './MedicamentSearch';
import {
  Plus, Trash2, Send, CheckCircle2, XCircle,
  Hourglass, FileEdit, PackageCheck, X, Loader2,
  ClipboardList, ShoppingCart
} from 'lucide-react';

const STATUT_META = {
  brouillon:  { label: 'Brouillon',  badge: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400', Icon: FileEdit },
  en_attente: { label: 'En attente', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30', Icon: Hourglass },
  validee:    { label: 'Validée',    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30', Icon: PackageCheck },
  rejetee:    { label: 'Rejetée',    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30', Icon: XCircle },
};

export default function CommandesPage() {
  const { commandes, loading, error, create, envoyer, removeBrouillon, removeCommande, valider, rejeter } = useCommandes();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [sidebar,      setSidebar]    = useState(null);
  const [selected,     setSelected]   = useState(null);
  const [motif,        setMotif]      = useState('');
  const [motifErr,     setMotifErr]   = useState('');
  const [saving,       setSaving]     = useState(false);
  const [toast,        setToast]      = useState(null);
  const [medicaments,  setMeds]       = useState([]);
  
  const [panier,       setPanier]     = useState([]); 
  const [itemForm,     setItemForm]   = useState({ id_medoc: '', quantite: '' }); 
  const [formErr,      setFormErr]    = useState({});
  const [filtreStatut, setFiltre]     = useState('');

  useEffect(() => { getMedicaments().then(setMeds).catch(() => {}); }, []);

  const openSidebar = (type, commande = null) => {
    setSelected(commande);
    setMotif('');
    setMotifErr('');
    setFormErr({});
    if (type === 'create') {
      setPanier([]); 
      setItemForm({ id_medoc: '', quantite: '' });
    }
    setSidebar(type);
  };
  
  const closeSidebar = () => { setSidebar(null); setSelected(null); };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToPanier = () => {
    const errors = {};
    if (!itemForm.id_medoc) errors.id_medoc = 'Requis';
    if (!itemForm.quantite || isNaN(itemForm.quantite) || parseInt(itemForm.quantite) <= 0) {
      errors.quantite = 'Quantité invalide';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErr(errors);
      return;
    }

    const medocSelectionne = medicaments.find(m => m.id_medoc === parseInt(itemForm.id_medoc));
    
    setPanier(currentPanier => {
      const indexExistant = currentPanier.findIndex(item => item.id_medoc === medocSelectionne.id_medoc);
      if (indexExistant !== -1) {
        return currentPanier.map((item, i) =>
          i === indexExistant
            ? { ...item, quantite: item.quantite + parseInt(itemForm.quantite) } // ← nouvel objet
            : item
        );
      }
      return [...currentPanier, {
        id_medoc: medocSelectionne.id_medoc,
        nom: medocSelectionne.nom,
        quantite: parseInt(itemForm.quantite)
      }];
    });

    setItemForm({ id_medoc: '', quantite: '' });
    setFormErr({});
  };

  const handleRemoveFromPanier = (id_medoc) => {
    setPanier(currentPanier => currentPanier.filter(item => item.id_medoc !== id_medoc));
  };

  const handleCreateCommande = async () => {
    if (panier.length === 0) {
      showToast('Votre panier est vide', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        lignes: panier.map(item => ({
          id_medoc: item.id_medoc,
          quantite: item.quantite
        }))
      };
      await create(payload);
      closeSidebar();
      setPanier([]);
      showToast('Brouillon créé avec succès depuis le panier');
    } catch (e) { 
      showToast(e.response?.data?.message || 'Erreur', 'error'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleEnvoyer = async () => {
    setSaving(true);
    try { await envoyer(selected.id_commande); closeSidebar(); showToast("Commande envoyée"); }
    catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await removeBrouillon(selected.id_commande); closeSidebar(); showToast('Brouillon supprimé'); }
    catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleValider = async () => {
    setSaving(true);
    try { await valider(selected.id_commande, motif); closeSidebar(); showToast('Commande validée'); }
    catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleRejeter = async () => {
    if (!motif.trim()) { setMotifErr('Le motif est obligatoire'); return; }
    setSaving(true);
    try { await rejeter(selected.id_commande, motif); closeSidebar(); showToast('Commande rejetée'); }
    catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

    const handleRemoveCommande = async () => {
      setSaving(true);
      try { await removeCommande(selected.id_commande); closeSidebar(); showToast('Commande supprimée'); }
      catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
      finally { setSaving(false); }
    };

  const CONFIGS = {
    create:  { title: 'Nouvelle commande',      icon: <Plus size={16} />,     colorType: 'emerald', confirmLabel: 'Créer la commande',    onConfirm: handleCreateCommande },
    envoyer: { title: 'Envoyer la commande',    icon: <Send size={14} />,     colorType: 'emerald', confirmLabel: 'Envoyer',                onConfirm: handleEnvoyer },
    delete:  { title: 'Supprimer le brouillon', icon: <Trash2 size={15} />,   colorType: 'red',     confirmLabel: 'Supprimer',              onConfirm: handleDelete  },
    removeCommande:  { title: 'Supprimer la commande', icon: <Trash2 size={15} />, colorType: 'red', confirmLabel: 'Supprimer définitivement', onConfirm: handleRemoveCommande },
    valider: { title: 'Valider la commande',    icon: <CheckCircle2 size={15} />, colorType: 'emerald', confirmLabel: 'Confirmer la validation', onConfirm: handleValider },
    rejeter: { title: 'Rejeter la commande',    icon: <XCircle size={15} />,    colorType: 'red',     confirmLabel: 'Confirmer le rejet',     onConfirm: handleRejeter },
  };
  const cfg = sidebar ? CONFIGS[sidebar] : null;

  const listeFiltrée = commandes.filter(c => {
    if (isAdmin) return c.statut === 'en_attente';
    if (!filtreStatut) return true;
    return c.statut === filtreStatut;
  });

  return (
    <div className="h-screen flex overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[2000] text-white px-5 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 text-dynamic border transition-all ${
          toast.type === 'error' ? 'bg-red-600 border-red-500' : 'bg-emerald-700 border-emerald-600'
        }`}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="bg-transparent border-none text-white cursor-pointer flex items-center p-0 ml-1 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">
        {!isAdmin && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h1 className="text-dynamic font-medium tracking-tight leading-tight text-gray-900 dark:text-white">
                    Mes <span className="text-emerald-700 dark:text-emerald-400">commandes</span>
                  </h1>
                  <p className="text-dynamic text-gray-500 dark:text-neutral-400 mt-0.5">Gérez vos paniers d'approvisionnement médicaux</p>
                </div>
              </div>
              {!sidebar && (
                <button
                  onClick={() => openSidebar('create')}
                  className="flex items-center gap-2 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white border-none cursor-pointer bg-emerald-700 hover:bg-emerald-800 transition-colors"
                >
                  <Plus size={15} /> Nouvelle commande
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap shrink-0">
              {['', 'brouillon', 'en_attente', 'validee', 'rejetee'].map(s => {
                const isSelected = filtreStatut === s;
                return (
                  <button key={s} onClick={() => setFiltre(s)} className={`px-4 py-1.5 rounded-full text-dynamic font-medium transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-700 text-white border-transparent' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700/70'
                  }`}>
                    {s === '' ? 'Toutes' : STATUT_META[s]?.label}
                  </button>
                );
              })}
            </div>

            <CommandeTable commandes={listeFiltrée} loading={loading} error={error}
              renderActions={(c) => c.statut === 'brouillon' ? (
                <div className="flex gap-1.5">
                  <ActionBtn type="emerald" icon={<Send size={13} />} label="Envoyer" onClick={() => openSidebar('envoyer', c)} />
                  <ActionBtn type="red" icon={<Trash2 size={13} />} label="Supprimer" onClick={() => openSidebar('delete', c)} />
                </div>
              ) : c.statut === 'rejetee' || c.statut === 'validee' ? (
                <ActionBtn type="red" icon={<Trash2 size={13} />} label="Supprimer" onClick={() => openSidebar('removeCommande', c)} />
              ) : (
                <span className="text-dynamic text-gray-400 dark:text-neutral-500 italic">Lecture seule</span>
              )}
            />
          </>
        )}

        {/* Vue Admin */}
        {isAdmin && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
              <h1 className="text-dynamic font-medium text-gray-900 dark:text-white">
                Commandes <span className="text-emerald-700 dark:text-emerald-400">en attente</span>
              </h1>
            </div>
            <CommandeTable commandes={listeFiltrée} loading={loading} error={error} showUser
              renderActions={(c) => (
                <div className="flex gap-1.5">
                  <ActionBtn type="emerald" icon={<CheckCircle2 size={13} />} label="Valider" onClick={() => openSidebar('valider', c)} disabled={saving} />
                  <ActionBtn type="red" icon={<XCircle size={13} />} label="Rejeter" onClick={() => openSidebar('rejeter', c)} disabled={saving} />
                  <ActionBtn type="red" icon={<Trash2 size={13} />} label="Supprimer" onClick={() => openSidebar('removeCommande', c)} disabled={saving} />
                </div>
              )}
            />
          </>
        )}
      </div>

      {/* ── SIDEBAR DROITE (PANIER / CONFIRMATIONS) ── */}
      <div className={`shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 ${
        sidebar ? 'w-[380px] border-l' : 'w-0 border-l-0'
      }`}>
        <div className="w-[380px] flex flex-col h-full">
          {cfg && (
            <>
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                    cfg.colorType === 'emerald' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30' 
                      : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
                  }`}>{cfg.icon}</div>
                  <h2 className="text-dynamic font-medium text-gray-900 dark:text-white">{cfg.title}</h2>
                </div>
                <button onClick={closeSidebar} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer border-none bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"><X size={15} /></button>
              </div>

              <div className={`h-[3px] opacity-70 ${cfg.colorType === 'emerald' ? 'bg-emerald-700' : 'bg-red-500'}`} />

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                {/* 🛒 PANIER LOCAL */}
                {sidebar === 'create' && (
                  <div className="flex flex-col gap-4">
                    
                    {/* Formulaire sélection */}
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 flex flex-col gap-3 bg-gray-50/50 dark:bg-neutral-800/20">
                      <p className="text-dynamic font-medium text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <ShoppingCart size={14} className="text-emerald-700 dark:text-emerald-400" /> Sélectionner un article
                      </p>
                      
                      <Field label="Médicament *" error={formErr.id_medoc}>
                        <MedicamentSearch
                          medicaments={medicaments}
                          value={itemForm.id_medoc}
                          onChange={(id) => {
                            setItemForm(p => ({ ...p, id_medoc: id }));
                            setFormErr(p => ({ ...p, id_medoc: '' }));
                          }}
                          error={formErr.id_medoc}
                        />
                      </Field>

                      <Field label="Quantité *" error={formErr.quantite}>
                        <input type="number" min="1" 
                          className={`w-full px-2.5 py-2 rounded-lg text-dynamic bg-white dark:bg-neutral-900 outline-none text-gray-900 dark:text-white border ${
                            formErr.quantite ? 'border-red-500' : 'border-gray-200 dark:border-neutral-800'
                          }`}
                          placeholder="Ex: 50" value={itemForm.quantite}
                          onChange={e => setItemForm(p => ({ ...p, quantite: e.target.value }))}
                        />
                      </Field>

                      <button type="button" onClick={handleAddToPanier} className="w-full mt-1 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-1 transition-opacity bg-emerald-700 hover:bg-emerald-800">
                        <Plus size={14} /> Ajouter au panier
                      </button>
                    </div>

                    {/* Liste des articles du panier */}
                    <div className="flex flex-col gap-2.5 flex-1 min-h-[180px]">
                      <p className="text-dynamic text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wide">
                        Articles sélectionnés ({panier.length})
                      </p>
                      
                      {panier.length === 0 ? (
                        <div className="flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-500 opacity-80">
                          <ShoppingCart size={20} className="mb-1.5 text-emerald-700 dark:text-emerald-400" />
                          <p className="text-dynamic text-xs">Le panier est vide</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[38vh] overflow-y-auto pr-1">
                          {panier.map((item) => (
                            <div key={item.id_medoc} className="flex items-center justify-between p-2.5 rounded-lg border bg-gray-50 border-gray-200 dark:bg-neutral-800/40 dark:border-neutral-800">
                              <div className="flex flex-col">
                                <span className="text-dynamic font-medium text-gray-900 dark:text-white">{item.nom}</span>
                                <span className="text-dynamic text-xs font-semibold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 mt-1 self-start">
                                  Quantité : {item.quantite}
                                </span>
                              </div>
                              
                              <button type="button" onClick={() => handleRemoveFromPanier(item.id_medoc)}
                                className="p-2 rounded-md border-none text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 cursor-pointer transition-colors flex items-center justify-center">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confirmations Relatives aux Actions standard */}
                {sidebar === 'envoyer' && <ConfirmCard colorType="emerald" icon={<Send size={24} />} title="Envoyer au traitement ?" desc={`Dossier #${selected?.id_commande}`} note="Inmodifiable après envoi." />}
                {sidebar === 'delete' && <ConfirmCard colorType="red" icon={<Trash2 size={24} />} title="Supprimer ce brouillon ?" desc={`Dossier #${selected?.id_commande}`} note="Action irréversible." />}
                {sidebar === 'removeCommande' && (
                  <ConfirmCard colorType="red" icon={<Trash2 size={24} />} title="Supprimer cette commande ?" desc={`Dossier #${selected?.id_commande}`} note="Action irréversible, toutes les lignes seront supprimées." />
                )}
                {sidebar === 'valider' && (
                  <>
                    <ConfirmCard colorType="emerald" icon={<CheckCircle2 size={24} />} title="Valider la commande globale ?" desc={`Dossier #${selected?.id_commande}`} />
                    <Field label="Note optionnelle">
                      <textarea rows={3} className="w-full px-3 py-2 rounded-lg text-dynamic bg-gray-50 text-gray-900 dark:bg-neutral-800 dark:text-white border border-gray-200 dark:border-neutral-800 outline-none focus:border-emerald-600" value={motif} onChange={e => setMotif(e.target.value)} />
                    </Field>
                  </>
                )}
                {sidebar === 'rejeter' && (
                  <>
                    <ConfirmCard colorType="red" icon={<XCircle size={24} />} title="Refuser la demande ?" desc={`Dossier #${selected?.id_commande}`} />
                    <Field label="Motif de rejet *" error={motifErr}>
                      <textarea rows={3} className="w-full px-3 py-2 rounded-lg text-dynamic bg-gray-50 text-gray-900 dark:bg-neutral-800 dark:text-white border border-gray-200 dark:border-neutral-800 outline-none focus:border-red-500" value={motif} onChange={e => { setMotif(e.target.value); setMotifErr(''); }} />
                    </Field>
                  </>
                )}
              </div>

              {/* Footer Panel */}
              <div className="px-5 py-4 flex gap-2.5 shrink-0 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
                <button onClick={closeSidebar} className="flex-1 py-2.5 rounded-lg text-dynamic font-medium cursor-pointer bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700 transition-colors">Annuler</button>
                <button onClick={cfg.onConfirm} disabled={saving || (sidebar === 'create' && panier.length === 0)}
                  className={`flex-1 py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${
                    cfg.colorType === 'emerald' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-600 hover:bg-red-700'
                  }`}>
                  {saving ? <><Loader2 size={13} className="animate-spin" /> Process...</> : cfg.confirmLabel}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmCard({ colorType, icon, title, desc, note }) {
  const isEmerald = colorType === 'emerald';
  return (
    <div className={`rounded-xl p-4 flex gap-4 items-start border ${
      isEmerald 
        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400' 
        : 'bg-red-50/60 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400'
    }`}>
      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border bg-white dark:bg-neutral-900 border-inherit">{icon}</div>
      <div className="flex flex-col gap-0.5 text-dynamic">
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-gray-600 dark:text-neutral-400">{desc}</p>
        {note && <p className={`mt-1 text-xs italic ${isEmerald ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-500'}`}>{note}</p>}
      </div>
    </div>
  );
}

function CommandeTable({ commandes, loading, error, renderActions, showUser = false }) {
  if (loading) return <div className="py-16 text-center"><Loader2 className="animate-spin mx-auto mb-2 text-emerald-700 dark:text-emerald-400" size={24} /><p className="text-dynamic text-gray-500 dark:text-neutral-400">Chargement...</p></div>;
  if (error) return <div className="px-4 py-3 rounded-lg text-dynamic bg-red-50 text-red-500 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30">{error}</div>;
  if (commandes.length === 0) return <div className="py-16 text-center rounded-xl border border-gray-200 dark:border-neutral-800"><p className="text-dynamic text-gray-400 dark:text-neutral-500">Aucune commande répertoriée</p></div>;

  const cols = ['Détails Commande', showUser && 'Demandeur', 'Date', 'Statut' ,'Prix total', 'Actions'].filter(Boolean);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-dynamic">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 dark:bg-neutral-900 dark:border-neutral-800 sticky top-0 z-10 text-gray-500 dark:text-neutral-400">
              {cols.map(h => <th key={h} className="px-4 py-3 font-medium uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
            {commandes.map((c, i) => {
              const meta = STATUT_META[c.statut] ?? STATUT_META.en_attente;
              const { Icon } = meta;
              
              const lignesMeds = c.lignes || (c.medicament ? [{ medicament: c.medicament, quantite: c.quantite }] : []);
              const montantTotalCommande = lignesMeds.reduce((acc, currentLigne) => {
                const prixUnitaire = currentLigne.medicament?.prix_unitaire ?? 0;
                return acc + (currentLigne.quantite * prixUnitaire);
              }, 0);

              return (
                <tr key={c.id_commande} className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-neutral-800/20 ${i % 2 !== 0 ? 'bg-gray-50/20 dark:bg-neutral-800/10' : 'bg-transparent'}`}>
                  <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-gray-900 dark:text-neutral-200">
                      {lignesMeds
                        .map(l => `${l.medicament?.nom ?? 'Inconnu'} (x${l.quantite})`)
                        .join(', ')}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-neutral-500">
                      {lignesMeds.length} article{lignesMeds.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                  
                  {showUser && (
                    <td className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                      {c.user ? `${c.user.nom} ${c.user.prenom}` : '—'}
                    </td>
                  )}
                  
                  <td className="px-4 py-3 text-gray-400 dark:text-neutral-500">
                    {new Date(c.date_commande).toLocaleDateString('fr-FR')}
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-dynamic font-medium border ${meta.badge}`}>
                      <Icon size={11} /> {meta.label}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white">
                    {montantTotalCommande.toLocaleString('fr-FR')} Ar
                  </td>

                  <td className="px-4 py-3">{renderActions(c)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1 text-left">
      <label className="text-dynamic font-medium text-xs uppercase tracking-wide text-gray-400 dark:text-neutral-500">{label}</label>
      {children}
      {error && <span className="text-dynamic text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

function ActionBtn({ type, icon, label, onClick, disabled }) {
  const isEmerald = type === 'emerald';
  return (
    <button onClick={onClick} disabled={disabled} 
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-dynamic font-medium cursor-pointer border disabled:opacity-50 transition-all ${
        isEmerald 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 dark:hover:bg-emerald-900/40' 
          : 'bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/40'
      }`}>
      {icon} {label}
    </button>
  );
}