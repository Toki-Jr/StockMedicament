import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Pill, Package, ArrowUpDown, ShoppingCart, 
  Bell, History, Users2, ShieldCheck, CheckCircle, ArrowRight,
  TrendingUp, Activity, Sparkles, Layers
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans select-none transition-colors duration-300"
         style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      
      {/* ── HEADER / NAVBAR (GLASSMORPHISM) ── */}
      <header className="h-[65px] border-b flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-lg shadow-sm"
              style={{ background: 'rgba(var(--bg-card), 0.8)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-sm animate-pulse"
               style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
            S
          </div>
          <p className="font-bold text-[18px] tracking-tight leading-tight m-0 font-['Syne']">
            Stock<span style={{ color: '#22c55e' }}>'méd</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white border-none cursor-pointer transition-all hover:opacity-90 active:scale-95 shadow-md"
            style={{ background: '#16a34a' }}
          >
            Espace Pro <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── HERO SECTION HERO-SAAS ── */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Texte de gauche */}
          <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border"
                 style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)', color: '#16a34a' }}>
              <Sparkles size={13} /> Solution Hospitalière Intégrée
            </div>
            
            <h1 className="font-['Syne'] text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] m-0">
              Le pilotage intelligent de votre <span className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">stock médical</span>.
            </h1>
            
            <p className="text-base sm:text-lg max-w-xl leading-relaxed m-0"
               style={{ color: 'var(--text-secondary)' }}>
              Centralisez vos demandes, optimisez la traçabilité des lots et réduisez le gaspillage lié aux péremptions grâce à un circuit de validation agile et collaboratif.
            </p>

            <div className="flex items-center gap-4 mt-2 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white border-none cursor-pointer transition-all hover:translate-x-0.5 shadow-lg text-sm"
                style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
              >
                Déployer Stock'méd
              </button>
            </div>
          </div>

          {/* Fausse Interface / Mockup de Droite (Visuel Pro) */}
          <div className="lg:col-span-5 relative w-full aspect-square max-w-[420px] mx-auto lg:mx-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#16a34a]/20 to-[#22c55e]/20 blur-3xl rounded-full -z-10" />
            <div className="w-full h-full rounded-2xl border p-5 flex flex-col gap-4 shadow-xl transition-all hover:scale-[1.02]"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              
              {/* Entête du mini dashboard simulé */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Activity size={16} color="#16a34a" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Live Inventaire</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
              </div>

              {/* Cartes métriques miniatures */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border bg-[var(--bg-hover)]" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[10px] uppercase font-semibold m-0 text-[var(--text-muted)]">Médicaments</p>
                  <p className="text-lg font-bold m-0 mt-0.5 text-[var(--text-primary)]">1,420 ref</p>
                </div>
                <div className="p-3 rounded-xl border bg-[var(--bg-hover)]" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[10px] uppercase font-semibold m-0 text-[var(--text-muted)]">Alertes en cours</p>
                  <p className="text-lg font-bold m-0 mt-0.5 text-[#ef4444]">3 Critiques</p>
                </div>
              </div>

              {/* Faux fil de commandes */}
              <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                <p className="text-[11px] font-bold text-[var(--text-secondary)] m-0">Flux récents</p>
                <MiniRow label="Paracétamol 500mg" qty="x250" status="Validé" bgStatus="#dcfce7" colorStatus="#166534" />
                <MiniRow label="Amoxicilline Gélule" qty="x40" status="En attente" bgStatus="#fef9c3" colorStatus="#854d0e" />
                <MiniRow label="Augmentin Adulte" qty="x15" status="Brouillon" bgStatus="#f3f4f6" colorStatus="#6b7280" />
              </div>
            </div>
          </div>
        </section>

        {/* ── CHIFFRES CLÉS / KPIS (PROFESSIONNEL) ── */}
        <section className="border-y py-10" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <KpiBlock number="-85%" subtitle="Pertes par péremption" />
            <KpiBlock number="100%" subtitle="Traçabilité des lots" />
            <KpiBlock number="4.8h" subtitle="Gagnées par semaine / service" />
            <KpiBlock number="Zero" subtitle="Ruptures imprévues" />
          </div>
        </section>

        {/* ── COMPARTIMENTATION PAR RÔLES ── */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full flex flex-col gap-12">
          <div className="text-center flex flex-col gap-2">
            <h2 className="font-['Syne'] text-3xl font-black tracking-tight m-0">
              Un workflow unifié, <span style={{ color: '#16a34a' }}>trois niveaux de droits</span>
            </h2>
            <p className="text-sm max-w-md mx-auto m-0" style={{ color: 'var(--text-secondary)' }}>
              Chaque intervenant possède un périmètre d'action précis pour préserver la sécurité de la chaîne de dispensation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard title="Services Demandeurs" icon={<ShoppingCart size={18} color="#16a34a" />} desc="Idéal pour les infirmiers en chef et chefs de service.">
              <li>Panier vert local intelligent</li>
              <li>Création instantanée de brouillons</li>
              <li>Visibilité sur l'état d'approbation</li>
            </RoleCard>

            <RoleCard title="Pharmaciens Grid" icon={<Pill size={18} color="#16a34a" />} desc="Gestion technique des stocks centraux de l'établissement.">
              <li>Ajustement des fiches produits</li>
              <li>Gestion des numéros de lots & DLUO</li>
              <li>Suivi de l'historique complet des mouvements</li>
            </RoleCard>

            <RoleCard title="Direction & Admin" icon={<LayoutDashboard size={18} color="#16a34a" />} desc="Supervision globale des flux et audit légal.">
              <li>Validation ou refus motivé obligatoire</li>
              <li>Gestion sécurisée des utilisateurs</li>
              <li>Accès au registre d'audit centralisé</li>
            </RoleCard>
          </div>
        </section>

        {/* ── MODULES ET FONCTIONNALITÉS ── */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full flex flex-col gap-10">
          <h2 className="text-center font-['Syne'] text-2xl font-bold tracking-tight m-0">
            Ingénierie applicative embarquée
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={<Layers size={18} />} title="Panier Multi-Lignes" desc="Composez vos demandes de dotations de manière fluide avant soumission globale au format JSON." />
            <FeatureCard icon={<Package size={18} />} title="Alerte FIFO / FEFO" desc="Priorisation intelligente des sorties de stocks en fonction de la proximité des dates de péremption." />
            <FeatureCard icon={<ArrowUpDown size={18} />} title="Mouvements Traçables" desc="Chaque entrée, sortie ou perte est imputée à un auteur précis avec horodatage natif." />
            <FeatureCard icon={<Bell size={18} />} title="Notification Seuil" desc="Pastilles dynamiques connectées alertant dès qu'un produit franchit le seuil critique de sécurité." />
          </div>
        </section>
      </main>

      {/* ── FOOTER ÉPURÉ ── */}
      <footer className="mt-auto h-[60px] border-t flex items-center justify-between px-8 text-xs"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <p className="m-0">&copy; 2026 Stock'méd. Tous droits réservés.</p>
        <p className="m-0 font-medium">Dispositif Intranet de Gestion Logistique Médicale</p>
      </footer>
    </div>
  );
}

// ── COMPOSANTS INTERNES UTILITAIRES PRIVÉS ──
function KpiBlock({ number, subtitle }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-3xl font-black m-0 bg-gradient-to-r from-[#16a34a] to-[#22c55e] bg-clip-text text-transparent">{number}</p>
      <p className="text-xs font-medium m-0" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
    </div>
  );
}

function MiniRow({ label, qty, status, bgStatus, colorStatus }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg border text-[11px]" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-semibold text-[var(--text-primary)] truncate">{label}</span>
        <span className="text-[var(--text-muted)] font-mono">{qty}</span>
      </div>
      <span className="px-1.5 py-0.5 rounded-full font-bold text-[10px]" style={{ background: bgStatus, color: colorStatus }}>{status}</span>
    </div>
  );
}

function RoleCard({ title, icon, desc, children }) {
  return (
    <div className="rounded-xl p-6 border flex flex-col gap-4 transition-all hover:shadow-lg"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" 
             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
          {icon}
        </div>
        <h3 className="text-base font-bold m-0" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <p className="text-xs leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
      <div className="h-[1px] bg-[var(--border)]" />
      <ul className="m-0 pl-4 text-xs flex flex-col gap-2 text-[var(--text-primary)] list-disc">
        {children}
      </ul>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-xl p-4 border flex flex-col gap-3 bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-hover)]"
         style={{ borderColor: 'var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
           style={{ background: '#16a34a' }}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>{title}</h4>
        <p className="text-xs leading-normal m-0" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </div>
  );
}