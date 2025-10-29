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

export type TableSchema = {
  id: string;
  name: string;
  fields: SchemaField[];
};

// Типы для API response
type ApiField = {
  id: string;
  name: string;
  type: string;
  generation?: {
    uniqueValues?: boolean;
    autoIncrement?: boolean;
    viaFaker?: boolean;
    fakerType?: string;
    fakerLocale?: string;
  };
};

type ApiTable = {
  id: string;
  name: string;
  fields: ApiField[];
};

type ApiResponse = {
  schema: {
    tables: ApiTable[];
    relations: any[];
  };
};

interface SchemaState {
  tables: Record<string, TableSchema>; // Все таблицы по ID
  currentTableId: string | null; // Текущая активная таблица

  // Загрузка данных из API
  loadFromApi: (apiResponse: ApiResponse) => void;

  // Работа с таблицами
  setCurrentTable: (tableId: string) => void;
  addTable: (name?: string) => string;
  removeTable: (tableId: string) => void;
  updateTableName: (tableId: string, name: string) => void;

  // Работа с полями текущей таблицы
  addField: (tableId: string, partial?: Partial<SchemaField>) => void;
  updateField: (
    tableId: string,
    fieldId: string,
    updates: Partial<SchemaField>
  ) => void;
  removeField: (
    tableId: string,
    fieldId: string,
    callback: (arg0: string) => void
  ) => void;
  reorderFields: (tableId: string, sourceIdx: number, destIdx: number) => void;
  removeFieldProperties: (
    tableId: string,
    fieldId: string,
    keys: (keyof SchemaField)[]
  ) => void;

  // Утилиты
  getCurrentTable: () => TableSchema | null;
  reset: () => void;
}

const defaultField = (): SchemaField => ({
  id: `field-${Date.now()}-${Math.random()}`,
  name: "",
  type: "string",
});

const createDefaultTable = (name: string = "New Table"): TableSchema => ({
  id: `table-${Date.now()}-${Math.random()}`,
  name,
  fields: [defaultField()],
});

// Маппер из API формата в формат store
const mapApiFieldToSchemaField = (apiField: ApiField): SchemaField => {
  const field: SchemaField = {
    id: apiField.id,
    name: apiField.name,
    type: apiField.type,
  };

  if (apiField.generation) {
    if (apiField.generation.uniqueValues) field.unique = true;
    if (apiField.generation.autoIncrement) field.autoIncrement = true;
    if (apiField.generation.viaFaker) field.viaFaker = true;
    if (apiField.generation.fakerType)
      field.fakerType = apiField.generation.fakerType;
    if (apiField.generation.fakerLocale) {
      field.locale =
        apiField.generation.fakerLocale === "ru_RU" ? "RU_RU" : "EN_US";
    }
  }

  return field;
};

const mapApiResponseToTables = (
  apiResponse: ApiResponse
): Record<string, TableSchema> => {
  const tables: Record<string, TableSchema> = {};

  apiResponse.schema.tables.forEach((apiTable) => {
    tables[apiTable.id] = {
      id: apiTable.id,
      name: apiTable.name,
      fields: apiTable.fields.map(mapApiFieldToSchemaField),
    };
  });

  return tables;
};

const useSchemaStore = create<SchemaState>((set, get) => ({
  tables: {},
  currentTableId: null,

  // Загрузка из API
  loadFromApi: (apiResponse) => {
    const tables = mapApiResponseToTables(apiResponse);
    const firstTableId = Object.keys(tables)[0] || null;

    set({
      tables,
      currentTableId: firstTableId,
    });
  },

  // Работа с таблицами
  setCurrentTable: (tableId) => set({ currentTableId: tableId }),

  addTable: (name) => {
    const newTable = createDefaultTable(name);
    set((state) => ({
      tables: {
        ...state.tables,
        [newTable.id]: newTable,
      },
      currentTableId: newTable.id,
    }));
    return newTable.id;
  },

  removeTable: (tableId) =>
    set((state) => {
      const { [tableId]: removed, ...rest } = state.tables;
      const newCurrentId =
        state.currentTableId === tableId
          ? Object.keys(rest)[0] || null
          : state.currentTableId;

      return {
        tables: rest,
        currentTableId: newCurrentId,
      };
    }),

  updateTableName: (tableId, name) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...state.tables[tableId],
          name,
        },
      },
    })),

  // Работа с полями
  addField: (tableId, partial = {}) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            fields: [
              ...table.fields,
              {
                ...defaultField(),
                ...partial,
              },
            ],
          },
        },
      };
    }),

  updateField: (tableId, fieldId, updates) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            fields: table.fields.map((f) =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          },
        },
      };
    }),

  removeField: (tableId, fieldId, callback) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      if (table.fields.length <= 1) {
        callback("(Не может быть меньше одного поля)");
        return state;
      }

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            fields: table.fields.filter((f) => f.id !== fieldId),
          },
        },
      };
    }),

  reorderFields: (tableId, sourceIdx, destIdx) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      const items = Array.from(table.fields);
      const [moved] = items.splice(sourceIdx, 1);
      items.splice(destIdx, 0, moved);

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            fields: items,
          },
        },
      };
    }),

  removeFieldProperties: (tableId, fieldId, keys) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            fields: table.fields.map((f) => {
              if (f.id !== fieldId) return f;

              const updated = { ...f };
              keys.forEach((key) => {
                delete updated[key];
              });
              return updated;
            }),
          },
        },
      };
    }),

  // Утилиты
  getCurrentTable: () => {
    const { tables, currentTableId } = get();
    return currentTableId ? tables[currentTableId] || null : null;
  },

  reset: () => {
    const defaultTable = createDefaultTable();
    set({
      tables: { [defaultTable.id]: defaultTable },
      currentTableId: defaultTable.id,
    });
  },
}));

export default useSchemaStore;
