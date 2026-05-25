import { useState, useEffect } from 'react';
import { useCommandes } from '../hooks/useCommandes';
import { useAuth } from '../context/AuthContext';
import { getMedicaments } from '../services/medicament.api';
import {
  Plus, Trash2, Send, CheckCircle2, XCircle,
  Hourglass, FileEdit, PackageCheck, X, Loader2,
  ClipboardList, ShoppingCart
} from 'lucide-react';

const STATUT_META = {
  brouillon:  { label: 'Brouillon',  bg: '#f3f4f6', color: '#6b7280', Icon: FileEdit     },
  en_attente: { label: 'En attente', bg: '#fef9c3', color: '#854d0e', Icon: Hourglass    },
  validee:    { label: 'Validée',    bg: '#dcfce7', color: '#166534', Icon: PackageCheck },
  rejetee:    { label: 'Rejetée',    bg: '#fee2e2', color: '#991b1b', Icon: XCircle      },
};

const C = {
  green:      '#22c55e',
  greenDark:  '#16a34a',
  greenSoft:  'rgba(34,197,94,0.10)',
  greenBdr:   'rgba(34,197,94,0.25)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.10)',
  redBdr:     'rgba(239,68,68,0.25)',
};

export default function CommandesPage() {
  const { commandes, loading, error, create, envoyer, removeBrouillon, valider, rejeter } = useCommandes();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [sidebar,      setSidebar]    = useState(null);
  const [selected,     setSelected]   = useState(null);
  const [motif,        setMotif]      = useState('');
  const [motifErr,     setMotifErr]   = useState('');
  const [saving,       setSaving]     = useState(false);
  const [toast,        setToast]      = useState(null);
  const [medicaments,  setMeds]       = useState([]);
  
  // ── ÉTATS POUR LE PANIER LOCAL ──
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

  // ── LOGIQUE DU PANIER VERT ──
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
        const copy = [...currentPanier];
        copy[indexExistant].quantite += parseInt(itemForm.quantite);
        return copy;
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

  // ── ACTIONS STANDARDS ──
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

  const CONFIGS = {
    create:  { title: 'Nouvelle commande',      icon: <Plus size={16} color={C.greenDark} />,    accent: C.greenDark, accentSoft: C.greenSoft, accentBdr: C.greenBdr, confirmLabel: 'Créer la commande',    onConfirm: handleCreateCommande },
    envoyer: { title: 'Envoyer la commande',    icon: <Send size={16} color={C.greenDark} />,    accent: C.greenDark, accentSoft: C.greenSoft, accentBdr: C.greenBdr, confirmLabel: 'Envoyer',                onConfirm: handleEnvoyer },
    delete:  { title: 'Supprimer le brouillon', icon: <Trash2 size={16} color={C.red} />,        accent: C.red,       accentSoft: C.redSoft,   accentBdr: C.redBdr,   confirmLabel: 'Supprimer',              onConfirm: handleDelete  },
    valider: { title: 'Valider la commande',    icon: <CheckCircle2 size={16} color={C.greenDark}/>, accent: C.greenDark, accentSoft: C.greenSoft, accentBdr: C.greenBdr, confirmLabel: 'Confirmer la validation', onConfirm: handleValider },
    rejeter: { title: 'Rejeter la commande',    icon: <XCircle size={16} color={C.red} />,       accent: C.red,       accentSoft: C.redSoft,   accentBdr: C.redBdr,   confirmLabel: 'Confirmer le rejet',     onConfirm: handleRejeter },
  };
  const cfg = sidebar ? CONFIGS[sidebar] : null;

  const listeFiltrée = commandes.filter(c => {
    if (isAdmin) return c.statut === 'en_attente';
    if (!filtreStatut) return true;
    return c.statut === filtreStatut;
  });

  return (
    <div className="h-screen flex overflow-hidden rounded-xl border border-white/[0.05] shadow-2xl">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-[2000] text-white px-5 py-3 rounded-[10px] font-semibold text-dynamic shadow-lg flex items-center gap-2"
          style={{ background: toast.type === 'error' ? C.red : C.greenDark }}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="bg-transparent border-none text-white cursor-pointer flex items-center"><X size={14} /></button>
        </div>
      )}

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">
        {!isAdmin && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                     style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}>
                  <ClipboardList size={20} color={C.green} />
                </div>
                <div>
                  <h1 className="text-dynamic font-medium tracking-tight leading-tight text-[var(--text-primary)]">
                    Mes <span style={{ color: C.green }}>commandes</span>
                  </h1>
                  <p className="text-dynamic text-[var(--text-muted)] mt-0.5">Gérez vos paniers d'approvisionnement médicaux</p>
                </div>
              </div>
              {!sidebar && (
                <button
                  onClick={() => openSidebar('create')}
                  className="flex items-center gap-2 px-[18px] py-[9px] rounded-lg text-dynamic font-medium text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: C.greenDark }}
                >
                  <Plus size={15} /> Nouvelle commande
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap shrink-0">
              {['', 'brouillon', 'en_attente', 'validee', 'rejetee'].map(s => (
                <button key={s} onClick={() => setFiltre(s)} className="px-4 py-1.5 rounded-full text-dynamic font-medium transition-all border cursor-pointer"
                  style={{
                    background:  filtreStatut === s ? C.greenDark : 'var(--bg-sidebar)',
                    color:       filtreStatut === s ? '#fff'       : 'var(--text-muted)',
                    borderColor: filtreStatut === s ? C.greenDark  : 'var(--border)',
                  }}>{s === '' ? 'Toutes' : STATUT_META[s]?.label}</button>
              ))}
            </div>

            <CommandeTable commandes={listeFiltrée} loading={loading} error={error}
              renderActions={(c) => c.statut === 'brouillon' ? (
                <div className="flex gap-1.5">
                  <ActionBtn icon={<Send size={13} />}   label="Envoyer"   color={C.greenDark} onClick={() => openSidebar('envoyer', c)} />
                  <ActionBtn icon={<Trash2 size={13} />} label="Supprimer" color={C.red}       onClick={() => openSidebar('delete', c)} />
                </div>
              ) : <span className="text-dynamic text-[var(--text-muted)] italic">Lecture seule</span>}
            />
          </>
        )}

        {/* Vue Admin */}
        {isAdmin && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
              <h1 className="text-dynamic font-medium text-[var(--text-primary)]">Commandes <span style={{ color: C.green }}>en attente</span></h1>
            </div>
            <CommandeTable commandes={listeFiltrée} loading={loading} error={error} showUser
              renderActions={(c) => (
                <div className="flex gap-1.5">
                  <ActionBtn icon={<CheckCircle2 size={13} />} label="Valider" color={C.greenDark} onClick={() => openSidebar('valider', c)} disabled={saving} />
                  <ActionBtn icon={<XCircle size={13} />}      label="Rejeter" color={C.red}       onClick={() => openSidebar('rejeter', c)} disabled={saving} />
                </div>
              )}
            />
          </>
        )}
      </div>

      {/* ── SIDEBAR DROITE (PANIER / CONFIRMATIONS) ── */}
      <div className="shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: sidebar ? '380px' : '0px', borderLeft: sidebar ? '0.5px solid var(--border)' : 'none', background: 'var(--bg-content)' }}>
        <div className="w-[380px] flex flex-col h-full">
          {cfg && (
            <>
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: cfg.accentSoft, border: `0.5px solid ${cfg.accentBdr}` }}>{cfg.icon}</div>
                  <h2 className="text-dynamic font-medium text-[var(--text-primary)]">{cfg.title}</h2>
                </div>
                <button onClick={closeSidebar} className="w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer border-none" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}><X size={15} /></button>
              </div>

              <div style={{ height: '3px', background: cfg.accent, opacity: 0.7 }} />

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                {/* 🛒 COMPOSANT PANIER LOCAL DANS LA SIDEBAR */}
                {sidebar === 'create' && (
                  <div className="flex flex-col gap-4">
                    
                    {/* Bloc d'ajout d'une ligne */}
                    <div className="p-3.5 rounded-xl border border-dashed flex flex-col gap-3 bg-[var(--bg-sidebar)]" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-dynamic font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <ShoppingCart size={14} color={C.greenDark} /> Sélectionner un article
                      </p>
                      
                      <Field label="Médicament *" error={formErr.id_medoc}>
                        <select className="w-full px-2.5 py-2 rounded-lg text-dynamic outline-none"
                          value={itemForm.id_medoc}
                          onChange={e => setItemForm(p => ({ ...p, id_medoc: e.target.value }))}>
                          <option value="">-- Choisir --</option>
                          {medicaments.map(m => <option key={m.id_medoc} value={m.id_medoc}>{m.nom}</option>)}
                        </select>
                      </Field>

                      <Field label="Quantité *" error={formErr.quantite}>
                        <input type="number" min="1" className="w-full px-2.5 py-2 rounded-lg text-dynamic outline-none"
                          style={{ background: 'var(--bg-content)', border: `0.5px solid ${formErr.quantite ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                          placeholder="Ex: 50" value={itemForm.quantite}
                          onChange={e => setItemForm(p => ({ ...p, quantite: e.target.value }))}
                        />
                      </Field>

                      <button type="button" onClick={handleAddToPanier} className="w-full mt-1 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-1 transition-opacity hover:opacity-95"
                        style={{ background: C.greenDark }}>
                        <Plus size={14} /> Ajouter au panier
                      </button>
                    </div>

                    {/* Liste en temps réel des articles du panier */}
                    <div className="flex flex-col gap-2.5 flex-1 min-h-[180px]">
                      <p className="text-dynamic text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                        Articles sélectionnés ({panier.length})
                      </p>
                      
                      {panier.length === 0 ? (
                        <div className="flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)] opacity-60" style={{ borderColor: 'var(--border)' }}>
                          <ShoppingCart size={20} className="mb-1.5" style={{ color: C.greenDark }} />
                          <p className="text-dynamic text-xs">Le panier est vide</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[38vh] overflow-y-auto pr-1">
                          {panier.map((item) => (
                            <div key={item.id_medoc} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border)]">
                              <div className="flex flex-col">
                                <span className="text-dynamic font-medium text-[var(--text-primary)] text-sm">{item.nom}</span>
                                <span className="text-dynamic text-xs font-semibold px-2 py-0.5 rounded-md mt-1 self-start" style={{ background: C.greenSoft, color: C.greenDark }}>
                                  Quantité : {item.quantite}
                                </span>
                              </div>
                              
                              {/* Retirer du panier si inutile */}
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
                {sidebar === 'envoyer' && <ConfirmCard icon={<Send size={26} color={C.greenDark} />} accent={C.greenDark} accentSoft={C.greenSoft} accentBdr={C.greenBdr} title="Envoyer au traitement ?" desc={`Dossier #${selected?.id_commande}`} note="Inmodifiable après envoi." />}
                {sidebar === 'delete' && <ConfirmCard icon={<Trash2 size={26} color={C.red} />} accent={C.red} accentSoft={C.redSoft} accentBdr={C.redBdr} title="Supprimer ce brouillon ?" desc={`Dossier #${selected?.id_commande}`} note="Action irréversible." />}
                {sidebar === 'valider' && (
                  <>
                    <ConfirmCard icon={<CheckCircle2 size={26} color={C.greenDark} />} accent={C.greenDark} accentSoft={C.greenSoft} accentBdr={C.greenBdr} title="Valider la commande globale ?" desc={`Dossier #${selected?.id_commande}`} />
                    <Field label="Note optionnelle"><textarea rows={3} className="w-full px-3 py-2 rounded-lg text-dynamic bg-[var(--bg-sidebar)] border border-[var(--border)] outline-none" value={motif} onChange={e => setMotif(e.target.value)} /></Field>
                  </>
                )}
                {sidebar === 'rejeter' && (
                  <>
                    <ConfirmCard icon={<XCircle size={26} color={C.red} />} accent={C.red} accentSoft={C.redSoft} accentBdr={C.redBdr} title="Refuser la demande ?" desc={`Dossier #${selected?.id_commande}`} />
                    <Field label="Motif de rejet *" error={motifErr}><textarea rows={3} className="w-full px-3 py-2 rounded-lg text-dynamic bg-[var(--bg-sidebar)] border border-[var(--border)] outline-none" value={motif} onChange={e => { setMotif(e.target.value); setMotifErr(''); }} /></Field>
                  </>
                )}
              </div>

              {/* Footer Panel */}
              <div className="px-5 py-4 flex gap-2.5 shrink-0" style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                <button onClick={closeSidebar} className="flex-1 py-2.5 rounded-[8px] text-dynamic font-medium cursor-pointer bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-muted)]">Annuler</button>
                <button onClick={cfg.onConfirm} disabled={saving || (sidebar === 'create' && panier.length === 0)}
                  className="flex-1 py-2.5 rounded-[8px] text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                  style={{ background: cfg.accent }}>
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

function ConfirmCard({ icon, accent, accentSoft, accentBdr, title, desc, note }) {
  return (
    <div className="rounded-xl p-4 flex gap-4 items-start border" style={{ background: accentSoft, borderColor: accentBdr }}>
      <div className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0 bg-[var(--bg-content)] border" style={{ borderColor: accentBdr }}>{icon}</div>
      <div className="flex flex-col gap-0.5">
        <p className="text-dynamic font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-dynamic text-[var(--text-secondary)]">{desc}</p>
        {note && <p className="text-dynamic mt-1 text-xs italic" style={{ color: accent }}>{note}</p>}
      </div>
    </div>
  );
}

function CommandeTable({ commandes, loading, error, renderActions, showUser = false }) {
  if (loading) return <div className="py-16 text-center"><Loader2 className="animate-spin mx-auto mb-2" size={24} style={{ color: '#16a34a' }} /><p className="text-dynamic text-[var(--text-muted)]">Chargement...</p></div>;
  if (error) return <div className="px-4 py-3 rounded-lg text-dynamic bg-red-500/10 text-red-500 border border-red-500/20">{error}</div>;
  if (commandes.length === 0) return <div className="py-16 text-center rounded-xl border border-[var(--border)]"><p className="text-dynamic text-[var(--text-muted)]">Aucune commande répertoriée</p></div>;

  const cols = ['Détails Commande', showUser && 'Demandeur', 'Date', 'Statut', 'Actions'].filter(Boolean);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border border-[var(--border)]">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-dynamic border-collapse">
          <thead>
            <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '0.5px solid var(--border)', position: 'sticky', top: 0 }}>
              {cols.map(h => <th key={h} className="px-4 py-3 text-dynamic font-medium uppercase text-[var(--text-muted)]">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {commandes.map((c, i) => {
              const meta = STATUT_META[c.statut] ?? STATUT_META.en_attente;
              const { Icon } = meta;
              const lignesMeds = c.lignes || (c.medicament ? [{ medicament: c.medicament, quantite: c.quantite }] : []);

              return (
                <tr key={c.id_commande} style={{ borderTop: '0.5px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent' }}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {lignesMeds.map((l, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                          <span className="font-medium text-[var(--text-primary)]">{l.medicament?.nom ?? 'Inconnu'}</span>
                          <span className="text-[var(--text-muted)] text-xs font-mono">(x{l.quantite})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  {showUser && <td className="px-4 py-3 text-[var(--text-secondary)]">{c.user ? `${c.user.nom} ${c.user.prenom}` : '—'}</td>}
                  <td className="px-4 py-3 text-[var(--text-muted)]">{new Date(c.date_commande).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-dynamic font-medium" style={{ background: meta.bg, color: meta.color }}><Icon size={11} /> {meta.label}</span>
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
    <div className="flex flex-col gap-1">
      <label className="text-dynamic font-medium text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</label>
      {children}
      {error && <span className="text-dynamic text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}

// Bouton des actions du tableau principal
function ActionBtn({ icon, label, color, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-dynamic font-medium cursor-pointer border-none disabled:opacity-50 transition-all"
      style={{ background: `${color}15`, color, border: `0.5px solid ${color}40` }}>{icon}{label}</button>
  );
}