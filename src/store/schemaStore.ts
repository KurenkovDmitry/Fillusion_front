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

// import { create } from "zustand";

// export type SchemaField = {
//   id: string;
//   name: string;
//   type: string;
//   unique?: boolean;
//   autoIncrement?: boolean;
//   viaFaker?: boolean;
//   fakerType?: string;
//   locale?: "RU_RU" | "EN_US";
// };

// // Новый тип для схемы
// export type Schema = {
//   id: string;
//   name: string;
//   fields: SchemaField[];
// };

// interface SchemaState {
//   schemas: Schema[];
//   activeSchemaId: string | null;

//   // Методы для работы со схемами
//   addSchema: (name?: string) => void;
//   removeSchema: (schemaId: string) => void;
//   updateSchemaName: (schemaId: string, name: string) => void;
//   setActiveSchema: (schemaId: string) => void;
//   getActiveSchema: () => Schema | undefined;

//   // Методы для работы с полями в конкретной схеме
//   addField: (schemaId: string, partial?: Partial<SchemaField>) => void;
//   updateField: (schemaId: string, fieldId: string, updates: Partial<SchemaField>) => void;
//   removeField: (schemaId: string, fieldId: string, callback: (arg0: string) => void) => void;
//   reorderFields: (schemaId: string, sourceIdx: number, destIdx: number) => void;
//   removeFieldProperties: (schemaId: string, fieldId: string, keys: (keyof SchemaField)[]) => void;

//   // Утилиты
//   reset: () => void;
// }

// const defaultField = (): SchemaField => ({
//   id: `field-${Date.now()}`,
//   name: "",
//   type: "string",
// });

// const defaultSchema = (name: string = "Новая схема"): Schema => ({
//   id: `schema-${Date.now()}`,
//   name,
//   fields: [defaultField()],
// });

// const useSchemaStore = create<SchemaState>((set, get) => ({
//   schemas: [defaultSchema("Схема 1")],
//   activeSchemaId: null,

//   // Работа со схемами
//   addSchema: (name = "Новая схема") =>
//     set((state) => {
//       const newSchema = defaultSchema(name);
//       return {
//         schemas: [...state.schemas, newSchema],
//         activeSchemaId: newSchema.id,
//       };
//     }),

//   removeSchema: (schemaId) =>
//     set((state) => {
//       if (state.schemas.length <= 1) {
//         return state; // Не удаляем последнюю схему
//       }
//       const newSchemas = state.schemas.filter((s) => s.id !== schemaId);
//       return {
//         schemas: newSchemas,
//         activeSchemaId:
//           state.activeSchemaId === schemaId
//             ? newSchemas[0]?.id || null
//             : state.activeSchemaId,
//       };
//     }),

//   updateSchemaName: (schemaId, name) =>
//     set((state) => ({
//       schemas: state.schemas.map((s) =>
//         s.id === schemaId ? { ...s, name } : s
//       ),
//     })),

//   setActiveSchema: (schemaId) =>
//     set({ activeSchemaId: schemaId }),

//   getActiveSchema: () => {
//     const state = get();
//     return state.schemas.find((s) => s.id === state.activeSchemaId);
//   },

//   // Работа с полями
//   addField: (schemaId, partial = {}) =>
//     set((state) => ({
//       schemas: state.schemas.map((schema) =>
//         schema.id === schemaId
//           ? {
//               ...schema,
//               fields: [
//                 ...schema.fields,
//                 {
//                   ...defaultField(),
//                   ...partial,
//                 },
//               ],
//             }
//           : schema
//       ),
//     })),

//   updateField: (schemaId, fieldId, updates) =>
//     set((state) => ({
//       schemas: state.schemas.map((schema) =>
//         schema.id === schemaId
//           ? {
//               ...schema,
//               fields: schema.fields.map((f) =>
//                 f.id === fieldId ? { ...f, ...updates } : f
//               ),
//             }
//           : schema
//       ),
//     })),

//   removeField: (schemaId, fieldId, callback) =>
//     set((state) => {
//       const schema = state.schemas.find((s) => s.id === schemaId);
//       if (!schema) return state;

//       if (schema.fields.length <= 1) {
//         callback("(Не может быть меньше одного поля)");
//         return state;
//       }

//       return {
//         schemas: state.schemas.map((s) =>
//           s.id === schemaId
//             ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
//             : s
//         ),
//       };
//     }),

//   reorderFields: (schemaId, sourceIdx, destIdx) =>
//     set((state) => ({
//       schemas: state.schemas.map((schema) => {
//         if (schema.id !== schemaId) return schema;

//         const items = Array.from(schema.fields);
//         const [moved] = items.splice(sourceIdx, 1);
//         items.splice(destIdx, 0, moved);
//         return { ...schema, fields: items };
//       }),
//     })),

//   removeFieldProperties: (schemaId, fieldId, keys) =>
//     set((state) => ({
//       schemas: state.schemas.map((schema) => {
//         if (schema.id !== schemaId) return schema;

//         return {
//           ...schema,
//           fields: schema.fields.map((f) => {
//             if (f.id !== fieldId) return f;

//             const updated = { ...f };
//             keys.forEach((key) => {
//               delete updated[key];
//             });
//             return updated;
//           }),
//         };
//       }),
//     })),

//   reset: () =>
//     set({
//       schemas: [defaultSchema("Схема 1")],
//       activeSchemaId: null,
//     }),
// }));

// export default useSchemaStore;
