import { useEffect, useId, useRef, useState, type Ref } from "react";
import type { Design, DesignElement, Unit } from "@/lib/neon/types";
import { CAP_RATIO, clearMeasureCache, designStats, elementBox, fmtLen, type Catalog } from "@/lib/neon/engine";

export function useFontsVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    const bump = () => { clearMeasureCache(); setV((x) => x + 1); };
    document.fonts.ready.then(bump);
    document.fonts.addEventListener("loadingdone", bump);
    return () => document.fonts.removeEventListener("loadingdone", bump);
  }, []);
  return v;
}

interface Props {
  design: Design;
  catalog: Catalog;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (el: DesignElement) => void;
  lightsOn?: boolean;
  unit?: Unit;
  rulers?: boolean;
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
  minHeightFor?: (el: DesignElement) => number;
}

export function NeonCanvas({ design, catalog, selectedId, onSelect, onChange, lightsOn = true, unit = "in", rulers = true, className, svgRef, minHeightFor }: Props) {
  useFontsVersion();
  const fid = useId().replace(/:/g, "");
  const { boardW: W, boardH: H } = designStats(design, catalog);
  const m = Math.max(W, H) * 0.09 + 1;
  const innerRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ id: string; mode: "move" | "resize"; dx: number; dy: number; el: DesignElement } | null>(null);
  const bb = catalog.backboards.find((b) => b.id === design.backboardId);
  const color = (id: string) => catalog.colors.find((c) => c.id === id)?.hex ?? "#ff3ea5";

  const pt = (e: React.PointerEvent) => {
    const svg = innerRef.current!;
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const r = p.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: r.x, y: r.y };
  };
  const start = (e: React.PointerEvent, el: DesignElement, mode: "move" | "resize") => {
    if (!onChange) return;
    e.stopPropagation();
    onSelect?.(el.id);
    const p = pt(e);
    drag.current = { id: el.id, mode, dx: p.x - el.x, dy: p.y - el.y, el };
    innerRef.current?.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !onChange) return;
    const p = pt(e);
    if (d.mode === "move") {
      onChange({ ...d.el, x: Math.min(W, Math.max(0, p.x - d.dx)), y: Math.min(H, Math.max(0, p.y - d.dy)) });
    } else {
      const box = elementBox(d.el, catalog);
      const dist = Math.hypot(p.x - d.el.x, p.y - d.el.y);
      const orig = Math.hypot(box.w / 2, box.h / 2);
      const min = minHeightFor?.(d.el) ?? 1;
      const nh = Math.min(H * 1.2, Math.max(min, (d.el.height * dist) / orig));
      onChange({ ...d.el, height: Math.round(nh * 10) / 10 });
    }
  };
  const end = () => { drag.current = null; };

  const setRef = (n: SVGSVGElement | null) => {
    innerRef.current = n;
    if (typeof svgRef === "function") svgRef(n);
    else if (svgRef) (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = n;
  };

  return (
    <svg
      ref={setRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${-m} ${-m} ${W + 2 * m} ${H + 2 * m}`}
      className={className}
      onPointerMove={move}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerDown={() => onSelect?.(null)}
      style={{ touchAction: "none", userSelect: "none" }}
    >
      <defs>
        <filter id={`glow-${fid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={0.18} result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={0.7} result="b2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation={1.8} result="b3" />
          <feMerge>
            <feMergeNode in="b3" /><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Backboard */}
      {bb?.kind === "cut" ? (
        <g opacity={0.14}>
          {design.elements.map((el) => {
            const b = elementBox(el, catalog);
            return (
              <rect key={el.id} x={-b.w / 2 - 1} y={-b.h / 2 - 1} width={b.w + 2} height={b.h + 2} rx={1.2}
                fill="#ffffff" transform={`translate(${el.x} ${el.y}) rotate(${el.rotation})`} />
            );
          })}
          <rect x={0} y={0} width={W} height={H} fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeDasharray="0.3 0.3" strokeWidth={0.05} />
        </g>
      ) : (
        <rect x={0} y={0} width={W} height={H} rx={bb?.kind === "rounded" ? bb.radius : 0.05}
          fill="#ffffff" fillOpacity={0.07} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={0.06} />
      )}

      {/* Elements */}
      {design.elements.map((el) => {
        const b = elementBox(el, catalog);
        const hex = color(el.colorId);
        const sel = el.id === selectedId;
        return (
          <g key={el.id} transform={`translate(${el.x} ${el.y}) rotate(${el.rotation})`}
            onPointerDown={(e) => start(e, el, "move")} style={{ cursor: onChange ? "grab" : "default" }}>
            <rect x={-b.w / 2} y={-b.h / 2} width={b.w} height={b.h} fill="transparent" />
            {el.type === "text" ? (
              <>
                <text textAnchor="middle" dominantBaseline="central" fontFamily={`"${b.font?.family}"`} fontWeight={b.font?.weight}
                  fontSize={el.height / CAP_RATIO} fill={hex} opacity={lightsOn ? 1 : 0.45}
                  filter={lightsOn ? `url(#glow-${fid})` : undefined}>{el.text}</text>
                {lightsOn && (
                  <text textAnchor="middle" dominantBaseline="central" fontFamily={`"${b.font?.family}"`} fontWeight={b.font?.weight}
                    fontSize={el.height / CAP_RATIO} fill="#ffffff" opacity={0.45}>{el.text}</text>
                )}
              </>
            ) : b.shape ? (
              <g transform={`scale(${el.height / b.shape.viewBox[1]}) translate(${-b.shape.viewBox[0] / 2} ${-b.shape.viewBox[1] / 2})`}>
                {b.shape.paths.map((d, i) => (
                  <g key={i}>
                    <path d={d} fill="none" stroke={hex} strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={(0.42 * b.shape!.viewBox[1]) / el.height} opacity={lightsOn ? 1 : 0.45}
                      filter={lightsOn ? `url(#glow-${fid})` : undefined} />
                    {lightsOn && (
                      <path d={d} fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth={(0.14 * b.shape!.viewBox[1]) / el.height} />
                    )}
                  </g>
                ))}
              </g>
            ) : null}
            {sel && onChange && (
              <>
                <rect x={-b.w / 2 - 0.25} y={-b.h / 2 - 0.25} width={b.w + 0.5} height={b.h + 0.5} fill="none"
                  stroke="#7ff3ff" strokeWidth={0.06} strokeDasharray="0.35 0.2" />
                <circle cx={b.w / 2 + 0.25} cy={b.h / 2 + 0.25} r={Math.max(0.35, W / 60)} fill="#7ff3ff"
                  style={{ cursor: "nwse-resize" }} onPointerDown={(e) => start(e, el, "resize")} />
              </>
            )}
          </g>
        );
      })}

      {rulers && (
        <g fill="#ffffff" fillOpacity={0.6} fontFamily="Manrope, sans-serif" fontSize={Math.max(0.55, m * 0.32)}>
          <line x1={0} x2={W} y1={-m * 0.45} y2={-m * 0.45} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={0.04} />
          <text x={W / 2} y={-m * 0.6} textAnchor="middle">{fmtLen(W, unit)}</text>
          <line y1={0} y2={H} x1={-m * 0.45} x2={-m * 0.45} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={0.04} />
          <text x={-m * 0.6} y={H / 2} textAnchor="middle" transform={`rotate(-90 ${-m * 0.6} ${H / 2})`}>{fmtLen(H, unit)}</text>
        </g>
      )}
    </svg>
  );
}
