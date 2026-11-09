import type {
  Accessory, Backboard, BoardSize, Design, Expense, Material, NeonColor, NeonFont, NeonShape, Order, Product, Settings, AdminUser, FontCategory,
} from "./types";

const f = (name: string, family: string, category: FontCategory, isNew = false, extra = 0): NeonFont => ({
  id: "font-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name, family, category, weight: 300, extra: isNew ? 5 : extra, isNew, active: true,
});

export const DEFAULT_FONTS: NeonFont[] = [
  f("Alexa", "Pacifico", "script"),
  f("Amsterdam", "Great Vibes", "script", true),
  f("Amanda", "Dancing Script", "script"),
  f("Austin", "Satisfy", "script"),
  f("Barcelona", "Yellowtail", "script"),
  f("Bayview", "Kaushan Script", "script"),
  f("Beachfront", "Sacramento", "script"),
  f("Chelsea", "Parisienne", "script"),
  f("Florence", "Allura", "script", true),
  f("Freehand", "Caveat", "script"),
  f("Freespirit", "Mr Dafoe", "script"),
  f("Greenworld", "Damion", "script", true),
  f("Lazy Sunday", "Cookie", "script", true),
  f("Love Note", "Alex Brush", "script", true),
  f("Love Neon", "Neonderthaw", "script", true),
  f("Manchester", "Lobster", "script"),
  f("Neonscript", "Courgette", "script"),
  f("New Cursive", "Marck Script", "script", true),
  f("Northshore", "Niconne", "script"),
  f("Notting Hill", "Tangerine", "script", true),
  f("Olivia Vintage", "Leckerli One", "script"),
  f("Photogenic", "Norican", "script"),
  f("Royalty Rocket", "Kalam", "script"),
  f("Signature", "Great Vibes", "script"),
  f("Sorrento", "Satisfy", "script"),
  f("Venetian", "Parisienne", "script", true),
  f("Weekender", "Pacifico", "script"),
  f("Wild Script", "Kaushan Script", "script"),
  f("Avante", "Josefin Sans", "simple"),
  f("Bellview", "Comfortaa", "simple"),
  f("Buttercup", "Fredoka", "bold"),
  f("Classic Type", "Playfair Display", "simple", true),
  f("Los Angeles", "Bebas Neue", "bold"),
  f("Majorca", "Abril Fatface", "bold", true),
  f("Manhattan", "Oswald", "bold"),
  f("Marquee", "Limelight", "decorative"),
  f("Mayfair", "Poiret One", "simple", true),
  f("Melbourne", "Quicksand", "simple"),
  f("Milan", "Raleway", "simple"),
  f("Monaco", "Lexend", "simple", true),
  f("Neo Tokyo", "Righteous", "bold"),
  f("San Diego", "Baloo 2", "bold", true),
  f("Simplicity", "Quicksand", "simple"),
  f("Typewriter", "Special Elite", "simple"),
  f("Waikiki", "Archivo Black", "bold"),
  f("Neon Glow", "Tilt Neon", "simple"),
  f("Neon Lite", "Monoton", "decorative", false, 5),
  f("Neontrace", "Audiowide", "bold"),
  f("Nevada", "Bungee", "bold"),
  f("Rockstar", "Bungee Inline", "decorative", true),
  f("Sci-Fi", "Orbitron", "simple", true),
  f("Submarine", "Michroma", "simple", true),
  f("Vancouver", "Syncopate", "bold", true),
  f("Westcoast", "Nova Square", "simple"),
];

export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  [
    "Unbounded:wght@400;600;800", "Manrope:wght@400;500;600;700",
    ...Array.from(new Set(DEFAULT_FONTS.map((x) => x.family))),
  ]
    .map((fam) => "family=" + fam.replace(/ /g, "+"))
    .join("&") + "&display=swap";

const c = (name: string, hex: string, extra = 0): NeonColor => ({ id: "color-" + name.toLowerCase().replace(/ /g, "-"), name, hex, extra, active: true });
export const DEFAULT_COLORS: NeonColor[] = [
  c("Pink", "#ff3ea5"), c("Yellow", "#ffe94a"), c("Ice Blue", "#7ff3ff"), c("Red", "#ff2d3d"),
  c("Golden", "#ffb547", 5), c("Blue", "#3d7bff"), c("Warm White", "#fff1d6"), c("Green", "#3dff8b"),
];

export const DEFAULT_SIZES: BoardSize[] = [
  { id: "size-small", name: "Small", landscape: { w: 12, h: 6 }, portrait: { w: 6, h: 12 }, price: 0, active: true },
  { id: "size-medium", name: "Medium", landscape: { w: 20, h: 12 }, portrait: { w: 12, h: 20 }, price: 15, active: true },
  { id: "size-large", name: "Large", landscape: { w: 24, h: 15 }, portrait: { w: 15, h: 24 }, price: 30, active: true },
];

export const DEFAULT_SHAPES: NeonShape[] = [
  { id: "shape-heart", name: "Heart", viewBox: [100, 100], extra: 0, active: true, paths: ["M50 85 C20 65 8 48 8 32 C8 18 19 10 30 10 C40 10 46 16 50 24 C54 16 60 10 70 10 C81 10 92 18 92 32 C92 48 80 65 50 85 Z"] },
  { id: "shape-crown", name: "Crown", viewBox: [100, 100], extra: 5, active: true, paths: ["M14 76 L8 28 L32 50 L50 16 L68 50 L92 28 L86 76 Z", "M14 88 L86 88"] },
  { id: "shape-gamepad", name: "Gamepad", viewBox: [100, 100], extra: 8, active: true, paths: ["M28 30 L72 30 Q92 30 94 58 Q96 80 82 80 Q74 80 68 68 L32 68 Q26 80 18 80 Q4 80 6 58 Q8 30 28 30 Z", "M20 50 L36 50", "M28 42 L28 58", "M62 46 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0", "M76 54 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0"] },
  { id: "shape-coffee", name: "Coffee", viewBox: [100, 100], extra: 5, active: true, paths: ["M16 38 L70 38 L64 82 Q63 88 57 88 L29 88 Q23 88 22 82 Z", "M70 46 Q88 46 86 58 Q84 70 66 68", "M32 28 Q28 20 34 12", "M46 28 Q42 20 48 12", "M60 28 Q56 20 62 12"] },
  { id: "shape-star", name: "Star", viewBox: [100, 100], extra: 0, active: true, paths: ["M50 8 L61 38 L93 38 L67 57 L77 88 L50 69 L23 88 L33 57 L7 38 L39 38 Z"] },
  { id: "shape-music", name: "Music", viewBox: [100, 100], extra: 0, active: true, paths: ["M38 34 L38 76", "M38 34 L82 22 L82 64", "M38 76 m-10 0 a10 8 0 1 0 20 0 a10 8 0 1 0 -20 0", "M82 64 m-10 0 a10 8 0 1 0 20 0 a10 8 0 1 0 -20 0"] },
];

export const DEFAULT_BACKBOARDS: Backboard[] = [
  { id: "bb-cut", name: "Cut Around Shape", kind: "cut", radius: 1, extra: 10, active: true },
  { id: "bb-rect", name: "Rectangle", kind: "rect", radius: 0, extra: 0, active: true },
  { id: "bb-rounded", name: "Rounded Corners", kind: "rounded", radius: 1.5, extra: 5, active: true },
];

export const DEFAULT_ACCESSORIES: Accessory[] = [
  { id: "acc-mount", title: "Wall Mount Kit", description: "Screws, standoffs and spacers for clean wall mounting.", price: 8, active: true },
  { id: "acc-hang", title: "Hanging Chain Kit", description: "Clear cables and hooks to hang your sign from the ceiling.", price: 10, active: true },
  { id: "acc-dimmer", title: "Remote Dimmer", description: "Control brightness and effects with a wireless remote.", price: 15, active: true },
];

export const DEFAULT_MATERIALS: Material[] = [
  { id: "mat-neon", name: "LED Neon Flex 6x12mm", type: "neon", unit: "ft", method: "length", cost: 1.2, sale: 4.5 },
  { id: "mat-acrylic", name: "Clear Acrylic Backboard 5mm", type: "backboard", unit: "sqft", method: "area", cost: 4, sale: 12 },
  { id: "mat-adaptor", name: "12V Power Adaptor", type: "adaptor", unit: "piece", method: "piece", cost: 6, sale: 14 },
];

export const DEFAULT_SETTINGS: Settings = {
  currency: "$",
  shippingPrice: 15,
  shippingDays: "5–7 business days",
  freeShippingOver: 300,
  laborCost: 20,
  laborPerFt: 1.5,
  minHeights: { simple: 2, bold: 2, script: 3, decorative: 3.5 },
  defaultHeights: { simple: 2.5, bold: 2.5, script: 3, decorative: 4 },
  minShapeHeight: 2,
  banks: [
    { id: "bank-1", bank: "Meezan Bank", title: "NeonFitter Pvt Ltd", number: "0123-4567890-01", iban: "PK36MEZN0001234567890101" },
  ],
};

const el = (o: Partial<import("./types").DesignElement> & { type: "text" | "shape" }) => ({
  id: Math.random().toString(36).slice(2, 9), colorId: "color-pink", x: 10, y: 6, height: 3, rotation: 0, ...o,
});
const d = (elements: ReturnType<typeof el>[], sizeId = "size-medium", backboardId = "bb-cut"): Design => ({
  elements, sizeMode: "preset", sizeId, width: 20, height: 12, orientation: "landscape", backboardId, accessoryIds: [],
});

export const DEFAULT_PRODUCTS: Product[] = [
  { id: "p-good-vibes", name: "Good Vibes Only", short: "The classic mood-lifter for any room.", description: "A flowing script sign that brings warm, happy energy to bedrooms, cafés and studios.", price: 129, salePrice: 109, kind: "editor", images: [], sizeIds: [], backboardIds: [], category: "Home", active: true, featured: true, createdAt: "2026-10-01",
    design: d([el({ type: "text", text: "Good Vibes", fontId: "font-alexa", colorId: "color-pink", x: 10, y: 5, height: 3.5 }), el({ type: "text", text: "only", fontId: "font-beachfront", colorId: "color-ice-blue", x: 12.5, y: 8.8, height: 3 })]) },
  { id: "p-game-on", name: "Game On", short: "Level up your gaming setup.", description: "Bold gamer sign with a glowing controller — perfect behind your stream setup.", price: 159, kind: "editor", images: [], sizeIds: [], backboardIds: [], category: "Gaming", active: true, featured: true, createdAt: "2026-10-02",
    design: d([el({ type: "shape", shapeId: "shape-gamepad", colorId: "color-ice-blue", x: 10, y: 4.2, height: 5 }), el({ type: "text", text: "GAME ON", fontId: "font-neo-tokyo", colorId: "color-pink", x: 10, y: 9, height: 2.5 })]) },
  { id: "p-coffee", name: "But First, Coffee", short: "For the café or the kitchen corner.", description: "A cosy steaming cup with handwritten lettering.", price: 149, salePrice: 129, kind: "editor", images: [], sizeIds: [], backboardIds: [], category: "Business", active: true, featured: true, createdAt: "2026-10-03",
    design: d([el({ type: "shape", shapeId: "shape-coffee", colorId: "color-golden", x: 4.5, y: 6, height: 6 }), el({ type: "text", text: "Coffee", fontId: "font-amanda", colorId: "color-warm-white", x: 13, y: 6, height: 3.5 })]) },
  { id: "p-love", name: "Love Heart", short: "Weddings, proposals and date nights.", description: "A soft glowing heart with romantic script — the wedding favourite.", price: 119, kind: "editor", images: [], sizeIds: [], backboardIds: [], category: "Wedding", active: true, featured: true, createdAt: "2026-10-04",
    design: d([el({ type: "shape", shapeId: "shape-heart", colorId: "color-red", x: 10, y: 6, height: 9 }), el({ type: "text", text: "Love", fontId: "font-amsterdam", colorId: "color-warm-white", x: 10, y: 5.6, height: 3 })]) },
  { id: "p-queen", name: "Queen", short: "Royal glow for her space.", description: "Crown + script lettering in luxurious gold.", price: 139, kind: "editor", images: [], sizeIds: [], backboardIds: [], category: "Home", active: true, createdAt: "2026-10-05",
    design: d([el({ type: "shape", shapeId: "shape-crown", colorId: "color-golden", x: 10, y: 3.6, height: 4 }), el({ type: "text", text: "Queen", fontId: "font-chelsea", colorId: "color-pink", x: 10, y: 8.6, height: 3.5 })]) },
  { id: "p-music", name: "Play It Loud", short: "Studio-ready music vibes.", description: "Twin music notes and clean lettering for music rooms and studios.", price: 135, kind: "editor", images: [], sizeIds: [], backboardIds: [], category: "Business", active: true, createdAt: "2026-10-06",
    design: d([el({ type: "shape", shapeId: "shape-music", colorId: "color-yellow", x: 4, y: 6, height: 6 }), el({ type: "text", text: "PLAY LOUD", fontId: "font-los-angeles", colorId: "color-blue", x: 13, y: 6, height: 2.5 })]) },
];

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString();
const mkOrder = (id: string, daysAgo: number, name: string, total: number, status: Order["status"], pay: Order["paymentStatus"], method: Order["paymentMethod"]): Order => ({
  id, createdAt: iso(daysAgo),
  customer: { name, email: name.split(" ")[0].toLowerCase() + "@mail.com", phone: "+92 300 1234567", address: "House 12, Street 4", city: "Lahore", country: "Pakistan" },
  items: [{ id: "ci-" + id, kind: "ready", productId: "p-good-vibes", name: "Good Vibes Only", design: DEFAULT_PRODUCTS[0].design, unitPrice: total - 15, unitCost: (total - 15) * 0.38, qty: 1, lines: [{ label: "Ready-made design", amount: total - 15 }], options: { Size: "Medium" } }],
  subtotal: total - 15, shipping: 15, total, cost: (total - 15) * 0.38 + 15, paymentMethod: method,
  paymentStatus: pay, amountPaid: pay === "paid" ? total : pay === "partial" ? Math.round(total / 2) : 0,
  status, history: [{ status: "pending", at: iso(daysAgo) }, ...(status !== "pending" ? [{ status, at: iso(Math.max(0, daysAgo - 1)) }] : [])],
});
export const DEFAULT_ORDERS: Order[] = [
  mkOrder("NF-10421", 0, "Ayesha Khan", 124, "pending", "unpaid", "bank"),
  mkOrder("NF-10418", 1, "Bilal Ahmed", 174, "pending", "unpaid", "cod"),
  mkOrder("NF-10405", 3, "Sara Malik", 144, "review", "partial", "bank"),
  mkOrder("NF-10377", 6, "Usman Tariq", 189, "production", "paid", "bank"),
  mkOrder("NF-10350", 10, "Hina Raza", 134, "shipped", "unpaid", "cod"),
  mkOrder("NF-10311", 16, "Omar Farooq", 224, "delivered", "paid", "cod"),
  mkOrder("NF-10290", 22, "Zara Ali", 164, "delivered", "paid", "bank"),
];
export const DEFAULT_EXPENSES: Expense[] = [
  { id: "ex-1", title: "Neon flex roll (100 ft)", category: "Materials", amount: 120, date: iso(4).slice(0, 10) },
  { id: "ex-2", title: "Instagram ads", category: "Marketing", amount: 80, date: iso(9).slice(0, 10) },
  { id: "ex-3", title: "Workshop rent", category: "Rent", amount: 250, date: iso(15).slice(0, 10) },
];
export const DEFAULT_USERS: AdminUser[] = [{ id: "u-1", name: "Awais Ahmad", email: "owner@neonfitter.com", role: "owner", active: true }];
