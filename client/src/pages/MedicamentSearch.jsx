import { useState, useRef, useEffect } from 'react';
import { Pill, X, Check } from 'lucide-react';

/**
 * MedicamentSearch
 * Props:
 *   medicaments  — tableau { id_medoc, nom, forme, dosage, prix_unitaire }
 *   value        — id_medoc sélectionné (contrôlé par le parent)
 *   onChange(id) — callback appelé avec l'id_medoc (number) ou '' pour reset
 *   error        — message d'erreur string | undefined
 */
export default function MedicamentSearch({ medicaments = [], value, onChange, error }) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState(null);
  const wrapRef = useRef(null);

  // Reset si le parent vide la valeur (ex: après ajout au panier)
  useEffect(() => {
    if (!value) {
      setSelected(null);
      setQuery('');
    }
  }, [value]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = medicaments.filter(m =>
    m.nom.toLowerCase().includes(query.toLowerCase())
  );

  const select = (med) => {
    setSelected(med);
    setQuery(med.nom);
    setOpen(false);
    onChange(med.id_medoc);
  };

  const clear = () => {
    setSelected(null);
    setQuery('');
    setOpen(false);
    onChange('');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    // Si l'utilisateur retape après une sélection, on désélectionne
    if (selected) {
      setSelected(null);
      onChange('');
    }
  };

  const borderClass = error
    ? 'border-red-500'
    : selected
      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
      : 'border-gray-200 dark:border-neutral-800 focus-within:border-emerald-500';

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1.5">

      {/* Input */}
      <div className={`relative flex items-center rounded-lg border transition-colors bg-white dark:bg-neutral-900 ${borderClass}`}>
        <Pill
          size={13}
          className="absolute left-2.5 text-zinc-400 dark:text-zinc-500 pointer-events-none shrink-0"
        />
        <input
          type="text"
          className="w-full pl-8 pr-8 py-2 rounded-lg text-dynamic bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          placeholder="Rechercher un médicament…"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (!selected) setOpen(true); }}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2.5 flex items-center border-none bg-transparent cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0 transition-colors"
            aria-label="Effacer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Badge médicament sélectionné */}
      {selected && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md w-fit text-dynamic font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
          <Check size={11} />
          <span className="text-[12px]">
            {selected.nom}
            {selected.prix_unitaire != null && (
              <> — <span className="font-semibold">{selected.prix_unitaire.toLocaleString('fr-FR')} Ar</span></>
            )}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-[13px] text-center text-zinc-400 dark:text-zinc-500">
              Aucun médicament trouvé
            </div>
          ) : (
            filtered.map(m => (
              <button
                key={m.id_medoc}
                type="button"
                onMouseDown={() => select(m)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left border-none cursor-pointer transition-colors border-b border-gray-100 dark:border-neutral-800 last:border-0 ${
                  selected?.id_medoc === m.id_medoc
                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                    : 'bg-white dark:bg-neutral-900 hover:bg-zinc-50 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                    {m.nom}
                  </span>
                  {(m.forme || m.dosage) && (
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {[m.forme, m.dosage].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                {m.prix_unitaire != null && (
                  <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 ml-3 shrink-0">
                    {m.prix_unitaire.toLocaleString('fr-FR')} Ar
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}