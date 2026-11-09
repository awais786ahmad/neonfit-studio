export type FontCategory = "simple" | "bold" | "script" | "decorative";
export type Unit = "in" | "ft" | "m";

export interface NeonFont {
  id: string;
  name: string;
  family: string; // css font-family
  category: FontCategory;
  weight: number;
  extra: number;
  isNew?: boolean;
  src?: string; // data url for uploaded fonts
  active: boolean;
}
export interface NeonColor { id: string; name: string; hex: string; extra: number; active: boolean }
export interface BoardSize {
  id: string; name: string;
  landscape: { w: number; h: number };
  portrait: { w: number; h: number };
  price: number; active: boolean;
}
export interface NeonShape { id: string; name: string; paths: string[]; viewBox: [number, number]; extra: number; active: boolean }
export interface Backboard { id: string; name: string; kind: "rect" | "rounded" | "cut"; radius: number; extra: number; image?: string; active: boolean }
export interface Accessory { id: string; title: string; description: string; price: number; active: boolean }

export type MaterialType = "neon" | "backboard" | "adaptor" | "accessory" | "other";
export type MaterialUnit = "in" | "ft" | "m" | "sqin" | "sqft" | "sqm" | "piece";
export interface Material {
  id: string; name: string; type: MaterialType; unit: MaterialUnit;
  method: "length" | "area" | "piece"; cost: number; sale: number;
}

export interface DesignElement {
  id: string;
  type: "text" | "shape";
  text?: string;
  fontId?: string;
  shapeId?: string;
  colorId: string;
  x: number; // inches, center
  y: number;
  height: number; // inches (letter height or shape height)
  rotation: number;
}
export interface Design {
  elements: DesignElement[];
  sizeMode: "preset" | "custom";
  sizeId: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait";
  backboardId: string;
  accessoryIds: string[];
}

export interface Product {
  id: string;
  name: string;
  short: string;
  description: string;
  price: number;
  salePrice?: number;
  kind: "editor" | "static";
  design?: Design;
  images: string[];
  sizeIds: string[];
  backboardIds: string[];
  category: string;
  active: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface PriceLine { label: string; amount: number }
export interface CartItem {
  id: string;
  kind: "custom" | "ready" | "ready-customized";
  productId?: string;
  name: string;
  design?: Design;
  image?: string;
  options?: Record<string, string>;
  unitPrice: number;
  unitCost: number;
  qty: number;
  lines: PriceLine[];
  specs?: { boardW: number; boardH: number; neonIn: number; areaSqIn: number };
}

export type OrderStatus = "pending" | "review" | "production" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export interface Customer { name: string; email: string; phone: string; address: string; city: string; country: string; notes?: string }
export interface Order {
  id: string;
  createdAt: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  cost: number;
  paymentMethod: "cod" | "bank";
  bankId?: string;
  proof?: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  status: OrderStatus;
  cancelNote?: string;
  history: { status: OrderStatus; at: string; note?: string }[];
}
export interface ReturnReq { id: string; orderId: string; reason: string; amount: number; status: "requested" | "approved" | "rejected" | "refunded"; createdAt: string }
export interface Expense { id: string; title: string; category: string; amount: number; date: string }
export interface AdminUser { id: string; name: string; email: string; role: "owner" | "manager" | "production" | "support"; active: boolean }
export interface Quote { id: string; name: string; email: string; phone: string; description: string; width?: number; height?: number; image?: string; status: "new" | "quoted" | "closed"; createdAt: string }
export interface SavedDesign { id: string; name: string; design: Design; createdAt: string }
export interface BankAccount { id: string; bank: string; title: string; number: string; iban?: string }
export interface Settings {
  currency: string;
  shippingPrice: number;
  shippingDays: string;
  freeShippingOver: number;
  laborCost: number;
  laborPerFt: number;
  minHeights: Record<FontCategory, number>;
  defaultHeights: Record<FontCategory, number>;
  minShapeHeight: number;
  banks: BankAccount[];
}
