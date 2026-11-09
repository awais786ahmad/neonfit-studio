import type { Design, DesignElement, Material, NeonFont, NeonShape, PriceLine, Settings, Unit, BoardSize, Backboard, NeonColor, Accessory, FontCategory } from "./types";

export const IN_PER: Record<Unit, number> = { in: 1, ft: 12, m: 39.3701 };
const MAT_LEN: Record<string, number> = { in: 1, ft: 12, m: 39.3701 };
const MAT_AREA: Record<string, number> = { sqin: 1, sqft: 144, sqm: 1550.0031 };

export const fmtLen = (inches: number, unit: Unit, digits?: number) => {
  const v = inches / IN_PER[unit];
  const d = digits ?? (unit === "in" ? 1 : 2);
  return `${v.toFixed(d)}${unit === "in" ? "″" : " " + unit}`;
};
export const fmtArea = (sqin: number, unit: Unit) => {
  const v = sqin / (IN_PER[unit] * IN_PER[unit]);
  return `${v.toFixed(unit === "in" ? 0 : 2)} sq ${unit}`;
};

/** Average neon tube length per character, as a multiple of letter height. */
export const NEON_COEF: Record<FontCategory, number> = { simple: 2.3, bold: 2.6, script: 2.9, decorative: 3.4 };
/** Letter (cap) height to font-size ratio */
export const CAP_RATIO = 0.72;

const textCache = new Map<string, number>();
let canvasCtx: CanvasRenderingContext2D | null = null;
export function clearMeasureCache() { textCache.clear(); }
export function textWidthRatio(text: string, family: string) {
  const key = family + "|" + text;
  const hit = textCache.get(key);
  if (hit !== undefined) return hit;
  let r = text.length * 0.55;
  if (typeof document !== "undefined") {
    canvasCtx ??= document.createElement("canvas").getContext("2d");
    if (canvasCtx) {
      canvasCtx.font = `100px "${family}"`;
      r = canvasCtx.measureText(text || " ").width / 100;
    }
  }
  textCache.set(key, r);
  return r;
}

const periCache = new Map<string, number>();
export function shapePerimeter(shape: NeonShape) {
  const hit = periCache.get(shape.id + shape.paths.join());
  if (hit !== undefined) return hit;
  let total = (shape.viewBox[0] + shape.viewBox[1]) * 2;
  if (typeof document !== "undefined") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    total = 0;
    for (const d of shape.paths) {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
      try { total += p.getTotalLength(); } catch { /* ignore */ }
    }
  }
  periCache.set(shape.id + shape.paths.join(), total);
  return total;
}

export interface Catalog {
  fonts: NeonFont[]; colors: NeonColor[]; sizes: BoardSize[]; shapes: NeonShape[];
  backboards: Backboard[]; accessories: Accessory[]; materials: Material[]; settings: Settings;
}

export function boardDims(design: Design, cat: Pick<Catalog, "sizes">) {
  if (design.sizeMode === "preset") {
    const s = cat.sizes.find((x) => x.id === design.sizeId) ?? cat.sizes[0];
    if (s) return design.orientation === "landscape" ? s.landscape : s.portrait;
  }
  return { w: design.width, h: design.height };
}

export function elementBox(el: DesignElement, cat: Pick<Catalog, "fonts" | "shapes">) {
  if (el.type === "text") {
    const font = cat.fonts.find((f) => f.id === el.fontId) ?? cat.fonts[0];
    const fontSize = el.height / CAP_RATIO;
    const w = textWidthRatio(el.text ?? "", font?.family ?? "sans-serif") * fontSize;
    return { w: Math.max(w, 0.5), h: fontSize * 1.05, fontSize, font };
  }
  const shape = cat.shapes.find((s) => s.id === el.shapeId);
  const [vw, vh] = shape?.viewBox ?? [100, 100];
  return { w: (el.height * vw) / vh, h: el.height, fontSize: 0, shape };
}

export function elementNeon(el: DesignElement, cat: Pick<Catalog, "fonts" | "shapes">) {
  if (el.type === "text") {
    const font = cat.fonts.find((f) => f.id === el.fontId) ?? cat.fonts[0];
    const chars = (el.text ?? "").replace(/\s/g, "").length;
    return chars * el.height * NEON_COEF[font?.category ?? "simple"];
  }
  const shape = cat.shapes.find((s) => s.id === el.shapeId);
  if (!shape) return 0;
  return shapePerimeter(shape) * (el.height / shape.viewBox[1]);
}

export function designStats(design: Design, cat: Catalog) {
  const { w: boardW, h: boardH } = boardDims(design, cat);
  const bb = cat.backboards.find((b) => b.id === design.backboardId);
  const per = design.elements.map((el) => {
    const box = elementBox(el, cat);
    return { id: el.id, label: el.type === "text" ? `“${el.text}”` : box.shape?.name ?? "Shape", neonIn: elementNeon(el, cat), w: box.w, h: box.h };
  });
  const neonIn = per.reduce((a, b) => a + b.neonIn, 0);
  let areaSqIn = boardW * boardH;
  if (bb?.kind === "cut") {
    // padded bounding box of each element (1" margin), clipped to board area
    const pad = 1;
    const cutArea = per.reduce((a, p) => a + (p.w + pad * 2) * (p.h + pad * 2) * 0.82, 0);
    areaSqIn = Math.min(cutArea, boardW * boardH);
  }
  return { boardW, boardH, neonIn, areaSqIn, per };
}

function materialCharge(m: Material | undefined, neonIn: number, areaSqIn: number) {
  if (!m) return { qty: 0, sale: 0, cost: 0 };
  let qty = 1;
  if (m.method === "length") qty = neonIn / (MAT_LEN[m.unit] ?? 12);
  else if (m.method === "area") qty = areaSqIn / (MAT_AREA[m.unit] ?? 144);
  return { qty, sale: qty * m.sale, cost: qty * m.cost };
}

export function priceDesign(design: Design, cat: Catalog) {
  const stats = designStats(design, cat);
  const lines: PriceLine[] = [];
  let cost = 0;
  const neon = materialCharge(cat.materials.find((m) => m.type === "neon"), stats.neonIn, stats.areaSqIn);
  const board = materialCharge(cat.materials.find((m) => m.type === "backboard"), stats.neonIn, stats.areaSqIn);
  const adaptor = materialCharge(cat.materials.find((m) => m.type === "adaptor"), stats.neonIn, stats.areaSqIn);
  lines.push({ label: `Neon tubing (${fmtLen(stats.neonIn, "ft")})`, amount: neon.sale });
  lines.push({ label: `Acrylic backboard (${fmtArea(stats.areaSqIn, "ft")})`, amount: board.sale });
  if (adaptor.sale) lines.push({ label: "Power adaptor", amount: adaptor.sale });
  cost += neon.cost + board.cost + adaptor.cost;
  const labor = cat.settings.laborCost + cat.settings.laborPerFt * (stats.neonIn / 12);
  lines.push({ label: "Handcrafting & labor", amount: labor });
  cost += labor * 0.6;
  if (design.sizeMode === "preset") {
    const s = cat.sizes.find((x) => x.id === design.sizeId);
    if (s?.price) lines.push({ label: `Size: ${s.name}`, amount: s.price });
  }
  const bb = cat.backboards.find((b) => b.id === design.backboardId);
  if (bb?.extra) lines.push({ label: `Backboard style: ${bb.name}`, amount: bb.extra });
  const fontIds = new Set(design.elements.filter((e) => e.type === "text").map((e) => e.fontId));
  fontIds.forEach((id) => { const f = cat.fonts.find((x) => x.id === id); if (f?.extra) lines.push({ label: `Premium font: ${f.name}`, amount: f.extra }); });
  const colorIds = new Set(design.elements.map((e) => e.colorId));
  colorIds.forEach((id) => { const c = cat.colors.find((x) => x.id === id); if (c?.extra) lines.push({ label: `Special color: ${c.name}`, amount: c.extra }); });
  design.elements.filter((e) => e.type === "shape").forEach((e) => { const s = cat.shapes.find((x) => x.id === e.shapeId); if (s?.extra) lines.push({ label: `Shape: ${s.name}`, amount: s.extra }); });
  design.accessoryIds.forEach((id) => { const a = cat.accessories.find((x) => x.id === id); if (a) lines.push({ label: a.title, amount: a.price }); });
  const total = Math.round(lines.reduce((a, l) => a + l.amount, 0) * 100) / 100;
  return { lines, total, cost: Math.round(cost * 100) / 100, stats };
}

export const money = (n: number, cur = "$") => `${cur}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
export const uid = (p = "") => p + Math.random().toString(36).slice(2, 9);
export const newOrderId = () => "NF-" + Math.floor(10000 + Math.random() * 89999);

export async function fileToDataUrl(file: File, maxW = 900): Promise<string> {
  const raw = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return raw;
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = raw; });
  const scale = Math.min(1, maxW / img.width);
  const cv = document.createElement("canvas");
  cv.width = img.width * scale; cv.height = img.height * scale;
  cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL("image/jpeg", 0.8);
}
