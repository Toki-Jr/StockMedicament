import { useState, useEffect } from 'react';
import { useCommandes } from '../hooks/useCommandes';
import { useAuth } from '../context/AuthContext';
import { getMedicaments } from '../services/medicament.api';
import {
  Plus, Trash2, Send, CheckCircle2, XCircle,
  Hourglass, FileEdit, PackageCheck, X, Loader2,
  ClipboardList
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
  const [form,         setForm]       = useState({ id_medoc: '', quantite: '' });
  const [formErr,      setFormErr]    = useState({});
  const [filtreStatut, setFiltre]     = useState('');

  useEffect(() => { getMedicaments().then(setMeds).catch(() => {}); }, []);

  const openSidebar = (type, commande = null) => {
    setSelected(commande);
    setMotif('');
    setMotifErr('');
    setFormErr({});
    setForm({ id_medoc: '', quantite: '' });
    setSidebar(type);
  };
  const closeSidebar = () => { setSidebar(null); setSelected(null); };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validateForm = () => {
    const e = {};
    if (!form.id_medoc)                         e.id_medoc = 'Requis';
    if (!form.quantite || isNaN(form.quantite)) e.quantite = 'Nombre requis';
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const listeFiltrée = commandes.filter(c => {
    if (isAdmin) return c.statut === 'en_attente';
    if (!filtreStatut) return true;
    return c.statut === filtreStatut;
  });

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await create({ id_medoc: parseInt(form.id_medoc), quantite: parseInt(form.quantite) });
      closeSidebar();
      showToast('Brouillon créé');
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleEnvoyer = async () => {
    setSaving(true);
    try {
      await envoyer(selected.id_commande);
      closeSidebar();
      showToast("Commande envoyée à l'admin");
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await removeBrouillon(selected.id_commande);
      closeSidebar();
      showToast('Brouillon supprimé');
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleValider = async () => {
    setSaving(true);
    try {
      await valider(selected.id_commande, motif);
      closeSidebar();
      showToast('Commande validée');
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleRejeter = async () => {
    if (!motif.trim()) { setMotifErr('Le motif est obligatoire'); return; }
    setSaving(true);
    try {
      await rejeter(selected.id_commande, motif);
      closeSidebar();
      showToast('Commande rejetée');
    } catch (e) { showToast(e.response?.data?.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  /* config sidebar */
  const CONFIGS = {
    create:  { title: 'Nouvelle commande',      icon: <Plus size={16} color={C.greenDark} />,    accent: C.greenDark, accentSoft: C.greenSoft, accentBdr: C.greenBdr, confirmLabel: 'Créer la commande',     onConfirm: handleCreate  },
    envoyer: { title: 'Envoyer la commande',    icon: <Send size={16} color={C.greenDark} />,    accent: C.greenDark, accentSoft: C.greenSoft, accentBdr: C.greenBdr, confirmLabel: 'Envoyer',                onConfirm: handleEnvoyer },
    delete:  { title: 'Supprimer le brouillon', icon: <Trash2 size={16} color={C.red} />,        accent: C.red,       accentSoft: C.redSoft,   accentBdr: C.redBdr,   confirmLabel: 'Supprimer',              onConfirm: handleDelete  },
    valider: { title: 'Valider la commande',    icon: <CheckCircle2 size={16} color={C.greenDark}/>, accent: C.greenDark, accentSoft: C.greenSoft, accentBdr: C.greenBdr, confirmLabel: 'Confirmer la validation', onConfirm: handleValider },
    rejeter: { title: 'Rejeter la commande',    icon: <XCircle size={16} color={C.red} />,       accent: C.red,       accentSoft: C.redSoft,   accentBdr: C.redBdr,   confirmLabel: 'Confirmer le rejet',     onConfirm: handleRejeter },
  };
  const cfg = sidebar ? CONFIGS[sidebar] : null;

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-[2000] text-white px-5 py-3 rounded-[10px] font-semibold text-sm shadow-lg flex items-center gap-2"
          style={{ background: toast.type === 'error' ? C.red : C.greenDark }}
        >
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* ══════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">

        {/* ── VUE PHARMACIEN / USER ── */}
        {!isAdmin && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                     style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}>
                  <ClipboardList size={20} color={C.green} />
                </div>
                <div>
                  <h1 className="text-[22px] font-medium tracking-tight leading-tight text-[var(--text-primary)]">
                    Mes <span style={{ color: C.green }}>commandes</span>
                  </h1>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                    Créez un brouillon puis envoyez-le à l'admin
                  </p>
                </div>
              </div>
              {!sidebar && (
                <button
                  onClick={() => openSidebar('create')}
                  className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-medium text-white border-none cursor-pointer"
                  style={{ background: C.greenDark }}
                >
                  <Plus size={15} /> Nouvelle commande
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap shrink-0">
              {['', 'brouillon', 'en_attente', 'validee', 'rejetee'].map(s => (
                <button
                  key={s}
                  onClick={() => setFiltre(s)}
                  className="px-4 py-1.5 rounded-full text-[12px] font-medium transition-all border cursor-pointer"
                  style={{
                    background:  filtreStatut === s ? C.greenDark    : 'var(--bg-sidebar)',
                    color:       filtreStatut === s ? '#fff'          : 'var(--text-muted)',
                    borderColor: filtreStatut === s ? C.greenDark     : 'var(--border)',
                  }}
                >
                  {s === '' ? 'Toutes' : STATUT_META[s]?.label}
                </button>
              ))}
            </div>

            <CommandeTable
              commandes={listeFiltrée}
              loading={loading}
              error={error}
              renderActions={(c) =>
                c.statut === 'brouillon' ? (
                  <div className="flex gap-1.5">
                    <ActionBtn icon={<Send size={13} />}   label="Envoyer"   color={C.greenDark} onClick={() => openSidebar('envoyer', c)} />
                    <ActionBtn icon={<Trash2 size={13} />} label="Supprimer" color={C.red}       onClick={() => openSidebar('delete', c)} />
                  </div>
                ) : (
                  <span className="text-[11px] text-[var(--text-muted)] italic">Lecture seule</span>
                )
              }
            />
          </>
        )}

        {/* ── VUE ADMIN ── */}
        {isAdmin && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                     style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}>
                  <ClipboardList size={20} color={C.green} />
                </div>
                <div>
                  <h1 className="text-[22px] font-medium tracking-tight leading-tight text-[var(--text-primary)]">
                    Commandes <span style={{ color: C.green }}>en attente</span>
                  </h1>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                    {listeFiltrée.length} commande(s) à traiter
                  </p>
                </div>
              </div>
            </div>

            <CommandeTable
              commandes={listeFiltrée}
              loading={loading}
              error={error}
              showUser
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

      {/* ══════════════════════════════
          SIDEBAR DROITE (inline)
      ══════════════════════════════ */}
      <div
        className="shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          width:      sidebar ? '360px' : '0px',
          borderLeft: sidebar ? '0.5px solid var(--border)' : 'none',
          background: 'var(--bg-content)',
        }}
      >
        <div className="w-[360px] flex flex-col h-full">

          {cfg && (
            <>
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between shrink-0"
                   style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                       style={{ background: cfg.accentSoft, border: `0.5px solid ${cfg.accentBdr}` }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <h2 className="text-[14px] font-medium text-[var(--text-primary)]">{cfg.title}</h2>
                    {selected && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Commande #{selected.id_commande} — {selected.medicament?.nom}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeSidebar}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer border-none"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                  <X size={15} />
                </button>
              </div>

              {/* Bande colorée */}
              <div style={{ height: '3px', background: cfg.accent, opacity: 0.7 }} />

              {/* Corps */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

                {/* ─ CRÉER ─ */}
                {sidebar === 'create' && (
                  <>
                    <p className="text-[12px] text-[var(--text-muted)]">
                      Remplissez les champs pour créer une commande.
                    </p>
                    <Field label="Médicament *" error={formErr.id_medoc}>
                      <select
                        className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                        style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${formErr.id_medoc ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                        value={form.id_medoc}
                        onChange={e => { setForm(p => ({ ...p, id_medoc: e.target.value })); setFormErr(p => ({ ...p, id_medoc: '' })); }}
                        onFocus={e => e.target.style.borderColor = C.green}
                        onBlur={e  => e.target.style.borderColor = formErr.id_medoc ? C.red : 'var(--border)'}
                      >
                        <option value="">-- Choisir --</option>
                        {medicaments.map(m => <option key={m.id_medoc} value={m.id_medoc}>{m.nom}</option>)}
                      </select>
                    </Field>
                    <Field label="Quantité *" error={formErr.quantite}>
                      <input
                        type="number" min="1"
                        className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                        style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${formErr.quantite ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                        placeholder="Ex: 50"
                        value={form.quantite}
                        onChange={e => { setForm(p => ({ ...p, quantite: e.target.value })); setFormErr(p => ({ ...p, quantite: '' })); }}
                        onFocus={e => e.target.style.borderColor = C.green}
                        onBlur={e  => e.target.style.borderColor = formErr.quantite ? C.red : 'var(--border)'}
                      />
                    </Field>
                  </>
                )}

                {/* ─ ENVOYER ─ */}
                {sidebar === 'envoyer' && (
                  <ConfirmCard
                    icon={<Send size={26} color={C.greenDark} />}
                    accent={C.greenDark} accentSoft={C.greenSoft} accentBdr={C.greenBdr}
                    title="Envoyer cette commande à l'admin ?"
                    desc={`${selected?.medicament?.nom} — Nombre: ${selected?.quantite}`}
                    note="Une fois envoyée, vous ne pourrez plus la modifier."
                  />
                )}

                {/* ─ SUPPRIMER ─ */}
                {sidebar === 'delete' && (
                  <ConfirmCard
                    icon={<Trash2 size={26} color={C.red} />}
                    accent={C.red} accentSoft={C.redSoft} accentBdr={C.redBdr}
                    title="Supprimer définitivement ce brouillon ?"
                    desc={`${selected?.medicament?.nom} — Nombre: ${selected?.quantite}`}
                    note="Cette action est irréversible."
                  />
                )}

                {/* ─ VALIDER ─ */}
                {sidebar === 'valider' && (
                  <>
                    <ConfirmCard
                      icon={<CheckCircle2 size={26} color={C.greenDark} />}
                      accent={C.greenDark} accentSoft={C.greenSoft} accentBdr={C.greenBdr}
                      title="Valider cette commande ?"
                      desc={`${selected?.medicament?.nom} — Nombre: ${selected?.quantite}`}
                      note="Le stock sera automatiquement décrémenté."
                    />
                    <Field label="Motif (optionnel)">
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                        style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                        placeholder="Ex : Validé suite à vérification des stocks…"
                        value={motif}
                        onChange={e => setMotif(e.target.value)}
                        onFocus={e => e.target.style.borderColor = C.green}
                        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                      />
                    </Field>
                  </>
                )}

                {/* ─ REJETER ─ */}
                {sidebar === 'rejeter' && (
                  <>
                    <ConfirmCard
                      icon={<XCircle size={26} color={C.red} />}
                      accent={C.red} accentSoft={C.redSoft} accentBdr={C.redBdr}
                      title="Rejeter cette commande ?"
                      desc={`${selected?.medicament?.nom} — Nombre: ${selected?.quantite}`}
                      note="Le pharmacien sera notifié avec votre motif."
                    />
                    <Field label="Motif *" error={motifErr}>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                        style={{ background: 'var(--bg-sidebar)', border: `0.5px solid ${motifErr ? C.red : 'var(--border)'}`, color: 'var(--text-primary)' }}
                        placeholder="Ex : Stock insuffisant, doublon de commande…"
                        value={motif}
                        onChange={e => { setMotif(e.target.value); setMotifErr(''); }}
                        onFocus={e => e.target.style.borderColor = motifErr ? C.red : C.green}
                        onBlur={e  => e.target.style.borderColor = motifErr ? C.red : 'var(--border)'}
                      />
                    </Field>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 flex gap-2.5 shrink-0"
                   style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
                <button
                  onClick={closeSidebar}
                  className="flex-1 py-2.5 rounded-[8px] text-[13px] font-medium cursor-pointer"
                  style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                  Annuler
                </button>
                <button
                  onClick={cfg.onConfirm}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-[8px] text-[13px] font-medium text-white border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: cfg.accent }}>
                  {saving
                    ? <><Loader2 size={13} className="animate-spin" /> Traitement…</>
                    : cfg.confirmLabel
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Carte de confirmation ── */
function ConfirmCard({ icon, accent, accentSoft, accentBdr, title, desc, note }) {
  return (
    <div className="rounded-xl p-4 flex gap-4 items-start"
         style={{ background: accentSoft, border: `0.5px solid ${accentBdr}` }}>
      <div className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
           style={{ background: 'var(--bg-content)', border: `0.5px solid ${accentBdr}` }}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-[12px] text-[var(--text-secondary)]">{desc}</p>
        {note && <p className="text-[11px] mt-0.5 italic" style={{ color: accent, opacity: 0.8 }}>{note}</p>}
      </div>
    </div>
  );
}

/* ── Tableau ── */
function CommandeTable({ commandes, loading, error, renderActions, showUser = false }) {
  if (loading) return (
    <div className="py-16 text-center">
      <Loader2 className="animate-spin mx-auto mb-2" size={24} style={{ color: '#16a34a' }} />
      <p className="text-[12px] text-[var(--text-muted)]">Chargement…</p>
    </div>
  );
  if (error) return (
    <div className="px-4 py-3 rounded-lg text-[13px]"
         style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
      {error}
    </div>
  );
  if (commandes.length === 0) return (
    <div className="py-16 text-center rounded-xl" style={{ border: '0.5px solid var(--border)' }}>
      <p className="text-[13px] text-[var(--text-muted)]">Aucune commande</p>
    </div>
  );

  const cols = ['#', 'Médicament', showUser && 'Demandeur', 'Quantité', 'Date', 'Statut', 'Actions'].filter(Boolean);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl"
         style={{ border: '0.5px solid var(--border)' }}>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '0.5px solid var(--border)', position: 'sticky', top: 0 }}>
              {cols.map(h => (
                <th key={h} className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commandes.map((c, i) => {
              const meta = STATUT_META[c.statut] ?? STATUT_META.en_attente;
              const { Icon } = meta;
              return (
                <tr key={c.id_commande}
                    style={{ borderTop: '0.5px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent'}>
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-muted)]">#{c.id_commande}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{c.medicament?.nom ?? '—'}</td>
                  {showUser && (
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {c.user ? `${c.user.nom} ${c.user.prenom}` : '—'}
                      <span className="ml-1 text-[10px] text-[var(--text-muted)]">({c.user?.role})</span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c.quantite}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{new Date(c.date_commande).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{ background: meta.bg, color: meta.color }}>
                      <Icon size={11} /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">{renderActions(c)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer table */}
      <div className="px-5 py-3 flex items-center justify-between shrink-0"
           style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
        <span className="text-[11px] text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-primary)]">{commandes.length}</span> commande(s)
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
          <span className="text-[11px] text-[var(--text-muted)]">Synchronisé</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</label>
      {children}
      {error && <span className="text-[11px]" style={{ color: '#ef4444' }}>{error}</span>}
    </div>
  );
}

function ActionBtn({ icon, label, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none disabled:opacity-50 transition-all"
      style={{ background: `${color}15`, color, border: `0.5px solid ${color}40` }}>
      {icon}{label}
    </button>
  );
}