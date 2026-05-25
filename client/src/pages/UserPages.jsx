import { useState, useMemo } from "react"
import {
  Plus, Trash2, Pencil, Search,
  User, Mail, Key, Loader2, X,
  CheckCircle2, AlertCircle, ShieldAlert,
  Users, UserCheck, Building2
} from "lucide-react"
import { useUsers } from "../hooks/useUsers";
import api from "../services/axios.instance";

/* ─── Palette ─── */
const C = {
  green:      '#22c55e',
  greenDark:  '#16a34a',
  greenSoft:  'rgba(34,197,94,0.10)',
  greenBdr:   'rgba(34,197,94,0.25)',
  orange:     '#f97316',
  orangeSoft: 'rgba(249,115,22,0.10)',
  orangeBdr:  'rgba(249,115,22,0.25)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,0.10)',
  redBdr:     'rgba(239,68,68,0.25)',
  indigo:     '#6366f1',
  indigoSoft: 'rgba(99,102,241,0.10)',
  indigoBdr:  'rgba(99,102,241,0.25)',
  amber:      '#f59e0b',
  amberSoft:  'rgba(245,158,11,0.10)',
  amberBdr:   'rgba(245,158,11,0.25)',
}

const ROLE_META = {
  admin:      { label: 'Admin',       Icon: ShieldAlert, color: C.amber,  bg: C.amberSoft,  bdr: C.amberBdr  },
  pharmacien: { label: 'Pharmacien',  Icon: Building2,   color: C.indigo, bg: C.indigoSoft, bdr: C.indigoBdr },
  user:       { label: 'Utilisateur', Icon: User,        color: C.green,  bg: C.greenSoft,  bdr: C.greenBdr  },
}

const EMPTY_FORM = { nom: "", prenom: "", email: "", password: "", role: "user" }

export default function Utilisateurs() {
  // Tout vient du hook — plus de state users/loading séparés
  const { users, loading, create, update, remove, refetch } = useUsers();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingUser,   setEditingUser]   = useState(null)
  const [deletingId,    setDeletingId]    = useState(null)
  const [searchTerm,    setSearchTerm]    = useState("")
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState("")
  const [success,       setSuccess]       = useState("")
  const [formData,      setFormData]      = useState(EMPTY_FORM)

  const notify = (msg, isErr = false) => {
    isErr ? setError(msg) : setSuccess(msg)
    setTimeout(() => { setError(""); setSuccess("") }, 3500)
  }

  const handleOpenForm = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({ nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, password: "" })
    } else {
      setEditingUser(null)
      setFormData(EMPTY_FORM)
    }
    setIsSidebarOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingUser) {
        // update branché — password vide = on l'exclut
        const payload = { ...formData }
        if (!payload.password) delete payload.password
        await update(editingUser.id, payload)
        notify("Utilisateur mis à jour !")
      } else {
        await create(formData)
        notify("Utilisateur créé avec succès !")
      }
      setIsSidebarOpen(false)
      // refetch du hook, pas d'appel API dupliqué
    } catch (err) {
      const msg = err.response?.data?.message || "Échec de l'opération"
      notify(Array.isArray(msg) ? msg[0] : msg, true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return
    setDeletingId(id)
    try {
      // remove() du hook — plus de deleteUser non importé
      await remove(id)
      notify("Utilisateur supprimé.")
    } catch (err) {
      notify(err.response?.data?.message ?? "Impossible de supprimer.", true)
    } finally {
      setDeletingId(null)
    }
  }

  const handleApprouver = async (id) => {
    try {
      await api.patch(`/auth/users/${id}/approuver`);
      notify('Utilisateur approuvé ');
      refetch();
    } catch {
      notify('Erreur', 'error');
    }
  };

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      `${u.nom} ${u.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm])

  const totalUsers      = users.length
  const adminCount      = users.filter(u => u.role === "admin").length
  const pharmacienCount = users.filter(u => u.role === "pharmacien").length
  const userCount       = users.filter(u => u.role === "user").length

  return (
    <div className="h-screen flex overflow-hidden rounded-xl border border-white/[0.05] shadow-2xl">

      {/* ── Toast ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {success && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium"
               style={{ background: C.greenDark, color: '#fff' }}>
            <CheckCircle2 size={14} />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")}><X size={13} /></button>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium"
               style={{ background: C.red, color: '#fff' }}>
            <AlertCircle size={14} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")}><X size={13} /></button>
          </div>
        )}
      </div>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                 style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}>
              <Users size={20} color={C.green} />
            </div>
            <div>
              <h1 className="text-[22px] font-medium tracking-tight leading-tight text-[var(--text-primary)]">
                Liste des <span style={{ color: C.green }}>utilisateurs</span>
              </h1>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                {totalUsers} compte(s) enregistré(s)
              </p>
            </div>
          </div>
          {!isSidebarOpen && (
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg text-[13px] font-medium text-white border-none cursor-pointer"
              style={{ background: C.greenDark }}
            >
              <Plus size={15} /> Nouvel utilisateur
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
          <StatCard icon={<Users size={18} color={C.green} />}        iconBg={C.greenSoft}  label="Total"           value={totalUsers}      valueColor={C.green}     />
          <StatCard icon={<ShieldAlert size={18} color={C.amber} />}  iconBg={C.amberSoft}  label="Administrateurs"  value={adminCount}      valueColor={C.amber}     />
          <StatCard icon={<Building2 size={18} color={C.indigo} />}   iconBg={C.indigoSoft} label="Pharmaciens"      value={pharmacienCount} valueColor={C.indigo}    />
          <StatCard icon={<UserCheck size={18} color={C.greenDark}/>} iconBg={C.greenSoft}  label="Utilisateurs"     value={userCount}       valueColor={C.greenDark} />
        </div>

        {/* Table card */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl"
             style={{ border: '0.5px solid var(--border)' }}>

          {/* Table header */}
          <div className="px-5 py-3.5 flex items-center justify-between gap-3 shrink-0"
               style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <div>
              <h3 className="text-[13px] font-medium text-[var(--text-primary)]">Répertoire des comptes</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {filteredUsers.length} sur {totalUsers} utilisateur{totalUsers > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 rounded-[10px] w-56"
                 style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}
                 onFocusCapture={e => e.currentTarget.style.borderColor = C.green}
                 onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--border)'}>
              <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                className="flex-1 bg-transparent py-2 text-[13px] outline-none placeholder:opacity-40 text-[var(--text-primary)]"
                style={{ border: 'none' }}
                placeholder="Rechercher…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Table scrollable */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '0.5px solid var(--border)', position: 'sticky', top: 0 }}>
                  {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h}
                        className={`px-4 py-3 text-[11px] font-medium uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}
                        >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} style={{ color: C.green }} />
                      <p className="text-[12px]" >Chargement…</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                           style={{ background: C.greenSoft }}>
                        <Users size={24} color={C.green} />
                      </div>
                      <p className="text-[13px] font-medium" >
                        Aucun utilisateur trouvé
                      </p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user, i) => {
                  const initials = `${user.nom?.[0] ?? ""}${user.prenom?.[0] ?? ""}`.toUpperCase() || "??"
                  const meta     = ROLE_META[user.role] ?? ROLE_META.user
                  const { Icon: RoleIcon } = meta

                  return (
                    <tr key={user.id}
                        style={{
                          borderTop: '0.5px solid var(--border)',
                          background: i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-hover)' : 'transparent'}>

                      {/* Nom + Prénom */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[11px] font-medium uppercase overflow-hidden shrink-0"
                               style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}`, color: C.greenDark }}>
                            {user.avatar
                              ? <img src={user.avatar} className="w-full h-full object-cover" alt={user.nom} />
                              : initials}
                          </div>
                          <div>
                            <div className="font-medium text-[13px]" style={{ color: 'var(--text-primary)' }}>
                              {user.nom} {user.prenom}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-[12px]" >
                          <Mail size={12} className="shrink-0" />
                          {user.email}
                        </span>
                      </td>

                      {/* Rôle */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                              style={{ background: meta.bg, color: meta.color, border: `0.5px solid ${meta.bdr}` }}>
                          <RoleIcon size={11} />
                          {meta.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        {user.approuve ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: C.greenSoft, color: C.greenDark, border: `0.5px solid ${C.greenBdr}` }}>
                            Approuvé
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: C.orangeSoft, color: C.orange, border: `0.5px solid ${C.orangeBdr}` }}>
                            En attente
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {!user.approuve && (
                            <button
                              onClick={() => handleApprouver(user.id)}
                              className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center cursor-pointer border-none"
                              style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}
                              title="Approuver">
                              <CheckCircle2 size={13} color={C.green} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenForm(user)}
                            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center cursor-pointer border-none transition-colors duration-150"
                            style={{ background: C.orangeSoft, border: `0.5px solid ${C.orangeBdr}` }}
                            title="Modifier">
                            <Pencil size={13} color={C.orange} />
                          </button>
                          {!isSidebarOpen && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center cursor-pointer border-none transition-colors duration-150 disabled:opacity-50"
                              style={{ background: C.redSoft, border: `0.5px solid ${C.redBdr}` }}
                              title="Supprimer">
                              {deletingId === user.id
                                ? <Loader2 size={13} className="animate-spin" color={C.red} />
                                : <Trash2 size={13} color={C.red} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 flex items-center justify-between shrink-0"
               style={{ borderTop: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <span className="text-[11px]" >
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{filteredUsers.length}</span>
              {" "}sur{" "}
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{totalUsers}</span>
              {" "}enregistrés
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
              <span className="text-[11px]" >Synchronisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drawer formulaire ── */}
      <div className="shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
           style={{
             width: isSidebarOpen ? '360px' : '0px',
             borderLeft: isSidebarOpen ? '0.5px solid var(--border)' : 'none',
             background: 'var(--bg-content)',
           }}>
        <div className="w-[360px] flex flex-col h-full">

          {/* Drawer header */}
          <div className="px-5 py-4 flex items-center justify-between shrink-0"
               style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                   style={{ background: C.greenSoft, border: `0.5px solid ${C.greenBdr}` }}>
                <User size={18} color={C.green} />
              </div>
              <div>
                <h2 className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {editingUser ? `Modifier : ${editingUser.nom} ${editingUser.prenom}` : "Créer un utilisateur"}
                </h2>
                <p className="text-[11px] mt-0.5" >
                  {editingUser ? "Édition du profil" : "Nouveau compte"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center cursor-pointer border-none"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            {/* Nom */}
            <Field label="Nom" icon={<User size={13} />}>
              <input
                className="w-full pl-8 pr-3 py-2.5 text-[13px] rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="Rakoto"
                value={formData.nom}
                onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))}
                required
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            {/* Prénom */}
            <Field label="Prénom" icon={<User size={13} />}>
              <input
                className="w-full pl-8 pr-3 py-2.5 text-[13px] rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="Jean"
                value={formData.prenom}
                onChange={e => setFormData(f => ({ ...f, prenom: e.target.value }))}
                required
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            {/* Email */}
            <Field label="Email" icon={<Mail size={13} />}>
              <input
                type="email"
                className="w-full pl-8 pr-3 py-2.5 text-[13px] rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="jean@pharma.mg"
                value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                required
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            {/* Password — toujours visible, optionnel en édition */}
            <Field label={editingUser ? "Nouveau mot de passe (optionnel)" : "Mot de passe"} icon={<Key size={13} />}>
              <input
                type="password"
                className="w-full pl-8 pr-3 py-2.5 text-[13px] rounded-[8px] outline-none"
                style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                required={!editingUser}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            {/* Rôle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide" >
                Rôle
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "user",       label: "Utilisateur", icon: <User size={15} />,        meta: ROLE_META.user       },
                  { value: "pharmacien", label: "Pharmacien",  icon: <Building2 size={15} />,   meta: ROLE_META.pharmacien },
                  { value: "admin",      label: "Admin",       icon: <ShieldAlert size={15} />, meta: ROLE_META.admin      },
                ].map(r => {
                  const active = formData.role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, role: r.value }))}
                      className="p-3 rounded-[9px] flex flex-col items-center gap-1.5 transition-all duration-150 cursor-pointer border-none text-center"
                      style={{
                        background: active ? r.meta.bg  : 'var(--bg-sidebar)',
                        border:    `0.5px solid ${active ? r.meta.bdr : 'var(--border)'}`,
                        color:      active ? r.meta.color : 'var(--text-muted)',
                      }}>
                      {r.icon}
                      <span className="text-[10px] font-medium uppercase leading-tight">{r.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-auto pt-4 flex gap-2.5" style={{ borderTop: '0.5px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex-1 py-2.5 rounded-[8px] text-[13px] font-medium cursor-pointer"
                style={{ background: 'var(--bg-hover)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-[8px] text-[13px] font-medium text-white border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: C.greenDark }}>
                {submitting
                  ? <><Loader2 size={13} className="animate-spin" /> Traitement…</>
                  : editingUser ? "Enregistrer" : "Créer"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Stat card ── */
function StatCard({ icon, iconBg, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
         style={{ background: 'var(--bg-sidebar)', border: '0.5px solid var(--border)' }}>
      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
           style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <div className="text-[21px] font-medium leading-none" style={{ color: valueColor }}>{value}</div>
        <div className="text-[10px] uppercase tracking-wide mt-1" >{label}</div>
      </div>
    </div>
  )
}

/* ── Form field with leading icon ── */
function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wide" >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2" >
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}