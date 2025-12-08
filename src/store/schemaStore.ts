import { create } from "zustand";

export type SchemaField = {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  position?: number;
  unique?: boolean;
  autoIncrement?: boolean;
  viaFaker?: boolean;
  fakerType?: string;
  locale?: "LOCALE_RU_RU" | "LOCALE_EN_US";
};

export type TableSchema = {
  id: string;
  name: string;
  meta?: any;
  layout: {
    x: number;
    y: number;
  };
  fields: SchemaField[];
};

export type RelationType =
  | "one-to-one"
  | "one-to-many"
  | "many-to-many"
  | "many-to-one";

export type Relation = {
  id: string;
  fromTable: string;
  toTable: string;
  fromField: string;
  toField: string;
  type: RelationType;
  fromHandle: "left" | "right"; // Какой Handle у исходящей связи
  toHandle: "left" | "right"; // Какой Handle у входящей связи
};

// Типы для API response
type ApiField = {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
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
  x: number;
  y: number;
  fields: ApiField[];
};

type ApiRelation = {
  id: string;
  fromTable: string;
  toTable: string;
  fromField: string;
  toField: string;
  type: string;
  fromHandle: "left" | "right"; // Какой Handle у исходящей связи
  toHandle: "left" | "right";
};

type ApiResponse = {
  schema: { tables: ApiTable[]; relations: ApiRelation[] };
};

type Schema = {
  tables: Record<string, TableSchema>;
  relations: Record<string, Relation>;
};

interface SchemaState {
  isEditingRelations: boolean;
  setIsEditingRelations: (value: boolean) => void;
  tables: Record<string, TableSchema>; // Все таблицы по ID
  relations: Record<string, Relation>; // Все связи по ID
  currentTableId: string | null; // Текущая активная таблица

  // Загрузка данных из API
  loadFromApi: (apiResponse: ApiResponse) => void;
  getSchema: () => Schema;

  // Работа с таблицами
  setCurrentTable: (tableId: string) => void;
  addTable: (table: ApiTable) => string;
  removeTable: (tableId: string) => void;
  updateTable: (tableId: string, updates: Partial<TableSchema>) => void;
  updateTablePosition: (tableId: string, x: number, y: number) => void;

  // Работа с полями
  addField: (tableId: string, field: Omit<SchemaField, "id">) => void;
  updateField: (
    tableId: string,
    fieldId: string,
    updates: Partial<SchemaField>
  ) => void;
  removeField: (
    tableId: string,
    fieldId: string,
    callback?: () => void
  ) => void;
  reorderFields: (tableId: string, sourceIdx: number, destIdx: number) => void;
  removeFieldProperties: (
    tableId: string,
    fieldId: string,
    keys: (keyof SchemaField)[]
  ) => void;

  // Работа со связями
  addRelation: (relation: Relation) => string;
  updateRelation: (relationId: string, updates: Partial<Relation>) => void;
  removeRelation: (relationId: string) => void;
  getRelationsByTable: (tableId: string) => Relation[];

  // Утилиты
  getCurrentTable: () => TableSchema | null;
  getAllTables: () => TableSchema[];
  getAllRelations: () => Relation[];
  reset: () => void;
  getFieldKeyType: (
    tableId: string,
    fieldId: string
  ) => "regular" | "primary" | "foreign";
  getReferencedInfo: (
    tableId: string,
    fieldId: string
  ) => {
    referencedTableId: string;
    referencedFieldId: string;
  } | null;
  isFieldForeignKey: (tableId: string, fieldId: string) => boolean;
}

// Маппер из API формата в формат store
const mapApiFieldToSchemaField = (apiField: ApiField): SchemaField => {
  const field: SchemaField = {
    id: apiField.id,
    name: apiField.name,
    type: apiField.type === "string" ? "text" : apiField.type,
    isPrimaryKey: apiField.isPrimaryKey,
    isForeignKey: apiField.isForeignKey,
  };

  if (apiField.generation) {
    if (apiField.generation.uniqueValues) field.unique = true;
    if (apiField.generation.autoIncrement) field.autoIncrement = true;
    if (apiField.generation.viaFaker) field.viaFaker = true;
    if (apiField.generation.fakerType)
      field.fakerType = apiField.generation.fakerType;
    if (apiField.generation.fakerLocale) {
      field.locale =
        apiField.generation.fakerLocale === "ru_RU"
          ? "LOCALE_RU_RU"
          : "LOCALE_EN_US";
    }
  }

  return field;
};

const mapApiResponseToState = (
  apiResponse: ApiResponse
): {
  tables: Record<string, TableSchema>;
  relations: Record<string, Relation>;
} => {
  const tables: Record<string, TableSchema> = {};
  const relations: Record<string, Relation> = {};

  apiResponse.schema.tables.forEach((apiTable) => {
    tables[apiTable.id] = {
      id: apiTable.id,
      name: apiTable.name,
      layout: {
        x: apiTable.x,
        y: apiTable.y,
      },
      fields: apiTable.fields.map(mapApiFieldToSchemaField),
    };
  });

  apiResponse.schema.relations.forEach((apiRelation) => {
    relations[apiRelation.id] = {
      id: apiRelation.id,
      fromTable: apiRelation.fromTable,
      toTable: apiRelation.toTable,
      fromField: apiRelation.fromField,
      toField: apiRelation.toField,
      type: apiRelation.type as RelationType,
      fromHandle: apiRelation.fromHandle,
      toHandle: apiRelation.toHandle,
    };
  });

  return { tables, relations };
};

export const mapTableToApiPayload = (table: TableSchema) => ({
  ...table,
  fields: table.fields.map((f) => ({
    ...f,
    generation: {
      viaFaker: f.viaFaker,
      fakerType: f.fakerType,
      fakerLocale: f.locale,
      uniqueValues: f.unique,
      autoIncrement: f.autoIncrement,
    },
  })),
});

const useSchemaStore = create<SchemaState>((set, get) => ({
  isEditingRelations: false,
  setIsEditingRelations: (value) => set({ isEditingRelations: value }),
  tables: {},
  relations: {},
  currentTableId: null,

  getSchema: () => {
    const { tables, relations } = get();
    return { tables, relations };
  },

  // Загрузка из API
  loadFromApi: (apiResponse) => {
    const { tables, relations } = mapApiResponseToState(apiResponse);
    const firstTableId = Object.keys(tables)[0] || null;

    set({
      tables,
      relations,
      currentTableId: firstTableId,
    });
  },

  // Работа с таблицами
  setCurrentTable: (tableId) => set({ currentTableId: tableId }),

  addTable: (table) => {
    const id = table.id;
    set((state) => ({
      tables: {
        ...state.tables,
        [id]: {
          id: id,
          name: table.name,
          layout: {
            x: table.x,
            y: table.y,
          },
          fields: table.fields,
        },
      },
      currentTableId: id,
    }));

    return id;
  },

  removeTable: (tableId) =>
    set((state) => {
      const { [tableId]: removed, ...restTables } = state.tables;

      // Находим все связи, связанные с этой таблицей
      const relationsToRemove = Object.values(state.relations).filter(
        (rel) => rel.fromTable === tableId || rel.toTable === tableId
      );

      // Сбрасываем FK поля в обычные для всех затронутых связей
      const updatedTables = { ...restTables };

      relationsToRemove.forEach((relation) => {
        // Если удаляемая таблица содержит PK (fromTable)
        if (relation.fromTable === tableId && updatedTables[relation.toTable]) {
          // Сбрасываем FK поле в другой таблице
          updatedTables[relation.toTable] = {
            ...updatedTables[relation.toTable],
            fields: updatedTables[relation.toTable].fields.map((field) =>
              field.id === relation.toField
                ? {
                    ...field,
                    isForeignKey: false,
                    isPrimaryKey: false,
                  }
                : field
            ),
          };
        }
      });

      // Удаляем все связи, связанные с этой таблицей
      const restRelations = Object.fromEntries(
        Object.entries(state.relations).filter(
          ([_, rel]) => rel.fromTable !== tableId && rel.toTable !== tableId
        )
      );

      const newCurrentId =
        state.currentTableId === tableId
          ? Object.keys(updatedTables)[0] || null
          : state.currentTableId;

      return {
        tables: updatedTables,
        relations: restRelations,
        currentTableId: newCurrentId,
      };
    }),

  updateTable: (tableId, updates) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            ...updates,
          },
        },
      };
    }),

  updateTablePosition: (tableId, x, y) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            layout: {
              x,
              y,
            },
          },
        },
      };
    }),

  // Работа с полями
  addField: (tableId, field) =>
    set((state) => {
      const table = state.tables[tableId];
      if (!table) return state;

      const id = `field-${Date.now()}-${Math.random()}`;
      const newField: SchemaField = { ...field, id };

      return {
        tables: {
          ...state.tables,
          [tableId]: {
            ...table,
            fields: [...table.fields, newField],
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
        if (callback) {
          callback();
        }
        return state; // Не удаляем последнее поле
      }

      // Находим связи связанные с этим полем
      const relationsToRemove = Object.values(state.relations).filter(
        (rel) =>
          (rel.fromTable === tableId && rel.fromField === fieldId) ||
          (rel.toTable === tableId && rel.toField === fieldId)
      );

      // Сбрасываем FK/PK поля в других таблицах
      const updatedTables = { ...state.tables };

      relationsToRemove.forEach((relation) => {
        // Если удаляемое поле - PK (fromField)
        if (relation.fromTable === tableId && relation.fromField === fieldId) {
          // Сбрасываем FK поле в связанной таблице
          if (updatedTables[relation.toTable]) {
            updatedTables[relation.toTable] = {
              ...updatedTables[relation.toTable],
              fields: updatedTables[relation.toTable].fields.map((field) =>
                field.id === relation.toField
                  ? {
                      ...field,
                      isForeignKey: false,
                      isPrimaryKey: false,
                    }
                  : field
              ),
            };
          }
        }
      });

      // Удаляем связи
      const restRelations = Object.fromEntries(
        Object.entries(state.relations).filter(
          ([_, rel]) =>
            !(rel.fromTable === tableId && rel.fromField === fieldId) &&
            !(rel.toTable === tableId && rel.toField === fieldId)
        )
      );

      return {
        tables: {
          ...updatedTables,
          [tableId]: {
            ...table,
            fields: table.fields.filter((f) => f.id !== fieldId),
          },
        },
        relations: restRelations,
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

  // Работа со связями
  addRelation: (relation) => {
    const id = relation.id;
    const newRelation: Relation = { ...relation, id };

    set((state) => ({
      relations: {
        ...state.relations,
        [id]: newRelation,
      },
    }));

    return id;
  },

  updateRelation: (relationId, updates) =>
    set((state) => {
      const relation = state.relations[relationId];
      if (!relation) return state;

      return {
        relations: {
          ...state.relations,
          [relationId]: {
            ...relation,
            ...updates,
          },
        },
      };
    }),

  removeRelation: (relationId) =>
    set((state) => {
      const relation = state.relations[relationId];
      if (!relation) return state;

      const { [relationId]: removed, ...restRelations } = state.relations;

      const updatedTables = { ...state.tables };

      if (updatedTables[relation.toTable]) {
        updatedTables[relation.toTable] = {
          ...updatedTables[relation.toTable],
          fields: updatedTables[relation.toTable].fields.map((field) =>
            field.id === relation.toField
              ? {
                  ...field,
                  isForeignKey: false,
                  isPrimaryKey: false,
                }
              : field
          ),
        };
      }

      return {
        relations: restRelations,
        tables: updatedTables,
      };
    }),

  getRelationsByTable: (tableId) => {
    const { relations } = get();
    return Object.values(relations).filter(
      (rel) => rel.fromTable === tableId || rel.toTable === tableId
    );
  },

  // Утилиты
  getCurrentTable: () => {
    const { tables, currentTableId } = get();
    return currentTableId ? tables[currentTableId] || null : null;
  },

  getAllTables: () => {
    return Object.values(get().tables);
  },

  getAllRelations: () => {
    return Object.values(get().relations);
  },

  reset: () => {
    set({
      tables: {},
      relations: {},
      currentTableId: null,
    });
  },

  getFieldKeyType: (tableId, fieldId) => {
    const state = get();
    const field = state.tables[tableId]?.fields.find((f) => f.id === fieldId);

    if (field?.isPrimaryKey) return "primary";

    const hasRelation = Object.values(state.relations).some(
      (relation) => relation.toTable === tableId && relation.toField === fieldId
    );

    return hasRelation ? "foreign" : "regular";
  },

  getReferencedInfo: (tableId, fieldId) => {
    const state = get();

    const relation = Object.values(state.relations).find(
      (relation) => relation.toTable === tableId && relation.toField === fieldId
    );

    if (!relation) return null;

    return {
      referencedTableId: relation.fromTable,
      referencedFieldId: relation.fromField,
    };
  },

  isFieldForeignKey: (tableId, fieldId) => {
    const state = get();
    return Object.values(state.relations).some(
      (relation) => relation.toTable === tableId && relation.toField === fieldId
    );
  },
}));

export default useSchemaStore;
