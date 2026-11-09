import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as D from "./defaults";
import type * as T from "./types";
import type { Catalog } from "./engine";

type Collections = {
  fonts: T.NeonFont; colors: T.NeonColor; sizes: T.BoardSize; shapes: T.NeonShape; backboards: T.Backboard;
  accessories: T.Accessory; materials: T.Material; products: T.Product; orders: T.Order; returns: T.ReturnReq;
  expenses: T.Expense; users: T.AdminUser; quotes: T.Quote; savedDesigns: T.SavedDesign; cart: T.CartItem;
};
type CollKey = keyof Collections;

type DB = { [K in CollKey]: Collections[K][] } & {
  settings: T.Settings;
  hydrated: boolean;
  upsert: <K extends CollKey>(k: K, item: Collections[K]) => void;
  remove: <K extends CollKey>(k: K, id: string) => void;
  setSettings: (s: Partial<T.Settings>) => void;
  clearCart: () => void;
  resetAll: () => void;
};

const initial = () => ({
  fonts: D.DEFAULT_FONTS, colors: D.DEFAULT_COLORS, sizes: D.DEFAULT_SIZES, shapes: D.DEFAULT_SHAPES,
  backboards: D.DEFAULT_BACKBOARDS, accessories: D.DEFAULT_ACCESSORIES, materials: D.DEFAULT_MATERIALS,
  products: D.DEFAULT_PRODUCTS, orders: D.DEFAULT_ORDERS, returns: [] as T.ReturnReq[], expenses: D.DEFAULT_EXPENSES,
  users: D.DEFAULT_USERS, quotes: [] as T.Quote[], savedDesigns: [] as T.SavedDesign[], cart: [] as T.CartItem[],
  settings: D.DEFAULT_SETTINGS,
});

export const useDB = create<DB>()(
  persist(
    (set) => ({
      ...initial(),
      hydrated: false,
      upsert: (k, item) =>
        set((s) => {
          const list = s[k] as { id: string }[];
          const exists = list.some((x) => x.id === (item as { id: string }).id);
          return { [k]: exists ? list.map((x) => (x.id === (item as { id: string }).id ? item : x)) : [item, ...list] } as Partial<DB>;
        }),
      remove: (k, id) => set((s) => ({ [k]: (s[k] as { id: string }[]).filter((x) => x.id !== id) }) as Partial<DB>),
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      clearCart: () => set({ cart: [] }),
      resetAll: () => set({ ...initial() }),
    }),
    {
      name: "neonfitter-db-v1",
      skipHydration: true,
      partialize: ({ hydrated: _h, upsert: _u, remove: _r, setSettings: _s, clearCart: _c, resetAll: _a, ...rest }) => rest,
      onRehydrateStorage: () => () => useDB.setState({ hydrated: true }),
    },
  ),
);

export function useCatalog(): Catalog {
  const fonts = useDB((s) => s.fonts);
  const colors = useDB((s) => s.colors);
  const sizes = useDB((s) => s.sizes);
  const shapes = useDB((s) => s.shapes);
  const backboards = useDB((s) => s.backboards);
  const accessories = useDB((s) => s.accessories);
  const materials = useDB((s) => s.materials);
  const settings = useDB((s) => s.settings);
  return { fonts, colors, sizes, shapes, backboards, accessories, materials, settings };
}

export const STATUS_LABEL: Record<T.OrderStatus, string> = {
  pending: "Pending", review: "Under Review", production: "In Production", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};
