import { ALL_BODIES } from "../data/bodies";

const MIN_SPEED = 1;
const MAX_SPEED = 730;
const LOG_MIN = Math.log(MIN_SPEED);
const LOG_MAX = Math.log(MAX_SPEED);

const PRESETS = [7, 30, 90, 365];

interface ControlsBarProps {
  playing: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  selectedId: string | null;
  onTogglePlay: () => void;
  onSpeedChange: (v: number) => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onSelect: (id: string) => void;
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="group flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-slate-200"
    >
      <span
        className={`relative inline-block h-[18px] w-[34px] rounded-full transition-colors duration-300 ${
          on ? "bg-solar-400/90" : "bg-white/12"
        }`}
      >
        <span
          className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow transition-all duration-300 ${
            on ? "left-[18px]" : "left-[2px]"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

export default function ControlsBar({
  playing,
  speed,
  showOrbits,
  showLabels,
  selectedId,
  onTogglePlay,
  onSpeedChange,
  onToggleOrbits,
  onToggleLabels,
  onSelect,
}: ControlsBarProps) {
  const sliderPos = Math.round(((Math.log(speed) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 1000);
  const fromSlider = (v: number) =>
    Math.round(Math.exp(LOG_MIN + (v / 1000) * (LOG_MAX - LOG_MIN)));

  const readout =
    speed >= 365
      ? `${(speed / 365).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} лет/с`
      : `${speed} сут/с`;

  return (
    <div className="bar-in pointer-events-auto absolute inset-x-0 bottom-0 z-20 px-3 pb-3 md:px-5 md:pb-4">
      <div className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-space-900/90 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {/* быстрые чипы небесных тел */}
        <div className="chips-scroll flex gap-1.5 overflow-x-auto border-b border-white/5 px-3 pb-2.5 pt-3">
          {ALL_BODIES.map((b) => {
            const active = selectedId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelect(b.id)}
                className={`flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
                  active
                    ? "border-solar-400/70 bg-solar-400/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:-translate-y-0.5 hover:border-white/25 hover:text-slate-100"
                }`}
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 32% 30%, ${b.colors[0]}, ${b.colors[1]} 60%, ${b.colors[2]})`,
                    boxShadow: active ? `0 0 8px ${b.colors[1]}` : "none",
                  }}
                />
                {b.name}
              </button>
            );
          })}
        </div>

        {/* пульт управления */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
          <button
            onClick={onTogglePlay}
            aria-label={playing ? "Пауза" : "Воспроизвести"}
            className={`grid size-11 shrink-0 place-items-center rounded-full text-space-950 shadow-[0_0_24px_rgba(245,180,69,0.35)] transition-all duration-200 hover:shadow-[0_0_34px_rgba(245,180,69,0.55)] active:scale-90 ${
              playing ? "bg-solar-400 hover:bg-solar-300" : "bg-solar-300 hover:bg-solar-200"
            }`}
          >
            {playing ? (
              <svg width="15" height="16" viewBox="0 0 15 16" fill="none" aria-hidden="true">
                <rect x="2.5" y="1.5" width="3.6" height="13" rx="1.1" fill="currentColor" />
                <rect x="9" y="1.5" width="3.6" height="13" rx="1.1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="15" height="16" viewBox="0 0 15 16" fill="none" aria-hidden="true" className="translate-x-[1px]">
                <path d="M3 1.8v12.4c0 .9 1 1.5 1.8 1L14 9c.8-.5.8-1.6 0-2.1L4.8.9C4 .4 3 1 3 1.8z" fill="currentColor" />
              </svg>
            )}
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:block">
              Скорость
            </span>
            <input
              type="range"
              min={0}
              max={1000}
              value={sliderPos}
              onChange={(e) => onSpeedChange(fromSlider(Number(e.target.value)))}
              className="speed-range w-32 md:w-40"
              aria-label="Скорость симуляции"
            />
            <span className="w-[74px] shrink-0 font-display text-xs font-medium text-solar-300">
              {readout}
            </span>
            <div className="hidden items-center gap-1 md:flex">
              {PRESETS.map((v) => (
                <button
                  key={v}
                  onClick={() => onSpeedChange(v)}
                  title={`${v} суток за секунду`}
                  className={`rounded border px-1.5 py-1 font-display text-[10px] transition active:scale-90 ${
                    speed === v
                      ? "border-solar-400/70 bg-solar-400/15 text-solar-300"
                      : "border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Toggle on={showOrbits} label="Орбиты" onClick={onToggleOrbits} />
            <Toggle on={showLabels} label="Подписи" onClick={onToggleLabels} />
          </div>

          <p className="ml-auto hidden text-[10px] leading-relaxed text-slate-600 lg:block">
            Пробел — пауза · ← → — планеты · Esc — закрыть
          </p>
        </div>
      </div>
    </div>
  );
}
