import { useEffect, useRef } from "react";
import { PLANETS, SUN, formatSimDays, type CelestialBody } from "../data/bodies";

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface Star {
  nx: number;
  ny: number;
  r: number;
  a: number;
  tw: number;
  ph: number;
  warm: boolean;
}

interface SolarCanvasProps {
  playing: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  simDaysRef: React.RefObject<HTMLSpanElement | null>;
}

export default function SolarCanvas({
  playing,
  speed,
  showOrbits,
  showLabels,
  selectedId,
  onSelect,
  simDaysRef,
}: SolarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef({ playing, speed, showOrbits, showLabels, selectedId, onSelect, simDaysRef });
  paramsRef.current = { playing, speed, showOrbits, showLabels, selectedId, onSelect, simDaysRef };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let last = performance.now();
    let simDays = 0;
    let lastDayShown = -1;
    let cx = 0;
    let cy = 0;
    let maxR = 220;
    let hoverId: string | null = null;
    const mouse = { x: -999, y: -999, inside: false };
    const pos: Record<string, { x: number; y: number; r: number }> = {};
    const anim: Record<string, { h: number; s: number }> = {};
    const meteor = { active: false, x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1 };
    let nextMeteorAt = 3.5;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = clamp(Math.round((w * h) / 6200), 140, 280);
      stars = Array.from({ length: count }, () => ({
        nx: Math.random(),
        ny: Math.random(),
        r: Math.random() < 0.1 ? 1.5 + Math.random() * 0.7 : 0.4 + Math.random() * 0.9,
        a: 0.22 + Math.random() * 0.6,
        tw: 0.5 + Math.random() * 1.7,
        ph: Math.random() * TAU,
        warm: Math.random() < 0.16,
      }));
      if (cx === 0) cx = w / 2;
    };
    resize();
    window.addEventListener("resize", resize);

    const nebula = (x: number, y: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const roundRect = (x: number, y: number, rw: number, rh: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, r);
      ctx.arcTo(x + rw, y + rh, x, y + rh, r);
      ctx.arcTo(x, y + rh, x, y, r);
      ctx.arcTo(x, y, x + rw, y, r);
      ctx.closePath();
    };

    const bodyById = (id: string): CelestialBody =>
      id === SUN.id ? SUN : PLANETS.find((b) => b.id === id)!;

    const drawRingPart = (x: number, y: number, r: number, back: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.42);
      ctx.scale(1, 0.42);
      const from = back ? Math.PI : 0;
      const to = back ? TAU : Math.PI;
      ctx.lineWidth = Math.max(2, r * 0.5);
      ctx.strokeStyle = back ? "rgba(213,187,138,0.34)" : "rgba(226,200,150,0.62)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.05, from, to);
      ctx.stroke();
      ctx.lineWidth = Math.max(1, r * 0.16);
      ctx.strokeStyle = back ? "rgba(140,116,74,0.22)" : "rgba(150,125,80,0.4)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.72, from, to);
      ctx.stroke();
      ctx.restore();
    };

    const pick = (mx: number, my: number): string | null => {
      let best: string | null = null;
      let bestD = Infinity;
      for (const id of Object.keys(pos)) {
        const q = pos[id];
        const d = Math.hypot(mx - q.x, my - q.y);
        const thr = Math.max(13, q.r + 7);
        if (d < thr && d < bestD) {
          best = id;
          bestD = d;
        }
      }
      return best;
    };

    const toLocal = (e: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMove = (e: PointerEvent) => {
      const pt = toLocal(e);
      mouse.x = pt.x;
      mouse.y = pt.y;
      mouse.inside = true;
      const id = pick(pt.x, pt.y);
      if (id !== hoverId) hoverId = id;
      canvas.style.cursor = id ? "pointer" : "default";
    };
    const onLeave = () => {
      mouse.inside = false;
      hoverId = null;
      canvas.style.cursor = "default";
    };
    const onClick = (e: MouseEvent) => {
      const pt = toLocal(e);
      paramsRef.current.onSelect(pick(pt.x, pt.y));
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const p = paramsRef.current;

      if (p.playing) simDays += p.speed * dt;
      const dInt = Math.floor(simDays);
      if (dInt !== lastDayShown) {
        lastDayShown = dInt;
        const el = p.simDaysRef.current;
        if (el) el.textContent = formatSimDays(dInt);
      }

      /* ---- layout (плавный сдвиг, когда панель открыта) ---- */
      const panelOpen = !!p.selectedId;
      const wide = w > 900;
      const shifted = panelOpen && wide;
      const availW = shifted ? Math.max(340, w - 400) : w;
      const tCx = availW / 2 + (shifted ? 6 : 0);
      const topRes = 96;
      const botRes = 168;
      const tMaxR = Math.max(100, Math.min(availW / 2 - 26, (h - topRes - botRes) / 2));
      cx += (tCx - cx) * 0.065;
      maxR += (tMaxR - maxR) * 0.065;
      cy = topRes + (h - topRes - botRes) / 2;
      const scale = clamp(maxR / 360, 0.55, 1.3);

      /* ---- фон ---- */
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#070b18");
      bg.addColorStop(0.5, "#0a1024");
      bg.addColorStop(1, "#05070f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      nebula(w * 0.14, h * 0.22, Math.max(w, h) * 0.5, "rgba(62,118,190,0.055)");
      nebula(w * 0.86, h * 0.78, Math.max(w, h) * 0.46, "rgba(216,140,70,0.04)");
      nebula(w * 0.72, h * 0.1, Math.max(w, h) * 0.34, "rgba(150,90,170,0.035)");

      /* ---- звёзды ---- */
      for (const s of stars) {
        ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * s.tw + s.ph));
        ctx.fillStyle = s.warm ? "#ffe2b8" : "#cdd9f5";
        ctx.beginPath();
        ctx.arc(s.nx * w + Math.sin(t * 0.03 + s.ph) * 4, s.ny * h, s.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* ---- метеор ---- */
      if (!meteor.active && t > nextMeteorAt) {
        meteor.active = true;
        meteor.age = 0;
        meteor.life = 0.9 + Math.random() * 0.5;
        meteor.x = w * (0.15 + Math.random() * 0.7);
        meteor.y = -20 + Math.random() * h * 0.18;
        const sp = 430 + Math.random() * 380;
        const dir = Math.random() < 0.5 ? 0.55 : Math.PI - 0.55;
        meteor.vx = Math.cos(dir) * sp;
        meteor.vy = Math.abs(Math.sin(dir)) * sp * 0.55 + 130;
      }
      if (meteor.active) {
        meteor.age += dt;
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        const k = meteor.age / meteor.life;
        if (k >= 1) {
          meteor.active = false;
          nextMeteorAt = t + 5 + Math.random() * 7;
        } else {
          const vm = Math.hypot(meteor.vx, meteor.vy);
          const tx = meteor.x - (meteor.vx / vm) * 90;
          const ty = meteor.y - (meteor.vy / vm) * 90;
          const mg = ctx.createLinearGradient(meteor.x, meteor.y, tx, ty);
          const alpha = Math.sin(Math.PI * k) * 0.85;
          mg.addColorStop(0, `rgba(255,244,220,${alpha})`);
          mg.addColorStop(1, "rgba(255,244,220,0)");
          ctx.strokeStyle = mg;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }

      const selId = p.selectedId;

      /* ---- орбиты ---- */
      if (p.showOrbits || selId) {
        for (const b of PLANETS) {
          const R = b.orbitFrac * maxR;
          const isSel = selId === b.id;
          const isHov = hoverId === b.id;
          if (!p.showOrbits && !isSel && !isHov) continue;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, TAU);
          ctx.strokeStyle = isSel
            ? "rgba(245,180,69,0.5)"
            : isHov
              ? "rgba(170,190,235,0.38)"
              : "rgba(140,160,210,0.14)";
          ctx.lineWidth = isSel ? 1.4 : 1;
          ctx.stroke();
          if (isSel) {
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, TAU);
            ctx.strokeStyle = "rgba(245,180,69,0.08)";
            ctx.lineWidth = 6;
            ctx.stroke();
          }
        }
      }

      /* ---- планеты: шлейфы, сферы, кольца, луна, подписи ---- */
      for (const b of PLANETS) {
        const R = b.orbitFrac * maxR;
        const ang = b.startAngle + (simDays / b.periodDays) * TAU;
        const st = anim[b.id] ?? (anim[b.id] = { h: 0, s: 0 });
        st.h += ((hoverId === b.id ? 1 : 0) - st.h) * 0.16;
        st.s += ((selId === b.id ? 1 : 0) - st.s) * 0.12;
        const x = cx + Math.cos(ang) * R;
        const y = cy + Math.sin(ang) * R;
        const r = b.radiusPx * scale * (1 + 0.22 * st.h);
        pos[b.id] = { x, y, r };

        /* шлейф-комета */
        const travel = p.playing
          ? clamp((p.speed / b.periodDays) * TAU * 0.55, 0.1, 0.85)
          : 0.12;
        const segs = 22;
        for (let i = 0; i < segs; i++) {
          const k = 1 - i / segs;
          ctx.globalAlpha = 0.3 * k * k;
          ctx.strokeStyle = b.colors[1];
          ctx.lineWidth = Math.min(b.radiusPx * scale * 1.5, 1 + 2.6 * k);
          ctx.beginPath();
          ctx.arc(cx, cy, R, ang - travel * (i / segs), ang - travel * ((i + 1) / segs) - 0.005, true);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        /* кольца Сатурна — задняя половина */
        if (b.hasRings) drawRingPart(x, y, r, true);

        /* сфера с освещением от Солнца */
        const dx = cx - x;
        const dy = cy - y;
        const dl = Math.hypot(dx, dy) || 1;
        const glow = Math.max(st.s, st.h * 0.7);
        if (glow > 0.02) {
          ctx.shadowColor = b.colors[1];
          ctx.shadowBlur = 20 * glow;
        }
        const g = ctx.createRadialGradient(
          x + (dx / dl) * r * 0.55,
          y + (dy / dl) * r * 0.55,
          r * 0.1,
          x,
          y,
          r * 1.15,
        );
        g.addColorStop(0, b.colors[0]);
        g.addColorStop(0.55, b.colors[1]);
        g.addColorStop(1, b.colors[2]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;

        /* полосы Юпитера */
        if (b.id === "jupiter" && r > 6) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.clip();
          ctx.fillStyle = "rgba(120,70,30,0.2)";
          ctx.fillRect(x - r, y - r * 0.42, r * 2, r * 0.2);
          ctx.fillRect(x - r, y + r * 0.18, r * 2, r * 0.16);
          ctx.fillStyle = "rgba(255,235,200,0.14)";
          ctx.fillRect(x - r, y - r * 0.12, r * 2, r * 0.14);
          ctx.restore();
        }

        /* кольца Сатурна — передняя половина */
        if (b.hasRings) drawRingPart(x, y, r, false);

        /* Луна у Земли */
        if (b.hasMoon) {
          const ma = 1 + (simDays / 27.32) * TAU;
          const mr = Math.max(13, r * 2.3);
          const mx = x + Math.cos(ma) * mr;
          const my = y + Math.sin(ma) * mr;
          ctx.strokeStyle = "rgba(200,214,240,0.1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, mr, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#c9d2e4";
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(1.6, 1.9 * scale), 0, TAU);
          ctx.fill();
        }

        /* пунктирное кольцо выделения */
        if (st.s > 0.03) {
          ctx.save();
          ctx.globalAlpha = st.s;
          ctx.strokeStyle = "rgba(255,205,110,0.9)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 6]);
          ctx.lineDashOffset = -t * 26;
          ctx.beginPath();
          ctx.arc(x, y, r + 7 + 1.6 * Math.sin(t * 2.2), 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgba(255,205,110,0.18)";
          ctx.beginPath();
          ctx.arc(x, y, r + 13, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }

        /* подпись */
        if (p.showLabels || selId === b.id || hoverId === b.id) {
          const active = selId === b.id;
          ctx.globalAlpha = active ? 0.95 : hoverId === b.id ? 0.85 : 0.5;
          ctx.font = `${active ? 700 : 600} 11px Manrope, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = active ? "#ffd27a" : "#dbe4f5";
          ctx.fillText(b.name, x, y + r + (b.hasRings ? r * 1.15 : 8));
          ctx.globalAlpha = 1;
        }
      }

      /* ---- Солнце ---- */
      const sunR = SUN.radiusPx * scale * (1 + 0.025 * Math.sin(t * 1.8));
      pos[SUN.id] = { x: cx, y: cy, r: sunR };

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.045);
      ctx.fillStyle = "rgba(255,180,80,0.045)";
      for (let i = 0; i < 8; i++) {
        ctx.rotate(TAU / 8);
        ctx.beginPath();
        ctx.moveTo(0, -sunR * 1.05);
        ctx.lineTo(sunR * 3.1, -sunR * 0.28);
        ctx.lineTo(sunR * 3.1, sunR * 0.28);
        ctx.lineTo(0, sunR * 1.05);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      const glowLayers: Array<[number, string]> = [
        [6, "rgba(255,160,60,0.05)"],
        [3.4, "rgba(255,170,70,0.09)"],
        [2, "rgba(255,190,90,0.16)"],
      ];
      for (const [m, c] of glowLayers) {
        const gg = ctx.createRadialGradient(cx, cy, sunR * 0.4, cx, cy, sunR * m);
        gg.addColorStop(0, c);
        gg.addColorStop(1, "rgba(255,160,60,0)");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(cx, cy, sunR * m, 0, TAU);
        ctx.fill();
      }
      const sunSel = selId === SUN.id;
      const sunGlow = Math.max(sunSel ? 1 : 0, hoverId === SUN.id ? 0.7 : 0);
      if (sunGlow > 0.02) {
        ctx.shadowColor = "#ffc84d";
        ctx.shadowBlur = 26 * sunGlow;
      }
      const sg = ctx.createRadialGradient(cx - sunR * 0.25, cy - sunR * 0.25, sunR * 0.1, cx, cy, sunR);
      sg.addColorStop(0, "#fff8e1");
      sg.addColorStop(0.45, "#ffd76a");
      sg.addColorStop(0.8, "#ff9c3a");
      sg.addColorStop(1, "#f26d1e");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (sunSel) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,205,110,0.9)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -t * 26;
        ctx.beginPath();
        ctx.arc(cx, cy, sunR + 9, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }

      if (p.showLabels || sunSel || hoverId === SUN.id) {
        ctx.globalAlpha = sunSel ? 0.95 : hoverId === SUN.id ? 0.85 : 0.5;
        ctx.font = `${sunSel ? 700 : 600} 11px Manrope, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = sunSel ? "#ffd27a" : "#dbe4f5";
        ctx.fillText("Солнце", cx, cy + sunR + 10);
        ctx.globalAlpha = 1;
      }

      /* ---- тултип ---- */
      if (hoverId && hoverId !== selId && mouse.inside) {
        const b = bodyById(hoverId);
        const pp = pos[hoverId];
        const hint = "нажмите для подробностей";
        ctx.font = "700 12px Manrope, sans-serif";
        const wName = ctx.measureText(b.name).width;
        ctx.font = "500 10px Manrope, sans-serif";
        const wHint = ctx.measureText(hint).width;
        const bw = Math.max(wName, wHint) + 24;
        const bh = 42;
        const bx = clamp(pp.x - bw / 2, 8, w - bw - 8);
        let by = pp.y - pp.r - bh - 12;
        if (by < 8) by = pp.y + pp.r + 14;
        roundRect(bx, by, bw, bh, 8);
        ctx.fillStyle = "rgba(10,15,30,0.93)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "700 12px Manrope, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(b.name, bx + 12, by + 8);
        ctx.font = "500 10px Manrope, sans-serif";
        ctx.fillStyle = "rgba(245,180,69,0.95)";
        ctx.fillText(hint, bx + 12, by + 25);
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
