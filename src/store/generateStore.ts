import { create } from "zustand";
import useSchemaStore from "./schemaStore";

export type TableGenerateSettings = {
  name: string;
  query: string;
  totalRecords: number;
  examples: string;
  selectModelValue: string;
  selectOutputValue: string;
};

export type GenerateState = {
  // Хранилище настроек для каждой таблицы
  tableSettings: Record<string, TableGenerateSettings>;

  // Методы
  getTableSettings: (tableId: string) => TableGenerateSettings;
  saveTableSettings: (tableId: string, settings: TableGenerateSettings) => void;
  removeTableSettings: (tableId: string) => void;
};

const DEFAULT_SETTINGS: (tableId: string) => TableGenerateSettings = (
  tableId: string
) => ({
  name: useSchemaStore.getState().tables[tableId].name,
  query: "",
  totalRecords: 50,
  examples: "",
  selectModelValue: "deepseek",
  selectOutputValue: "EXPORT_TYPE_JSON",
});

const useGenerateStore = create<GenerateState>((set, get) => ({
  tableSettings: {},

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
