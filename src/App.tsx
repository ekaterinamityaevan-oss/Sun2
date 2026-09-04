import { useCallback, useEffect, useRef, useState } from "react";
import SolarCanvas from "./components/SolarCanvas";
import InfoPanel from "./components/InfoPanel";
import ControlsBar from "./components/ControlsBar";
import { ALL_BODIES, PLANETS } from "./data/bodies";

export default function App() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(30);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const simDaysRef = useRef<HTMLSpanElement | null>(null);

  const selected = selectedId ? ALL_BODIES.find((b) => b.id === selectedId) ?? null : null;

  const stepPlanet = useCallback((dir: 1 | -1) => {
    setSelectedId((cur) => {
      const idx = PLANETS.findIndex((b) => b.id === cur);
      const next = idx === -1 ? (dir === 1 ? 0 : PLANETS.length - 1) : (idx + dir + PLANETS.length) % PLANETS.length;
      return PLANETS[next].id;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space" && tag !== "BUTTON") {
        e.preventDefault();
        setPlaying((v) => !v);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        stepPlanet(1);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stepPlanet(-1);
      } else if (e.code === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepPlanet]);

  const planetIdx = selected ? PLANETS.findIndex((b) => b.id === selected.id) : -1;
  const prevName = planetIdx >= 0 ? PLANETS[(planetIdx + PLANETS.length - 1) % PLANETS.length].name : PLANETS[PLANETS.length - 1].name;
  const nextName = planetIdx >= 0 ? PLANETS[(planetIdx + 1) % PLANETS.length].name : PLANETS[0].name;

  return (
    <div className="font-body fixed inset-0 overflow-hidden bg-space-950 text-slate-200">
      {/* симуляция */}
      <div className="absolute inset-0">
        <SolarCanvas
          playing={playing}
          speed={speed}
          showOrbits={showOrbits}
          showLabels={showLabels}
          selectedId={selectedId}
          onSelect={setSelectedId}
          simDaysRef={simDaysRef}
        />
      </div>

      {/* шапка */}
      <header className="head-in pointer-events-none absolute left-5 top-5 z-10 md:left-7 md:top-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-solar-400/90 md:text-[11px]">
          Интерактивная модель · 8 планет
        </p>
        <h1
          className="mt-1.5 font-display text-[21px] font-black leading-tight tracking-wide text-white md:text-[32px]"
          style={{ textShadow: "0 2px 32px rgba(245,180,69,0.28)" }}
        >
          Солнечная система
        </h1>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
            <span className={`size-1.5 rounded-full ${playing ? "animate-pulse bg-emerald-400" : "bg-solar-400"}`} />
            <span className="text-[11px] text-slate-400">
              {playing ? "идёт" : "пауза"} · T+
            </span>
            <span ref={simDaysRef} className="font-display text-[11px] font-medium text-slate-100">
              0 сут
            </span>
          </span>
          <span className="hidden text-[11px] text-slate-600 sm:block">масштаб схематичен</span>
        </div>
      </header>

      {/* подсказка */}
      <div
        className={`pointer-events-none absolute right-5 top-6 z-10 flex items-center gap-2.5 rounded-full border border-white/10 bg-space-900/80 py-2 pl-3 pr-4 backdrop-blur-sm transition-opacity duration-700 md:right-7 max-sm:left-5 max-sm:right-auto max-sm:top-[132px] ${
          selectedId ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="hint-dot size-2 rounded-full bg-solar-400" />
        <span className="text-xs font-semibold text-slate-300">
          Нажмите на планету, чтобы узнать больше
        </span>
      </div>

      {/* панель фактов */}
      {selected && (
        <InfoPanel
          body={selected}
          prevName={prevName}
          nextName={nextName}
          onClose={() => setSelectedId(null)}
          onPrev={() => stepPlanet(-1)}
          onNext={() => stepPlanet(1)}
        />
      )}

      {/* пульт управления */}
      <ControlsBar
        playing={playing}
        speed={speed}
        showOrbits={showOrbits}
        showLabels={showLabels}
        selectedId={selectedId}
        onTogglePlay={() => setPlaying((v) => !v)}
        onSpeedChange={setSpeed}
        onToggleOrbits={() => setShowOrbits((v) => !v)}
        onToggleLabels={() => setShowLabels((v) => !v)}
        onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
      />
    </div>
  );
}
