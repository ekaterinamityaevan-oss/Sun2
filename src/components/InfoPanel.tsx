import { EARTH_DIAMETER_KM, JUPITER_RATIO, type CelestialBody } from "../data/bodies";

interface InfoPanelProps {
  body: CelestialBody;
  prevName: string;
  nextName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function StatCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-space-900 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 font-display text-[13px] font-medium leading-snug text-white">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

export default function InfoPanel({ body, prevName, nextName, onClose, onPrev, onNext }: InfoPanelProps) {
  const ratio = body.diameterKm / EARTH_DIAMETER_KM;
  const barPct = Math.max(4, Math.min(100, (ratio / JUPITER_RATIO) * 100));
  const ratioLabel =
    ratio >= 1
      ? `в ${ratio.toLocaleString("ru-RU", { maximumFractionDigits: ratio >= 100 ? 0 : 1 })} раза больше Земли`
      : `${ratio.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} диаметра Земли`;

  const [c0, c1, c2] = body.colors;

  return (
    <aside className="panel-in absolute inset-y-0 right-0 z-30 flex w-[350px] max-w-[94vw] flex-col border-l border-white/10 bg-space-900/95 shadow-[-30px_0_80px_rgba(0,0,0,0.5)] backdrop-blur-md max-md:inset-x-2 max-md:inset-y-auto max-md:bottom-2 max-md:max-h-[56vh] max-md:w-auto max-md:rounded-xl max-md:border max-md:shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 pb-4 pt-5">
        <div>
          <span className="inline-block rounded-sm border border-solar-400/40 bg-solar-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-solar-300">
            {body.kindLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Закрыть панель"
          className="grid size-8 shrink-0 place-items-center rounded-md border border-white/10 text-slate-400 transition hover:border-white/25 hover:text-white active:scale-90"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div key={body.id} className="panel-scroll swap-in flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: 84, height: 84 }}>
            {body.hasRings && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2"
                style={{
                  width: 138,
                  height: 40,
                  transform: "translate(-50%,-50%) rotate(-16deg)",
                  borderColor: "rgba(226,200,150,0.55)",
                  boxShadow: "0 0 12px rgba(226,200,150,0.2)",
                }}
              />
            )}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 32% 28%, ${c0}, ${c1} 52%, ${c2})`,
                boxShadow: `inset -8px -8px 18px rgba(0,0,0,0.5), 0 0 32px ${c1}55`,
              }}
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-[26px] font-bold leading-tight text-white">{body.name}</h2>
            <p className="mt-1 text-xs text-slate-400">{body.orderLabel}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10">
          <StatCell label="Диаметр" value={body.stats.diameter} />
          <StatCell label="Расст. от Солнца" value={body.stats.distance} sub={body.stats.distanceAu} />
          <StatCell label="Орбитальный период" value={body.stats.period} sub={body.stats.periodNote} />
          <StatCell label="Сутки (вращение)" value={body.stats.rotation} />
          <StatCell label="Спутники" value={body.stats.moons} />
          <StatCell label="Класс" value={body.kindShort} />
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Сравнение с Землёй
            </p>
            <p className="font-display text-[11px] text-solar-300">{ratioLabel}</p>
          </div>
          <div className="mt-2 space-y-2">
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                <span>{body.name}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${barPct}%`,
                    background: `linear-gradient(90deg, ${c1}, ${c0})`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                <span>Земля</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-slate-500/80"
                  style={{ width: `${(1 / JUPITER_RATIO) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-md border-l-2 border-solar-400 bg-white/[0.04] p-3.5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-solar-300">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M6 1l1.2 3.1L10.5 5 7.2 6 6 9.2 4.8 6 1.5 5l3.3-.9L6 1z"
                fill="currentColor"
              />
            </svg>
            Знаете ли вы?
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{body.fact}</p>
        </div>
      </div>

      <div className="flex gap-2 border-t border-white/5 p-4">
        <button
          onClick={onPrev}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-solar-400/50 hover:bg-solar-400/10 hover:text-white active:scale-[0.97]"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 1.5L3.5 6 8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {prevName}
        </button>
        <button
          onClick={onNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-solar-400/50 hover:bg-solar-400/10 hover:text-white active:scale-[0.97]"
        >
          {nextName}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4 1.5L8.5 6 4 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
