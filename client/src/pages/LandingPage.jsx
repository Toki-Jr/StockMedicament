import React, { useEffect, useState } from 'react';
import { Pill, ArrowRight, LayoutDashboard, Package, Move3d, ShoppingCart, Bell, History, User, ShieldCheck, Settings, ChevronRight, Sun, Moon
} from 'lucide-react';
import { Link } from "react-router-dom"
export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-300 antialiased
      ${isDarkMode ? 'bg-[#080d0a] text-[#f0fdf4]' : 'bg-[#f0fdf4] text-[#0f1a10]'}`}
    >
      {/* ── NOISE TEXTURE FLUIDE & GRID PATTERN ── */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      <div 
        className={`fixed inset-0 pointer-events-none z-0 bg-[size:48px_48px]
          ${isDarkMode 
            ? 'bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'}`}
      />

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 border-b backdrop-blur-xl transition-colors
        ${isDarkMode ? 'border-white/5 bg-[#080d0a]/80' : 'border-black/5 bg-[#f0fdf4]/85'}`}>
        
        <a href="#" className="flex items-center gap-2.5 font-syne font-extrabold text-xl tracking-tight">
          <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center text-[14px] font-black text-white shadow-[0_0_16px_rgba(22,163,74,0.5)]">
            S
          </div>
          <span>Stock<span className="text-[#4ade80]">'méd</span></span>
        </a>

        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          <li>
            <a href="#fonctionnalites" className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-[#f0fdf4]' : 'text-gray-600 hover:text-[#0f1a10]'}`}>
              Fonctionnalités
            </a>
          </li>
          <li>
            <a href="#roles" className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-[#f0fdf4]' : 'text-gray-600 hover:text-[#0f1a10]'}`}>
              Rôles
            </a>
          </li>
          <li>
            <a href="#tech" className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-[#f0fdf4]' : 'text-gray-600 hover:text-[#0f1a10]'}`}>
              Technologie
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          {/* Switch Thème */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'border-white/5 hover:border-[#4ade80]/30 text-gray-400' : 'border-black/5 hover:border-[#16a34a]/30 text-gray-600'}`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <Link to="/login">
            <button className={`hidden sm:inline-block px-5 py-2 rounded-lg text-sm font-medium border transition-all
              ${isDarkMode ? 'border-white/5 text-gray-300 hover:border-[#4ade80]/20 hover:text-white' : 'border-black/7 text-gray-700 hover:border-[#16a34a]/35 hover:text-black'}`}>
              Se connecter
            </button>
          </Link>
          <Link to="/register">
            <button className="px-5 py-2 bg-[#4ade80] hover:bg-[#86efac] text-black rounded-lg text-sm font-medium transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_32px_rgba(74,222,128,0.5)]">
              Commencer →
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 overflow-hidden">
        {/* Halo Lumineux */}
        <div className="absolute top-[30%] left-1/5 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial from-[#16a34a]/15 to-transparent pointer-events-none" />

        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono tracking-wider mb-8 uppercase animate-fade-in
          ${isDarkMode ? 'border-[#4ade80]/20 bg-[#16a34a]/8' : 'border-[#16a34a]/35 bg-[#16a34a]/5 text-[#16a34a]'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
          Système de gestion de stock — Pharmacie
        </div>

        <h1 className="font-syne text-5xl md:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-6">
          Pilotez votre stock<br />
          <span className="text-[#4ade80] relative inline-block">
            médicaments
            <span className="absolute bottom-1 left-0 right-0 h-1 bg-[#4ade80]/40 rounded" />
          </span><br />
          en temps réel
        </h1>

        <p className={`text-lg md:text-xl max-w-xl font-light leading-relaxed mb-10
          ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Stock'méd centralise la gestion des lots, des commandes et des alertes de péremption pour les pharmaciens et administrateurs.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link to="/login">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#4ade80] hover:bg-[#86efac] text-black font-medium rounded-xl transition-all transform hover:-translate-y-0.5 shadow-[0_0_40px_rgba(74,222,128,0.35)] hover:shadow-[0_0_60px_rgba(74,222,128,0.5)]">
              Accéder au tableau de bord <ArrowRight size={18} />
            </button>
          </Link>
          <a href="#fonctionnalites" className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 font-medium rounded-xl border transition-all
            ${isDarkMode ? 'border-white/5 text-gray-300 hover:border-[#4ade80]/20 hover:text-white' : 'border-black/7 text-gray-700 hover:border-[#16a34a]/35 hover:text-black'}`}>
            Voir les fonctionnalités
          </a>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 divide-x rounded-xl py-4 max-w-3xl w-full
          ${isDarkMode ? 'divide-white/5 border border-white/5 bg-[#0d1510]/40' : 'divide-black/5 border border-black/5 bg-white/40'}`}>
          {[
            { v: '3+', l: 'Rôles utilisateurs' },
            { v: '100%', l: 'Temps réel' },
            { v: '0€', l: 'Coût de licence' },
            { v: '24/7', l: 'Disponibilité' }
          ].map((s, i) => (
            <div key={i} className="px-6 py-2">
              <div className="font-syne text-2xl md:text-3xl font-bold tracking-tight">
                {s.v.slice(0, -1)}<span className="text-[#4ade80]">{s.v.slice(-1)}</span>
              </div>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD MOCKUP ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 mb-24">
        <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-4/5 h-[80px] bg-radial from-[#16a34a]/25 to-transparent pointer-events-none" />
        
        <div className={`rounded-2xl border overflow-hidden shadow-2xl transition-all
          ${isDarkMode ? 'border-[#4ade80]/20 bg-[#0d1510] shadow-black/60' : 'border-[#16a34a]/35 bg-white shadow-black/10'}`}>
          
          {/* Top Bar Window */}
          <div className="flex items-center gap-2 px-4 py-3 bg-black/20 border-b border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            <div className="flex-1 text-center font-mono text-[11px] text-gray-500">stockmed.app / dashboard</div>
          </div>

          <div className="flex h-[520px] overflow-hidden">
            {/* Sidebar Mock */}
            <div className="w-48 border-r border-white/5 bg-black/10 p-4 hidden sm:flex flex-col gap-1">
              <div className="flex items-center gap-2 px-2.5 py-2 mb-3">
                <div className="w-6 h-6 bg-[#16a34a] rounded-md shadow-[0_0_10px_rgba(22,163,74,0.5)]" />
                <span className="font-syne text-[13px] font-bold">Stock<span className="text-[#4ade80]">'méd</span></span>
              </div>
              
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-[#16a34a]/12 text-[#4ade80] font-medium">
                <LayoutDashboard size={14} /> Tableau de bord
              </div>
              
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2.5 mt-3 mb-1">Stock</div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Pill size={14} /> Médicaments</div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Package size={14} /> Lots</div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Move3d size={14} /> Mouvements</div>
              
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2.5 mt-3 mb-1">Gestion</div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"><ShoppingCart size={14} /> Commandes</div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Bell size={14} /> Alertes</div>
              
              <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2.5 mt-3 mb-1">Système</div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"><Settings size={14} /> Paramètres</div>
            </div>

            {/* Main Application Mock */}
            <div className={`flex-1 p-6 flex flex-col gap-5 overflow-y-auto ${isDarkMode ? 'bg-[#0d1510]' : 'bg-[#f8fdf8]'}`}>
              <div>
                <div className="font-syne font-bold text-base">Tableau de bord</div>
                <div className="text-xs text-gray-400 mt-0.5">Bonsoir, Jean Dupont 👋</div>
              </div>

              {/* KPIs Widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Médicaments', value: '1 248', change: '↑ +12 ce mois', color: '' },
                  { label: 'Lots actifs', value: '342', change: '↑ +8 nouveaux', color: 'text-[#4ade80]' },
                  { label: 'Alertes', value: '7', change: '↑ péremption proche', color: 'text-red-400' },
                  { label: 'Commandes', value: '23', change: 'En attente', color: 'text-amber-400' },
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white/3 border border-white/5 rounded-xl p-3.5">
                    <div className="text-[11px] text-gray-400 mb-1">{kpi.label}</div>
                    <div className={`font-syne text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    <div className="text-[9px] text-[#4ade80] mt-1">{kpi.change}</div>
                  </div>
                ))}
              </div>

              {/* Data Grid Mock */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1">
                {/* Bar Chart Mock */}
                <div className="lg:col-span-2 bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col">
                  <div className="text-[11px] font-semibold text-gray-400 mb-4">Mouvements de stock — 7 derniers jours</div>
                  <div className="flex items-flex-end gap-2.5 h-28 mt-auto pt-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full">
                        <div 
                          style={{ height: `${h}%` }} 
                          className={`rounded-t-sm border transition-all ${i === 5 ? 'bg-[#16a34a] border-[#16a34a] shadow-[0_0_12px_rgba(22,163,74,0.4)]' : 'bg-[#16a34a]/12 border-[#4ade80]/20'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Micro Table Widget */}
                <div className="bg-white/2 border border-white/5 rounded-xl p-4">
                  <div className="text-[11px] font-semibold text-gray-400 mb-3">Alertes récentes</div>
                  <div className="flex flex-col divide-y divide-white/5">
                    {[
                      { name: 'Paracétamol 500mg', status: 'Stock faible', style: 'bg-amber-500/15 text-amber-400' },
                      { name: 'Amoxicilline 1g', status: 'Périmé J-3', style: 'bg-red-500/15 text-red-400' },
                      { name: 'Ibuprofène 400mg', status: 'Normal', style: 'bg-[#16a34a]/15 text-[#4ade80]' },
                      { name: 'Doliprane 1000mg', status: 'Réappro.', style: 'bg-amber-500/15 text-amber-400' },
                    ].map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center justify-between py-2 text-[11px]">
                        <span className="text-gray-400 truncate max-w-[110px]">{row.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${row.style}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className={`h-[1px] mx-6 md:px-16 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />

      {/* ── FEATURES SECTION ── */}
      <section id="fonctionnalites" className="max-w-6xl mx-auto px-6 md:px-8 py-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80] tracking-widest uppercase mb-4">
          <div className="w-5 h-[1px] bg-[#4ade80]" /> Fonctionnalités
        </div>
        <h2 className="font-syne text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Tout ce dont votre<br />pharmacie a besoin
        </h2>
        <p className={`text-base font-light max-w-md leading-relaxed mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          De la gestion des lots à la traçabilité complète des mouvements — tout en un seul tableau de bord.
        </p>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] overflow-hidden rounded-2xl border
          ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/7'}`}>
          {[
            { icon: <Pill size={20} />, t: 'Gestion des médicaments', d: 'Catalogue complet avec DCI, forme galénique, dosage et fournisseurs. Recherche instantanée sur tout le stock.' },
            { icon: <Package size={20} />, t: 'Suivi des lots', d: 'Numéros de lot, dates de fabrication et péremption. Alertes automatiques avant expiration.' },
            { icon: <Move3d size={20} />, t: 'Mouvements de stock', d: 'Entrées, sorties et transferts tracés en temps réel. Historique complet et export des données.' },
            { icon: <ShoppingCart size={20} />, t: 'Gestion des commandes', d: 'Suivi des commandes fournisseurs de la création à la réception. Statuts et notifications automatiques.' },
            { icon: <Bell size={20} />, t: "Système d'alertes", d: 'Alertes configurables sur les seuils de stock, les péremptions et les anomalies détectées.' },
            { icon: <History size={20} />, t: 'Historique & rapports', d: 'Journalisation de toutes les actions utilisateurs. Rapports d’activité et tableaux de bord analytiques.' },
          ].map((feat, i) => (
            <div key={i} className={`p-8 transition-colors duration-200 ${isDarkMode ? 'bg-[#0d1510] hover:bg-[#111c14]' : 'bg-white hover:bg-[#f1f5f1]'}`}>
              <div className="w-11 h-11 rounded-lg bg-[#16a34a]/12 border border-[#4ade80]/20 flex items-center justify-center text-[#4ade80] mb-5">
                {feat.icon}
              </div>
              <h3 className="font-syne text-[15px] font-bold mb-2">{feat.t}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feat.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={`h-[1px] mx-6 md:px-16 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />

      {/* ── ROLES SECTION ── */}
      <section id="roles" className="max-w-6xl mx-auto px-6 md:px-8 py-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80] tracking-widest uppercase mb-4">
          <div className="w-5 h-[1px] bg-[#4ade80]" /> Contrôle d'accès
        </div>
        <h2 className="font-syne text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Trois rôles,<br />des permissions précises
        </h2>
        <p className={`text-base font-light max-w-md leading-relaxed mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Chaque profil dispose d'un accès adapté à ses responsabilités au sein de la pharmacie.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { 
              badge: 'admin', 
              badgeStyle: 'bg-[#4ade80]/12 text-[#4ade80]', 
              title: 'Administrateur', 
              desc: 'Accès total au système. Gère les utilisateurs, les paramètres et supervise toutes les opérations.',
              perms: ['Gestion des utilisateurs', 'Configuration du système', 'Historiques complets', 'Toutes les fonctionnalités'],
              featured: true
            },
            { 
              badge: 'pharmacien', 
              badgeStyle: 'bg-amber-400/12 text-amber-400', 
              title: 'Pharmacien', 
              desc: 'Gère le stock au quotidien — médicaments, lots, mouvements, commandes et alertes.',
              perms: ['Gestion du stock', 'Suivi des lots', 'Commandes fournisseurs', 'Alertes et paramètres'],
              featured: false
            },
            { 
              badge: 'utilisateur', 
              badgeStyle: 'bg-blue-400/12 text-blue-300', 
              title: 'Utilisateur', 
              desc: 'Accès en lecture et suivi des commandes. Idéal pour les préparateurs et le personnel de caisse.',
              perms: ['Consultation du stock', 'Suivi des commandes', 'Alertes en lecture', 'Tableau de bord'],
              featured: false
            }
          ].map((role, rIdx) => (
            <div 
              key={rIdx} 
              className={`relative rounded-2xl p-8 border transition-all duration-300 transform hover:-translate-y-1
                ${role.featured 
                  ? (isDarkMode ? 'border-[#4ade80]/30 bg-gradient-to-br from-[#16a34a]/8 to-[#0d1510]' : 'border-[#16a34a]/40 bg-gradient-to-br from-[#16a34a]/5 to-white') 
                  : (isDarkMode ? 'border-white/5 bg-[#0d1510]' : 'border-black/5 bg-white')}`}
            >
              {role.featured && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#16a34a] to-[#4ade80]" />}
              
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-medium mb-5 uppercase tracking-wide ${role.badgeStyle}`}>
                {role.badge}
              </span>
              
              <h3 className="font-syne text-lg font-bold mb-2">{role.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">{role.desc}</p>
              
              <div className="flex flex-col gap-2.5">
                {role.perms.map((p, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2 text-xs text-gray-300">
                    <ChevronRight size={12} className="text-[#4ade80]" />
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={`h-[1px] mx-6 md:px-16 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />

      {/* ── TECH STACK SECTION ── */}
      <section id="tech" className="max-w-6xl mx-auto px-6 md:px-8 py-24">
        <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80] tracking-widest uppercase mb-4">
          <div className="w-5 h-[1px] bg-[#4ade80]" /> Stack technique
        </div>
        <h2 className="font-syne text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Construit avec des<br />technologies modernes
        </h2>
        <p className={`text-base font-light max-w-md leading-relaxed mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Architecture découplée, API REST sécurisée et interface réactive — pensée pour la fiabilité et la scalabilité.
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            'React 18', 'Tailwind CSS', 'Node.js', 'Express', 'Prisma ORM', 'PostgreSQL', 'JWT Auth', 'Docker'
          ].map((tech, tIdx) => (
            <div key={tIdx} className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-mono text-xs transition-colors
              ${isDarkMode ? 'border-white/5 bg-[#0d1510] text-gray-300 hover:border-[#4ade80]/30 hover:text-white' : 'border-black/5 bg-white text-gray-700 hover:border-[#16a34a]/30 hover:text-black'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]/70" />
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-24">
        <div className={`relative rounded-3xl border overflow-hidden py-16 px-6 text-center z-10
          ${isDarkMode ? 'border-[#4ade80]/20 bg-gradient-to-br from-[#16a34a]/8 to-[#080d0a]/80' : 'border-[#16a34a]/35 bg-gradient-to-br from-[#16a34a]/5 to-white'}`}>
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-radial from-[#16a34a]/15 to-transparent pointer-events-none" />
          
          <h2 className="font-syne text-2xl md:text-4xl font-bold tracking-tight mb-3">Modernisez votre pharmacie aujourd'hui</h2>
          <p className={`text-sm font-light max-w-sm mx-auto mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gérez vos stocks intelligemment sans frais cachés ni configurations complexes.
          </p>
          <Link to="/login">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#4ade80] hover:bg-[#86efac] text-black font-medium rounded-xl transition-all shadow-[0_0_30px_rgba(74,222,128,0.25)]">
              Accéder à la plateforme <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-16 py-8 border-top relative z-10 text-xs
        ${isDarkMode ? 'border-white/5 text-gray-500' : 'border-black/5 text-gray-400'}`}>
        <div className={`font-syne font-bold text-[13px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Stock<span className="text-[#4ade80]">'méd</span>
        </div>
        <div>&copy; 2026 Stock'méd. Tous droits réservés.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
        </div>
      </footer>
    </div>
  );
}