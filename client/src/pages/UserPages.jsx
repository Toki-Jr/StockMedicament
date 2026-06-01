import { useState, useMemo } from "react"
import {
  Plus, Trash2, Pencil, Search,
  User, Mail, Key, Loader2, X,
  CheckCircle2, AlertCircle, ShieldAlert,
  Users, UserCheck, Building2
} from "lucide-react"
import { useUsers } from "../hooks/useUsers";
import api from "../services/axios.instance";

const ROLE_META = {
  admin:      { label: 'Admin',       Icon: ShieldAlert, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200/50 dark:border-amber-900/30' },
  pharmacien: { label: 'Pharmacien',  Icon: Building2,   color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200/50 dark:border-indigo-900/30' },
  user:       { label: 'Utilisateur', Icon: User,        color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200/50 dark:border-emerald-900/30' },
}

const EMPTY_FORM = { nom: "", prenom: "", email: "", password: "", role: "user" }

export default function Utilisateurs() {
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
        const payload = { ...formData }
        if (!payload.password) delete payload.password
        await update(editingUser.id, payload)
        notify("Utilisateur mis à jour avec succès !")
      } else {
        await create(formData)
        notify("Utilisateur créé avec succès !")
      }
      setIsSidebarOpen(false)
    } catch (err) {
      const msg = err.response?.data?.message || "Échec de l'opération"
      notify(Array.isArray(msg) ? msg[0] : msg, true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return
    setDeletingId(id)
    try {
      await remove(id)
      notify("Utilisateur supprimé de la base de données.")
    } catch (err) {
      notify(err.response?.data?.message ?? "Impossible de supprimer l'utilisateur.", true)
    } finally {
      setDeletingId(null)
    }
  }

  const handleApprouver = async (id) => {
    try {
      await api.patch(`/auth/users/${id}/approuver`);
      notify('Utilisateur approuvé avec succès !');
      refetch();
    } catch {
      notify('Erreur lors de l\'approbation de l\'utilisateur.', true);
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
    <div className="h-screen flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 text-dynamic">

      {/* ── Toast Flottant Harmonisé ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {success && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg bg-emerald-600">
            <CheckCircle2 size={14} />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")} className="bg-transparent border-none text-white cursor-pointer"><X size={13} /></button>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-dynamic font-medium shadow-lg bg-red-600">
            <AlertCircle size={14} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="bg-transparent border-none text-white cursor-pointer"><X size={13} /></button>
          </div>
        )}
      </div>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/30">
              <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50 text-dynamic">
                Liste des <span className="text-emerald-600 dark:text-emerald-400">utilisateurs</span>
              </h1>
              <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5">
                {totalUsers} compte(s) enregistré(s) au répertoire
              </p>
            </div>
          </div>
          {!isSidebarOpen && (
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <Plus size={15} /> Nouvel utilisateur
            </button>
          )}
        </div>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <StatCard icon={<Users size={16} />} iconClass="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" label="Total" value={totalUsers} valueColor="text-emerald-600 dark:text-emerald-400" />
          <StatCard icon={<ShieldAlert size={16} />} iconClass="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" label="Administrateurs" value={adminCount} valueColor="text-amber-600 dark:text-amber-400" />
          <StatCard icon={<Building2 size={16} />} iconClass="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" label="Pharmaciens" value={pharmacienCount} valueColor="text-indigo-600 dark:text-indigo-400" />
          <StatCard icon={<UserCheck size={16} />} iconClass="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" label="Utilisateurs" value={userCount} valueColor="text-emerald-700 dark:text-emerald-300" />
        </div>

        {/* Structure de la Table */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">

          {/* Table Sub-header */}
          <div className="px-5 py-3.5 flex items-center justify-between gap-3 shrink-0 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">Répertoire des comptes</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {filteredUsers.length} sur {totalUsers} utilisateur{totalUsers > 1 ? "s" : ""} affiché(s)
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 rounded-lg w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 transition-colors">
              <Search size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                className="flex-1 bg-transparent py-1.5 text-dynamic outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder="Rechercher un compte…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="bg-transparent border-none text-zinc-400 hover:text-zinc-600 cursor-pointer flex items-center">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Table Défilante */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse text-dynamic">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                  {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2 className="animate-spin mx-auto mb-2 text-emerald-600 dark:text-emerald-400" size={24} />
                      <p className="text-dynamic text-zinc-500">Chargement du répertoire…</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
                        <Users size={20} />
                      </div>
                      <p className="text-dynamic font-medium text-zinc-500">Aucun utilisateur trouvé</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => {
                  const initials = `${user.nom?.[0] ?? ""}${user.prenom?.[0] ?? ""}`.toUpperCase() || "??"
                  const meta     = ROLE_META[user.role] ?? ROLE_META.user
                  const { Icon: RoleIcon } = meta

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20 transition-colors">
                      {/* Utilisateur */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden shrink-0 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
                            {user.avatar ? (
                              <img src={user.avatar} className="w-full h-full object-cover" alt={user.nom} />
                            ) : initials}
                          </div>
                          <span className="font-medium text-zinc-900 dark:text-zinc-50 text-dynamic">
                            {user.nom} {user.prenom}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-2">
                          <Mail size={12} className="text-zinc-400 shrink-0" />
                          {user.email}
                        </span>
                      </td>

                      {/* Rôle */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${meta.bg} ${meta.color} ${meta.border}`}>
                          <RoleIcon size={10} />
                          {meta.label}
                        </span>
                      </td>
                      
                      {/* Statut */}
                      <td className="px-5 py-3.5">
                        {user.approuve ? (
                          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/20">
                            Approuvé
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200/40 dark:border-orange-900/20">
                            En attente
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {!user.approuve && (
                            <button
                              onClick={() => handleApprouver(user.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              title="Approuver le compte"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenForm(user)}
                            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                            title="Modifier"
                          >
                            <Pencil size={13} />
                          </button>
                          {!isSidebarOpen && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40"
                              title="Supprimer"
                            >
                              {deletingId === user.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
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

          {/* Table Footer */}
          <div className="px-5 py-3 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{filteredUsers.length}</span> sur <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalUsers}</span> comptes
            </span>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px]">Synchronisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drawer Formulaire Latéral ── */}
      <div 
        className="shrink-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden bg-zinc-50 dark:bg-zinc-900/20"
        style={{
          width: isSidebarOpen ? '360px' : '0px',
          borderLeft: isSidebarOpen ? '1px solid var(--border, lg-border)' : 'none',
        }}
      >
        <div className="w-[360px] flex flex-col h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

          {/* Drawer Header */}
          <div className="px-5 py-4 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/30">
                <User size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">
                  {editingUser ? "Édition du compte" : "Créer un utilisateur"}
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {editingUser ? `${editingUser.nom} ${editingUser.prenom}` : "Nouveau profil d'accès"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer border-none bg-transparent text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <X size={14} />
            </button>
          </div>

          {/* Formulaire interne défilant */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            <Field label="Nom">
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-dynamic outline-none transition-colors bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                  placeholder="Ex: RAKOTO"
                  value={formData.nom}
                  onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))}
                  required
                />
              </div>
            </Field>

            <Field label="Prénom">
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-dynamic outline-none transition-colors bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                  placeholder="Ex: Toky"
                  value={formData.prenom}
                  onChange={e => setFormData(f => ({ ...f, prenom: e.target.value }))}
                  required
                />
              </div>
            </Field>

            <Field label="Adresse Email">
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="email"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-dynamic outline-none transition-colors bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                  placeholder="exemple@pharma.mg"
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </Field>

            <Field label={editingUser ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}>
              <div className="relative">
                <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="password"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-dynamic outline-none transition-colors bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                  required={!editingUser}
                />
              </div>
            </Field>

            {/* Rôle Selector */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-0.5">
                Rôle système
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "user",       label: "Client", meta: ROLE_META.user       },
                  { value: "pharmacien", label: "Pharma", meta: ROLE_META.pharmacien },
                  { value: "admin",      label: "Admin",  meta: ROLE_META.admin      },
                ].map(r => {
                  const active = formData.role === r.value
                  const { Icon: BtnIcon } = r.meta
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, role: r.value }))}
                      className={`p-2.5 rounded-lg flex flex-col items-center gap-1.5 transition-all cursor-pointer border text-center ${
                        active 
                          ? `${r.meta.bg} ${r.meta.color} ${r.meta.border} font-semibold` 
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <BtnIcon size={14} />
                      <span className="text-[9px] uppercase tracking-wide leading-none">{r.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions de validation du formulaire */}
            <div className="mt-auto pt-4 flex gap-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="flex-1 py-2 rounded-lg text-dynamic font-medium cursor-pointer bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 size={13} className="animate-spin" /> Traitement…</>
                ) : editingUser ? (
                  "Enregistrer"
                ) : (
                  "Créer le compte"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Carte Statistique Interne ── */
function StatCard({ icon, iconClass, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200/20 dark:border-zinc-800/20 ${iconClass}`}>
        {icon}
      </div>
      <div>
        <div className={`text-dynamic font-bold leading-none font-mono ${valueColor}`}>{value}</div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">{label}</div>
      </div>
    </div>
  )
}

/* ── Champ de Formulaire Interne ── */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1 w-full text-dynamic">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-0.5">
        {label}
      </label>
      {children}
    </div>
  )
}