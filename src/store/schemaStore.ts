import { create } from "zustand";

export type SchemaField = {
  id: string;
  name: string;
  type: string;
  unique?: boolean;
  autoIncrement?: boolean;
  viaFaker?: boolean;
  fakerType?: string;
  locale?: "RU_RU" | "EN_US";
};

interface SchemaState {
  schema: SchemaField[];
  setSchema: (s: SchemaField[]) => void;
  addField: (partial?: Partial<SchemaField>) => void;
  updateField: (id: string, updates: Partial<SchemaField>) => void;
  removeField: (id: string, callback: (arg0: string) => void) => void;
  reorderFields: (sourceIdx: number, destIdx: number) => void;
  reset: () => void;
  removeFieldProperties: (id: string, keys: (keyof SchemaField)[]) => void;
}

const defaultField = (): SchemaField => ({
  id: `field-${Date.now()}`,
  name: "",
  type: "string",
});

const useSchemaStore = create<SchemaState>((set, get) => ({
  schema: [defaultField()],

  setSchema: (s) => set({ schema: s }),

  addField: (partial = {}) =>
    set((state) => ({
      schema: [
        ...state.schema,
        {
          ...defaultField(),
          ...partial,
        },
      ],
    })),

  updateField: (id, updates) =>
    set((state) => ({
      schema: state.schema.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  removeField: (id, callback) =>
    set((state) => {
      if (state.schema.length <= 1) {
        callback("(Не может быть меньше одного поля)");
        return state;
      }
      return { schema: state.schema.filter((f) => f.id !== id) };
    }),

  reorderFields: (sourceIdx, destIdx) =>
    set((state) => {
      const items = Array.from(state.schema);
      const [moved] = items.splice(sourceIdx, 1);
      items.splice(destIdx, 0, moved);
      return { schema: items };
    }),

  reset: () => set({ schema: [defaultField()] }),

  removeFieldProperties: (id, keys) =>
    set((state) => ({
      schema: state.schema.map((f) => {
        if (f.id !== id) return f;

        const updated = { ...f };
        keys.forEach((key) => {
          delete updated[key];
        });
        return updated;
      }),
    })),
}));

export default useSchemaStore;
