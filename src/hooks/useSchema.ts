// hooks/useSchema.ts
import { useCallback, useEffect, useState } from "react";
import { SchemaService } from "@services/api/SchemaService/SchemaService";
import useSchemaStore, { TableSchema, Relation } from "../store/schemaStore";

export const useSchema = (projectId: string) => {
  const store = useSchemaStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Загрузка схемы
  const fetchSchema = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SchemaService.getSchema(projectId);
      store.loadFromApi(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch schema:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Создание таблицы
  const createTable = useCallback(
    async (table: Omit<TableSchema, "id">) => {
      try {
        const tableObject = { table: table };
        const response = await SchemaService.createTable(
          projectId,
          tableObject
        );
        const newTable = response.table;

        // Добавляем в store с реальным ID от сервера
        const tableWithId: TableSchema = {
          ...table,
          id: newTable.id,
        };

        store.addTable(tableWithId);
        return tableWithId;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [projectId, store]
  );

  // Обновление таблицы
  const updateTable = useCallback(
    async (tableId: string, updates: Partial<TableSchema>) => {
      // Оптимистичное обновление
      store.updateTable(tableId, updates);

      try {
        await SchemaService.updateTable(projectId, tableId, updates);
      } catch (err) {
        // Откат при ошибке
        setError(err as Error);
        fetchSchema(); // Перезагружаем с сервера
        throw err;
      }
    },
    [projectId, store, fetchSchema]
  );

  // Удаление таблицы
  const deleteTable = useCallback(
    async (tableId: string) => {
      try {
        await SchemaService.deleteTable(projectId, tableId);
        store.removeTable(tableId);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [projectId, store]
  );

  // Создание связи
  const createRelation = useCallback(
    async (relation: Omit<Relation, "id">) => {
      try {
        const response = await SchemaService.createRelation(
          projectId,
          relation
        );
        store.addRelation({ ...relation, id: response.relation.id });
        return response.relation;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [projectId, store]
  );

  // Загрузка при монтировании
  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  return {
    // Данные из store
    tables: store.tables,
    relations: store.relations,

    // Состояние загрузки
    loading,
    error,

    // Методы
    refetch: fetchSchema,
    createTable,
    updateTable,
    deleteTable,
    createRelation,
  };
};
