import { useState, useEffect } from 'react';
import { getDashboardStats, getCommandesParJour } from '../services/dashboard.api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

import {
  Pill, Package, ShoppingCart, CheckCircle2,
  Hourglass, ArrowUpDown, Loader2, RefreshCw,
  AlertTriangle, TrendingUp, TrendingDown,BellRing,
  ChevronRight, Activity,
} from 'lucide-react';
import { refreshAlertes } from '../services/medicament.api';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin      = user?.role === 'admin';
  const isPharmacien = user?.role === 'pharmacien';
  const isUser       = user?.role === 'user';

  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [chartData, setChartData] = useState([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getDashboardStats());
    } catch {
      setError('Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!isUser) {
      getCommandesParJour().then(setChartData).catch(() => {});
      refreshAlertes().catch(err => console.error("Erreur auto-refresh alertes:", err));
    }
    load();
  }, []);

  const now = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <Loader2 size={32} className="animate-spin text-emerald-600 dark:text-emerald-400" />
      <p className="text-dynamic text-zinc-500 dark:text-zinc-400">Chargement du tableau de bord…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-dynamic">
      <p className="text-dynamic font-medium text-red-600 dark:text-red-400">{error}</p>
      <button 
        onClick={load}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer bg-emerald-600 hover:bg-emerald-700 transition-colors"
      >
        <RefreshCw size={14} /> Réessayer
      </button>
    </div>
  );

  const enAttenteAppro = isAdmin
    ? (stats.totalUsers ?? 0) - (stats.usersApprouves ?? 0)
    : 0;

  return (
    <div className="h-screen flex flex-col gap-5 p-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 text-dynamic">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Système opérationnel
            </span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            {isUser ? 'Mes demandes — ' : 'Statistiques générales — '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Stock Médicaments</span>
          </h1>
          <p className="text-dynamic text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">{now}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-dynamic font-medium cursor-pointer border bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>
      </div>

      {/* Zone Scrollable du Dashboard */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
        
        {/* ── KPI : Admin / Pharmacien ── */}
        {(isAdmin || isPharmacien) && (
          <section className="flex flex-col gap-3">
            <SectionTitle icon={<Activity size={14} />} label="Vue d'ensemble" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard
                icon={<Pill size={16} />}
                label="Médicaments"
                value={stats.totalMedicaments}
                sub="références actives"
                iconClass="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/40 dark:border-emerald-900/20"
                link="/medicaments"
              />
              <KpiCard
                icon={<Package size={16} />}
                label="Lots en stock"
                value={stats.totalLots}
                sub="lots de traçabilité"
                iconClass="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/40 dark:border-indigo-900/20"
                link="/lots"
              />
              <KpiCard
                icon={<TrendingUp size={16} />}
                label="Volume Global"
                value={stats.stockDisponible}
                sub="boîtes / unités"
                iconClass="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30"
                link="/lots"
              />
              <KpiCard
                icon={<ArrowUpDown size={16} />}
                label="Mouvements"
                value={stats.mouvementsAujourdhui}
                sub="flux du jour"
                iconClass="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/40 dark:border-purple-900/20"
                link="/mouvements"
              />
              <KpiCard
                icon={<TrendingUp size={16} />}
                label="Flux Entrées"
                value={stats.entreesAujourdhui}
                sub="mouvements stock +"
                iconClass="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/40 dark:border-emerald-900/20"
                link="/mouvements"
              />
              <KpiCard
                icon={<TrendingDown size={16} />}
                label="Flux Sorties"
                value={stats.sortiesAujourdhui}
                sub="mouvements stock -"
                iconClass="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200/40 dark:border-red-900/20"
                link="/mouvements"
              />
              <KpiCard
                icon={<Hourglass size={16} />}
                label="Commandes"
                value={stats.commandesEnAttente}
                sub="en attente de visa"
                iconClass={stats.commandesEnAttente > 0 
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800" 
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/40 dark:border-amber-900/20"
                }
                link="/commandes"
              />
              {isAdmin && (
                <KpiCard
                  icon={<AlertTriangle size={16} />}
                  label="Approbations"
                  value={enAttenteAppro}
                  sub="comptes en attente"
                  iconClass={enAttenteAppro > 0 
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800 animate-pulse" 
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                  }
                  link="/users"
                />
              )}
            </div>
          </section>
        )}

        {/* ── KPI : Utilisateur Simple ── */}
        {isUser && (
          <section className="flex flex-col gap-3">
            <SectionTitle icon={<ShoppingCart size={14} />} label="Mes commandes" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard
                icon={<ShoppingCart size={16} />}
                label="Total demandes"
                value={stats.totalCommandes}
                sub="historique global"
                iconClass="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/40 dark:border-indigo-900/20"
                link="/commandes"
              />
              <KpiCard
                icon={<Hourglass size={16} />}
                label="En attente"
                value={stats.commandesEnAttente}
                sub="validation pharmacie"
                iconClass="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/40 dark:border-amber-900/30"
                link="/commandes"
              />
              <KpiCard
                icon={<CheckCircle2 size={16} />}
                label="Livrées / Validées"
                value={stats.commandesValidees}
                sub="commandes complétées"
                iconClass="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/40 dark:border-emerald-900/30"
                link="/commandes"
              />
              <KpiCard
                icon={<AlertTriangle size={16} />}
                label="Rejetées"
                value={stats.commandesRejetees}
                sub="demandes annulées"
                iconClass="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200/40 dark:border-red-900/30"
                link="/commandes"
              />
            </div>
          </section>
        )}

        {/* ── Graphique analytique ── */}
        {(isAdmin || isPharmacien) && (
          <section className="flex flex-col gap-1">
            <SectionTitle icon={<TrendingUp size={14} />} label="Analyses des flux de requêtes" />
            <CommandesChart data={chartData} />
          </section>
        )}

        {/* ── Journaux d'activités récents ── */}
        <section className="flex flex-col gap-3 mb-2">
          <SectionTitle icon={<Activity size={14} />} label="Suivi des activités" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <ActivityCard
              title={isUser ? 'Mes dernières requêtes' : 'Dernières commandes officine'}
              icon={<ShoppingCart size={14} className="text-emerald-600 dark:text-emerald-400" />}
              link="/commandes"
              empty={stats.dernieresCommandes.length === 0}
              emptyMsg="Aucune commande récente enregistrée"
            >
              {stats.dernieresCommandes.map((c) => (
                <ActivityRow
                  key={c.id_commande}
                  left={
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {c.medicament?.nom}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {isUser
                          ? `Quantité demandée : ${c.lignes?.reduce((sum, l) => sum + (l.quantite ?? 0), 0) ?? '—'}`
                          : `Demandeur : ${c.user?.nom} ${c.user?.prenom} · Quantité : ${c.lignes?.reduce((sum, l) => sum + (l.quantite ?? 0), 0) ?? '—'}`
                        }
                      </p>
                    </div>
                  }
                  right={<StatutBadge statut={c.statut} />}
                />
              ))}
            </ActivityCard>

            {(isAdmin || isPharmacien) && (
              <ActivityCard
                title="Registre des mouvements récents"
                icon={<ArrowUpDown size={14} className="text-emerald-600 dark:text-emerald-400" />}
                link="/mouvements"
                empty={stats.derniersMovements.length === 0}
                emptyMsg="Aucun mouvement de stock référencé"
              >
                {stats.derniersMovements.map((m) => (
                  <ActivityRow
                    key={m.id_mvt}
                    left={
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {m.lot?.medicament?.nom ?? '—'}
                        </p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          Lot n° {m.lot?.numero_lot} · {m.motif}
                        </p>
                      </div>
                    }
                    right={
                      <div className="flex items-center gap-1.5">
                        {m.type_mvt === 'entree' ? (
                          <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown size={13} className="text-red-600 dark:text-red-400" />
                        )}
                        <span className={`font-mono font-bold ${m.type_mvt === 'entree' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {m.type_mvt === 'entree' ? '+' : '-'}{m.quantite_mvt}
                        </span>
                      </div>
                    }
                  />
                ))}
              </ActivityCard>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Composants d'interface locaux harmonisés ──

function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-1 text-dynamic">
      <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</span>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

function KpiCard({ icon, label, value, sub, iconClass, link }) {
  const cardBody = (
    <div className="group flex flex-col justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <span className="text-zinc-600 dark:text-white uppercase font-bold tracking-wider text-[9px]">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconClass}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between mt-3 flex-wrap gap-1">
        <div>
          <div className="text-xl font-bold font-mono leading-none text-zinc-900 dark:text-zinc-50">{value}</div>
          {sub && <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{sub}</div>}
        </div>
        {link && (
          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 dark:text-zinc-500" />
        )}
      </div>
    </div>
  );

  if (link) return (
    <Link to={link} className="no-underline block hover:scale-[1.01] transition-transform">
      {cardBody}
    </Link>
  );
  return cardBody;
}

function ActivityCard({ title, icon, link, empty, emptyMsg, children }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex-1">
      <div className="px-4 py-3 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">{title}</span>
        </div>
        <Link to={link} className="flex items-center gap-0.5 text-[11px] no-underline font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          Consulter <ChevronRight size={12} />
        </Link>
      </div>
      {empty ? (
        <div className="py-12 text-center bg-white dark:bg-transparent">
          <p className="text-dynamic text-zinc-400 dark:text-zinc-500 italic px-4">{emptyMsg}</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800/60 bg-white dark:bg-transparent">{children}</div>
      )}
    </div>
  );
}

function ActivityRow({ left, right }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 text-dynamic hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
      <div className="flex-1 min-w-0 mr-3">{left}</div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function StatutBadge({ statut }) {
  const meta = {
    brouillon:  { label: 'Brouillon',  badge: 'bg-zinc-50 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-900/30' },
    en_attente: { label: 'En attente', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' },
    validee:    { label: 'Validée',    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' },
    rejetee:    { label: 'Rejetée',    badge: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' },
  }[statut] ?? { label: statut, badge: 'bg-zinc-50 text-zinc-500 border-zinc-200' };

  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

function CommandesChart({ data }) {
  if (!data.length) return (
    <div className="flex items-center justify-center py-14 rounded-xl mt-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 text-dynamic text-zinc-400 dark:text-zinc-500">
      Aucune statistique graphique disponible pour cette période
    </div>
  );

  const chartData = data.map(d => ({
    date:     d.date,
    quantite: d.top?.quantite ?? 0,
    nom:      d.top?.nom ?? '—',
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-dynamic">
        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 mb-0.5">{label}</p>
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{payload[0]?.payload?.nom}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
          {payload[0]?.value} unité(s) commandée(s)
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden mt-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="px-4 py-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <p className="text-dynamic font-semibold text-zinc-900 dark:text-zinc-50">
            Médicament le plus commandé
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            Top volume par jour sur les 7 derniers jours de service
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
          7 Derniers Jours
        </span>
      </div>
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'rgba(120,120,120,0.6)' }}
                   style={{ fontSize: '10px', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(120,120,120,0.6)' }}
                   style={{ fontSize: '10px', fontFamily: 'monospace' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="quantite" stroke="#10b981" strokeWidth={1.5}
                  fill="url(#gradGreen)"
                  dot={{ fill: '#10b981', strokeWidth: 1, r: 3, stroke: '#047857' }}
                  activeDot={{ r: 4.5, fill: '#10b981', stroke: '#047857', strokeWidth: 1 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}