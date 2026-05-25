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
  AlertTriangle, TrendingUp, TrendingDown,
  ChevronRight, Activity,
} from 'lucide-react';

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
  blue:       '#3b82f6',
  blueSoft:   'rgba(59,130,246,0.10)',
  blueBdr:    'rgba(59,130,246,0.25)',
  indigo:     '#6366f1',
  indigoSoft: 'rgba(99,102,241,0.10)',
  indigoBdr:  'rgba(99,102,241,0.25)',
  amber:      '#f59e0b',
  amberSoft:  'rgba(245,158,11,0.10)',
  amberBdr:   'rgba(245,158,11,0.25)',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getDashboardStats());
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    getCommandesParJour().then(setChartData).catch(() => {});
    load(); 
  }, []);

  const now = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <Loader2 size={32} className="animate-spin" style={{ color: C.green }} />
      <p className="text-dynamic text-[var(--text-muted)]">Chargement du tableau de bord…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <p className="text-dynamic" style={{ color: C.red }}>{error}</p>
      <button onClick={load}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-dynamic font-medium text-white border-none cursor-pointer"
              style={{ background: C.greenDark }}>
        <RefreshCw size={14} /> Réessayer
      </button>
    </div>
  );

  const enAttenteAppro = stats.totalUsers - stats.usersApprouves;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.green }} />
            <span className="text-dynamic font-medium uppercase tracking-wider" style={{ color: C.greenDark }}>
              Système en ligne
            </span>
          </div>
          <h1 className="text-[22px] font-medium text-[var(--text-primary)]">
            Statistiques générales —{' '}
            <span style={{ color: C.green }}>Stock Médicament</span>
          </h1>
          <p className="text-dynamic text-[var(--text-muted)] mt-0.5 capitalize">{now}</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-dynamic font-medium cursor-pointer border-none transition-all"
          style={{ background: C.greenSoft, color: C.greenDark, border: `0.5px solid ${C.greenBdr}` }}>
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {/* ── KPI principaux ── */}
      <section>
        <SectionTitle icon={<Activity size={14} />} label="Vue d'ensemble" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <KpiCard
            icon={<Pill size={19} />}
            label="Médicaments"
            value={stats.totalMedicaments}
            sub="références enregistrées"
            color={C.green} bg={C.greenSoft} bdr={C.greenBdr}
            link="/medicaments"
          />
          <KpiCard
            icon={<Package size={19} />}
            label="Lots en stock"
            value={stats.totalLots}
            sub="lots actifs"
            color={C.blue} bg={C.blueSoft} bdr={C.blueBdr}
            link="/lots"
          />
          <KpiCard
            icon={<TrendingUp size={19} />}
            label="Stock disponible"
            value={stats.stockDisponible}
            sub="unités au total"
            color={C.greenDark} bg={C.greenSoft} bdr={C.greenBdr}
            link="/lots"
          />
          <KpiCard
            icon={<ArrowUpDown size={19} />}
            label="Mouvements"
            value={stats.mouvementsAujourdhui}
            sub="aujourd'hui"
            color={C.indigo} bg={C.indigoSoft} bdr={C.indigoBdr}
            link="/mouvements"
          />

          <KpiCard
            icon={<TrendingUp size={19} />}
            label="Entrées aujourd'hui"
            value={stats.entreesAujourdhui}
            color={C.greenDark} bg={C.greenSoft} bdr={C.greenBdr}
            link="/mouvements"
          />
          <KpiCard
            icon={<TrendingDown size={19} />}
            label="Sorties aujourd'hui"
            value={stats.sortiesAujourdhui}
            color={C.red} bg={C.redSoft} bdr={C.redBdr}
            link="/mouvements"
          />

          <KpiCard
            icon={<Hourglass size={19} />}
            label="Commandes en attente"
            value={stats.commandesEnAttente}
            color={C.orange} bg={C.orangeSoft} bdr={C.orangeBdr}
            link="/commandes"
            urgent={stats.commandesEnAttente > 0}
          />

          {/* Admin only — approbation */}
          {isAdmin && (
            <KpiCard
              icon={<AlertTriangle size={19} />}
              label="Approbations en attente"
              value={enAttenteAppro}
              color={enAttenteAppro > 0 ? C.red : C.greenDark}
              bg={enAttenteAppro > 0 ? C.redSoft : C.greenSoft}
              bdr={enAttenteAppro > 0 ? C.redBdr : C.greenBdr}
              link="/users"
              urgent={enAttenteAppro > 0}
            />
          )}
        </div>
      </section>
      
      {/* ── Graphique commandes ── */}
      <section>
        <SectionTitle icon={<TrendingUp size={14} />} label="Médicament le plus commandé — 7 derniers jours" />
        {isAdmin && (
          <CommandesChart data={chartData} />
        )}
      </section>

      {/* ── Activité récente ── */}
      <section>
        <SectionTitle icon={<Activity size={14} />} label="Activité récente" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">

          {/* Dernières commandes */}
          <ActivityCard
            title="Dernières commandes"
            icon={<ShoppingCart size={14} color={C.green} />}
            link="/commandes"
            empty={stats.dernieresCommandes.length === 0}
            emptyMsg="Aucune commande récente"
          >
            {stats.dernieresCommandes.map((c, i) => (
              <ActivityRow
                key={c.id_commande}
                last={i === stats.dernieresCommandes.length - 1}
                left={
                  <>
                    <p className="text-dynamic font-medium text-[var(--text-primary)]">
                      {c.medicament?.nom}
                    </p>
                    <p className="text-dynamic text-[var(--text-muted)]">
                      {c.user?.nom} {c.user?.prenom} · Total: {c.quantite}
                    </p>
                  </>
                }
                right={<StatutBadge statut={c.statut} />}
              />
            ))}
          </ActivityCard>

          {/* Derniers mouvements */}
          <ActivityCard
            title="Derniers mouvements"
            icon={<ArrowUpDown size={14} color={C.green} />}
            link="/mouvements"
            empty={stats.derniersMovements.length === 0}
            emptyMsg="Aucun mouvement récent"
          >
            {stats.derniersMovements.map((m, i) => (
              <ActivityRow
                key={m.id_mvt}
                last={i === stats.derniersMovements.length - 1}
                left={
                  <>
                    <p className="text-dynamic font-medium text-[var(--text-primary)]">
                      {m.lot?.medicament?.nom ?? '—'}
                    </p>
                    <p className="text-dynamic text-[var(--text-muted)]">
                      {m.lot?.numero_lot} · {m.motif}
                    </p>
                  </>
                }
                right={
                  <div className="flex items-center gap-1">
                    {m.type_mvt === 'entree'
                      ? <TrendingUp size={13} color={C.greenDark} />
                      : <TrendingDown size={13} color={C.red} />}
                    <span className="text-dynamic font-bold"
                          style={{ color: m.type_mvt === 'entree' ? C.greenDark : C.red }}>
                      {m.type_mvt === 'entree' ? '+' : '-'}{m.quantite_mvt}
                    </span>
                  </div>
                }
              />
            ))}
          </ActivityCard>
        </div>
      </section>
    </div>
  );
}

/* ── Section title ── */
function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: C.greenDark }}>{icon}</span>
      <span className="text-dynamic font-medium uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ icon, label, value, sub, color, bg, bdr, link }) {
  const content = (
    <div className="group flex flex-col gap-3 px-4 py-4 rounded-xl transition-all duration-200"
         style={{ background: 'var(--bg-sidebar)', border: `0.5px solid var(--border)` }}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
             style={{ background: bg, border: `0.5px solid ${bdr}`, color }}>
          {icon}
        </div>
        {link && (
          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color }} />
        )}
      </div>
      <div>
        <div className="text-dynamic font-medium leading-none" style={{ color }}>{value}</div>
        <div className="text-dynamic font-medium text-[var(--text-primary)] mt-1">{label}</div>
        <div className="text-dynamic text-[var(--text-muted)] mt-0.5">{sub}</div>
      </div>
    </div>
  );

  if (link) return (
    <Link to={link} className="no-underline block hover:scale-[1.015] transition-transform">
      {content}
    </Link>
  );
  return content;
}

/* ── Activity Card ── */
function ActivityCard({ title, icon, link, empty, emptyMsg, children }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden"
         style={{ border: '0.5px solid var(--border)' }}>
      <div className="px-5 py-3.5 flex items-center justify-between shrink-0"
           style={{ background: 'var(--bg-sidebar)', borderBottom: '0.5px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-dynamic font-medium text-[var(--text-primary)]">{title}</span>
        </div>
        <Link to={link} className="flex items-center gap-1 text-dynamic no-underline font-medium"
              style={{ color: C.greenDark }}>
          Voir tout <ChevronRight size={12} />
        </Link>
      </div>
      {empty ? (
        <div className="py-10 text-center">
          <p className="text-dynamic text-[var(--text-muted)]">{emptyMsg}</p>
        </div>
      ) : (
        <div className="flex flex-col">{children}</div>
      )}
    </div>
  );
}

/* ── Activity Row ── */
function ActivityRow({ left, right, last }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-[rgba(34,197,94,0.03)]"
         style={{ borderBottom: last ? 'none' : '0.5px solid var(--border)' }}>
      <div className="flex-1 min-w-0 mr-3">{left}</div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

/* ── Statut Badge ── */
function StatutBadge({ statut }) {
  const meta = {
    brouillon:  { label: 'Brouillon',  color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    en_attente: { label: 'En attente', color: '#854d0e', bg: '#fef9c3'                 },
    validee:    { label: 'Validée',    color: '#166534', bg: '#dcfce7'                 },
    rejetee:    { label: 'Rejetée',    color: '#991b1b', bg: '#fee2e2'                 },
  }[statut] ?? { label: statut, color: '#6b7280', bg: 'rgba(107,114,128,0.10)' };

  return (
    <span className="text-dynamic font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function CommandesChart({ data }) {
  if (!data.length) return (
    <div className="flex items-center justify-center py-16 rounded-xl mt-3"
         style={{ border: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
      <p className="text-dynamic text-[var(--text-muted)]">Aucune donnée disponible</p>
    </div>
  );

  // Formatter les données pour recharts
  const chartData = data.map(d => ({
    date:     d.date,
    quantite: d.top?.quantite ?? 0,
    nom:      d.top?.nom ?? '—',
  }));

  // Tooltip custom
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-3 py-2.5 rounded-lg text-dynamic"
           style={{ background: 'var(--bg-content)', border: `0.5px solid ${C.greenBdr}`, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <p className="font-medium text-[var(--text-muted)] mb-1">{label}</p>
        <p className="font-medium" style={{ color: C.green }}>{payload[0]?.payload?.nom}</p>
        <p className="text-[var(--text-muted)]">
          <span style={{ color: C.greenDark }}>×{payload[0]?.value}</span> commande(s)
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden mt-3"
         style={{ border: '0.5px solid var(--border)', background: 'var(--bg-sidebar)' }}>
      <div className="px-5 py-3.5 flex items-center justify-between"
           style={{ borderBottom: '0.5px solid var(--border)' }}>
        <div>
          <p className="text-dynamic font-medium text-[var(--text-primary)]">
            Médicament le plus commandé
          </p>
          <p className="text-dynamic text-[var(--text-muted)] mt-0.5">
            Top commande par jour sur 7 jours
          </p>
        </div>
        <span className="text-dynamic px-2.5 py-1 rounded-full font-medium"
              style={{ background: C.greenSoft, color: C.greenDark, border: `0.5px solid ${C.greenBdr}` }}>
          7 derniers jours
        </span>
      </div>

      <div className="px-4 py-5">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(150,150,150,0.8)' }}
              style={{ fontSize: 'var(--text-dynamic, 11px)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(150,150,150,0.8)' }}
              style={{ fontSize: 'var(--text-dynamic, 11px)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="quantite"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#gradGreen)"
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4, stroke: '#16a34a' }}
              activeDot={{ r: 6, fill: '#22c55e', stroke: '#16a34a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}