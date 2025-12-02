import { create } from "zustand";
import useSchemaStore from "./schemaStore";
import { ApiResponse } from "@services/api/SchemaService/SchemaService.types";

export type TableGenerateSettings = {
  name: string;
  query: string;
  examples: string;
};

export type GenerateState = {
  // Хранилище настроек для каждой таблицы
  tableSettings: Record<string, TableGenerateSettings>;

  loadSettingsFromApi: (apiResponse: ApiResponse) => void;
  // Методы
  getTableSettings: (tableId: string) => TableGenerateSettings;
  saveTableSettings: (tableId: string, settings: TableGenerateSettings) => void;
  removeTableSettings: (tableId: string) => void;
};

const mapApiResponseToGenerationState = (apiResponse: ApiResponse) => {
  const tableSettings: Record<string, TableGenerateSettings> = {};

  apiResponse.schema.tables.forEach((table) => {
    tableSettings[table.id] = {
      name: table.name ?? "",
      query: table.meta?.query ?? "",
      examples: table.meta?.examples ?? "",
    };
  });

  return { tableSettings };
};

const DEFAULT_SETTINGS: (tableId: string) => TableGenerateSettings = (
  tableId: string
) => ({
  name: useSchemaStore.getState().tables[tableId].name,
  query: "",
  examples: "",
});

const useGenerateStore = create<GenerateState>((set, get) => ({
  tableSettings: {},

  loadSettingsFromApi: (apiResponse) => {
    const { tableSettings } = mapApiResponseToGenerationState(apiResponse);

    set({
      tableSettings,
    });
  },

  getTableSettings: (tableId: string) => {
    const settings = get().tableSettings[tableId];
    // Если настроек нет - возвращаем дефолты
    return settings || { ...DEFAULT_SETTINGS(tableId) };
  },

  saveTableSettings: (tableId: string, settings: TableGenerateSettings) =>
    set((state) => ({
      tableSettings: {
        ...state.tableSettings,
        [tableId]: settings,
      },
    })),

  removeTableSettings: (tableId: string) =>
    set((state) => {
      const newSettings = { ...state.tableSettings };
      delete newSettings[tableId];
      return { tableSettings: newSettings };
    }),
}));

export default useGenerateStore;
