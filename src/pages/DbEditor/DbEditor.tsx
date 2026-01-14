import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Connection,
  BackgroundVariant,
  ReactFlowInstance,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SelectField } from "../Generate/components/SelectField";
import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { Button, IconButton, Tooltip, Snackbar } from "@mui/material";
import { AdditionalSettings } from "../Generate/components/AdditionalSettings";
import { SchemaService } from "@services/api/SchemaService/SchemaService";
import { useNavigate, useParams } from "react-router-dom";
import useSchemaStore, {
  TableSchema,
  SchemaField,
  Relation,
  mapTableToApiPayload,
} from "@store/schemaStore";
import useGenerateStore from "@store/generateStore";
import { Generate } from "../Generate";
import { useShallow } from "zustand/shallow";
import { DeleteDialog } from "./components/DeleteDialog";
import { RelationDialog } from "./components/RelationDialog";
import CodeIcon from "@mui/icons-material/Code";
import { getLabelByValue } from "../Generate/components/constants/constants";
import { GenerateDialog } from "./components/GenerateDialog";
import { PkSettings } from "../Generate/components/PkSettings";
import { AnimatePresence, motion } from "framer-motion";
import { typeOptions, PKTypeOptions } from "@shared/constants";
import SelfLoopEdge from "./components/SelfLoopEdge";
import { ImportSchemaDialog } from "./components/ImportSchemaDialog";
import { PhoneDialog } from "./components/PhoneDialog";

const MAX_FIELDS = 10;
const MAX_TABLE_NAME_LENGTH = 50;

interface TableNodeData {
  id: string;
  [key: string]: string;
}
const edgeTypes = {
  selfLoop: SelfLoopEdge,
};

export type DatabaseTableNodeType = Node<TableNodeData, "databaseTable">;

interface StoreNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    id: string;
  };
}

export const getTableLayoutPayload = (currentTable: TableSchema) => {
  return {
    x: Math.round(currentTable.layout.x),
    y: Math.round(currentTable.layout.y),
  };
};

// Типизированная debounce функция с cancel
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return debounced as ((...args: Parameters<T>) => void) & {
    cancel: () => void;
  };
}

// Парсер Handle ID
const parseHandleId = (handleId: string) => {
  if (handleId.endsWith("-left")) {
    return {
      fieldId: handleId.replace("-left", ""),
      direction: "left" as const,
    };
  } else if (handleId.endsWith("-right")) {
    return {
      fieldId: handleId.replace("-right", ""),
      direction: "right" as const,
    };
  }
  return { fieldId: handleId, direction: "unknown" as const };
};

const getFieldName = (table: TableSchema) =>
  table.fields.some((f) => f.name === `field_${table.fields.length + 1}`)
    ? `field_${table.fields.length + 2}`
    : `field_${table.fields.length + 1}`;

const DatabaseTableNode = (props: NodeProps<DatabaseTableNodeType>) => {
  const { projectId } = useParams();

  const table: TableSchema = useSchemaStore(
    useShallow((state) => state.tables[props.id])
  );
  const updateTable = useSchemaStore((state) => state.updateTable);
  const updateField = useSchemaStore((state) => state.updateField);
  const removeField = useSchemaStore((state) => state.removeField);
  const getCurrentTable = useSchemaStore((state) => state.getCurrentTable);
  const setCurrentTable = useSchemaStore((state) => state.setCurrentTable);
  const allRelations = useSchemaStore((state) => state.getAllRelations);
  const isEditingRelations = useSchemaStore(
    (state) => state.isEditingRelations
  );

  const id = props.id;

  const [isEditingName, setIsEditingName] = useState(false);
  const [tableName, setTableName] = useState(table?.name || "");
  const [tableNameError, setTableNameError] = useState(false);
  const [open, setOpen] = useState(false);

  const [localFieldValues, setLocalFieldValues] = useState<
    Record<string, string>
  >({});

  // Отслеживаем активные input элементы
  const activeInputs = useRef<Set<string>>(new Set());
  // Предыдущие значения полей для сравнения
  const previousFieldValues = useRef<Record<string, string>>({});

  // Инициализация при монтировании
  useEffect(() => {
    if (table) {
      const values: Record<string, string> = {};
      table.fields.forEach((field) => {
        values[field.id] = field.name;
      });
      setLocalFieldValues(values);
      previousFieldValues.current = values;
    }
  }, [table]); // Только при смене таблицы

  // Синхронизация только новых полей или изменений извне
  useEffect(() => {
    if (!table) return;

    setTableName(table.name);

    const values: Record<string, string> = {};
    let hasChanges = false;

    table.fields.forEach((field) => {
      // Если input активен - используем локальное значение
      if (activeInputs.current.has(field.id)) {
        values[field.id] = localFieldValues[field.id] ?? field.name;
      } else {
        // Обновляем только если значение изменилось в store
        const previousValue = previousFieldValues.current[field.id];
        if (previousValue !== field.name) {
          values[field.id] = field.name;
          hasChanges = true;
        } else {
          values[field.id] = localFieldValues[field.id] ?? field.name;
        }
      }
    });

    if (hasChanges) {
      setLocalFieldValues(values);
      previousFieldValues.current = values;
    }
  }, [table?.fields, table?.name]); // Реагируем на изменения полей и имени

  const debouncedUpdateField = useRef(
    debounce(
      (tableId: string, fieldId: string, updates: Partial<SchemaField>) => {
        updateField(tableId, fieldId, updates);
      },
      300
    )
  ).current;

  const saveTableToServer = async (tableId: string) => {
    setCurrentTable(tableId);
    const currentTable = getCurrentTable();
    if (!currentTable || !projectId) return;

    const updatedTable = {
      ...currentTable,
      layout: getTableLayoutPayload(currentTable),
    };

    try {
      await SchemaService.updateTable(
        projectId,
        tableId,
        mapTableToApiPayload(updatedTable)
      );
    } catch (err) {
      console.error("Failed to save table:", err);
    }
  };

  const debouncedSaveToServer = useRef(
    debounce(async (tableId: string) => {
      saveTableToServer(tableId);
    }, 1000)
  ).current;

  useEffect(() => {
    return () => {
      debouncedUpdateField.cancel?.();
      debouncedSaveToServer.cancel?.();
    };
  }, []);

  const validateTableName = (name: string): boolean => {
    const validPattern = /^[A-Za-z0-9_]+$/;
    return validPattern.test(name) && name.length <= MAX_TABLE_NAME_LENGTH;
  };

  const handleTableNameChange = (value: string) => {
    const truncatedValue = value.slice(0, MAX_TABLE_NAME_LENGTH);
    setTableName(truncatedValue);

    if (truncatedValue === "" || validateTableName(truncatedValue)) {
      setTableNameError(false);
    } else {
      setTableNameError(true);
    }
  };

  const handleTableNameBlur = () => {
    setIsEditingName(false);
    const trimmedName = tableName.trim();

    if (!trimmedName) {
      setTableName(table?.name || "");
      setTableNameError(false);
      return;
    }

    if (!validateTableName(trimmedName)) {
      setTableName(table?.name || "");
      setTableNameError(false);
      return;
    }

    if (trimmedName !== table?.name) {
      updateTable(id, { name: trimmedName });
      debouncedSaveToServer(id);
    }

    setTableNameError(false);
  };

  const handleFieldChange = (
    fieldId: string,
    key: "name" | "type",
    value: string
  ) => {
    if (key === "name") {
      activeInputs.current.add(fieldId);
      setLocalFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    } else {
      const relations = allRelations().filter((r) => r.fromField === fieldId);
      if (relations) {
        relations.forEach((relation) => {
          updateField(relation.toTable, relation.toField, {
            type: value,
          });
          saveTableToServer(relation.toTable);
        });
      }
      debouncedUpdateField(id, fieldId, { [key]: value });
      debouncedSaveToServer(table.id);
    }
  };

  const handleFieldBlur = (fieldId: string) => {
    activeInputs.current.delete(fieldId);

    debouncedUpdateField.cancel?.();
    const currentValue = localFieldValues[fieldId]?.trim();

    if (!currentValue) {
      const field = table.fields.find((f) => f.id === fieldId);
      if (field) {
        setLocalFieldValues((prev) => ({
          ...prev,
          [fieldId]: field.name,
        }));
        previousFieldValues.current[fieldId] = field.name;
      }
      return;
    }

    const field = table.fields.find((f) => f.id === fieldId);
    if (field && currentValue !== field.name) {
      updateField(id, fieldId, { name: currentValue });
      previousFieldValues.current[fieldId] = currentValue;
      debouncedSaveToServer(id);
    }
  };

  const handleFieldFocus = (fieldId: string) => {
    activeInputs.current.add(fieldId);
  };

  const handleAddField = async () => {
    setCurrentTable(id);
    const currentTable = getCurrentTable();
    if (!currentTable) return;
    if (currentTable.fields.length >= MAX_FIELDS) return;

    const newField = {
      name: getFieldName(table),
      type: "text",
      isPrimaryKey: false,
      isForeignKey: false,
    };

    const updatedTable = {
      ...currentTable,
      layout: getTableLayoutPayload(currentTable),
      fields: [...currentTable.fields, newField],
    };

    if (projectId && updatedTable) {
      try {
        const newTable = await SchemaService.updateTable(
          projectId,
          id,
          mapTableToApiPayload(updatedTable as TableSchema)
        );
        const mappedApiTable: TableSchema = {
          ...newTable.table,
          fields: newTable.table.fields.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            unique: f.generation?.uniqueValues,
            autoIncrement: f.generation?.autoIncrement,
            isPrimaryKey: f.isPrimaryKey,
            isForeignKey: f.isForeignKey,
            viaFaker: f.generation?.viaFaker,
            fakerType: f.generation?.fakerType,
            locale: f.generation?.fakerLocale as
              | "LOCALE_RU_RU"
              | "LOCALE_EN_US"
              | undefined,
          })),
        };
        updateTable(id, mappedApiTable);
      } catch (err) {
        console.error("Failed to add field:", err);
      }
    }
  };

  const handleDeleteField = (fieldId: string) => {
    if (table?.fields.length && table.fields.length > 1) {
      // Убираем из активных
      activeInputs.current.delete(fieldId);
      delete previousFieldValues.current[fieldId];
      removeField(id, fieldId);
      debouncedSaveToServer(id);
    }
  };

  if (!table) return null;

  const isPhone = window.innerWidth <= 600;

  return (
    <div
      style={{
        background: "white",
        border: "2px solid #000",
        borderRadius: "8px",
        minWidth: "250px",
        overflow: "visible",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          background: "#000",
          padding: "12px 15px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          userSelect: isEditingRelations ? "none" : "auto",
        }}
      >
        {isEditingName ? (
          <input
            autoFocus
            value={tableName}
            onChange={(e) => handleTableNameChange(e.target.value)}
            onBlur={handleTableNameBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTableNameBlur();
              if (e.key === "Escape") {
                setTableName(table.name);
                setTableNameError(false);
                setIsEditingName(false);
              }
            }}
            style={{
              background: "transparent",
              border: `1px solid ${tableNameError ? "#ff4444" : "white"}`,
              color: tableNameError ? "#ff4444" : "white",
              fontWeight: "bold",
              fontSize: "16px",
              width: "100%",
              padding: "2px 4px",
              outline: "none",
            }}
            className="nodrag"
          />
        ) : (
          <div
            onDoubleClick={() => !isPhone && setIsEditingName(true)}
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "text",
            }}
          >
            {tableName}
          </div>
        )}
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          sx={{ color: "#d32f2f", display: isPhone ? "none" : "unset" }}
          aria-label="Удалить таблицу"
          className="nodrag"
        >
          ×
        </IconButton>
      </div>

      <div style={{ overflow: "visible" }}>
        <AnimatePresence>
          {table.fields.map((field, index) => (
            <motion.div
              key={field.id}
              style={{
                padding: "8px 12px",
                borderBottom:
                  index < table.fields.length - 1
                    ? "1px solid #E0E0E0"
                    : "none",
                display: "grid",
                gridTemplateColumns: isPhone
                  ? "30px 1fr 1fr"
                  : "30px 1fr 135px 30px 30px",
                alignItems: "center",
                gap: "8px",
                position: "relative",
                userSelect: isEditingRelations ? "none" : "auto",
                overflow: "visible",
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              viewport={{ once: true }}
            >
              <Handle
                type="source"
                position={Position.Left}
                id={`${field.id}-left`}
                style={{
                  left: -14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#fff",
                  width: 10,
                  height: 10,
                  border: "2px solid black",
                  borderRadius: "50%",
                  cursor: "crosshair",
                  zIndex: 10000,
                  opacity: isEditingRelations ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              />

              <PkSettings
                field={field}
                tableId={table.id}
                projectId={projectId!}
              />

              <input
                value={localFieldValues[field.id] ?? field.name}
                onChange={(e) =>
                  handleFieldChange(field.id, "name", e.target.value)
                }
                onFocus={() => handleFieldFocus(field.id)}
                onDoubleClick={(e) => e.currentTarget.select()}
                onBlur={() => handleFieldBlur(field.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "text",
                  color: "#000",
                }}
                className="nodrag"
                disabled={isPhone}
              />

              <div className="nodrag">
                <SelectField
                  options={field.isPrimaryKey ? PKTypeOptions : typeOptions}
                  value={field.type}
                  onChange={(val: string | string[]) =>
                    handleFieldChange(field.id, "type", val as string)
                  }
                  displayLabel={
                    field.viaFaker
                      ? getLabelByValue(field.fakerType!) +
                        " (" +
                        field.locale?.slice(7) +
                        ")"
                      : undefined
                  }
                  disabled={field.viaFaker || field.isForeignKey || isPhone}
                />
              </div>

              <div
                className="nodrag"
                style={{ display: isPhone ? "none" : "unset" }}
              >
                <AdditionalSettings fieldId={field.id} projectId={projectId!} />
              </div>

              <button
                onClick={() => handleDeleteField(field.id)}
                className="nodrag"
                disabled={table.fields.length <= 1}
                style={{
                  background: "transparent",
                  border: "none",
                  color: table.fields.length <= 1 ? "#ddd" : "#999",
                  cursor: table.fields.length <= 1 ? "not-allowed" : "pointer",
                  fontSize: "18px",
                  padding: "4px",
                  lineHeight: 1,
                  display: isPhone ? "none" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={
                  table.fields.length <= 1
                    ? "Нельзя удалить последнее поле"
                    : "Удалить поле"
                }
              >
                ×
              </button>

              <Handle
                type="source"
                position={Position.Right}
                id={`${field.id}-right`}
                style={{
                  right: -14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#fff",
                  width: 10,
                  height: 10,
                  border: "2px solid black",
                  borderRadius: "50%",
                  cursor: "crosshair",
                  zIndex: 10000,
                  opacity: isEditingRelations ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div
        style={{
          padding: "8px 12px",
          borderTop: table.fields.length > 0 ? "1px solid #E0E0E0" : "none",
        }}
      >
        <button
          onClick={handleAddField}
          disabled={table.fields.length >= MAX_FIELDS}
          className="nodrag"
          style={{
            width: "100%",
            padding: "8px",
            background: "#f5f5f5",
            border: "1px dashed #ccc",
            borderRadius: "4px",
            color: table.fields.length >= MAX_FIELDS ? "#c5c5c5ff" : "#666",
            cursor: table.fields.length >= MAX_FIELDS ? "initial" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: isPhone ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e8e8e8";
            e.currentTarget.style.borderColor = "#999";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f5f5f5";
            e.currentTarget.style.borderColor = "#ccc";
          }}
        >
          <span style={{ fontSize: "18px", lineHeight: 1 }}>
            {table.fields.length >= MAX_FIELDS ? "" : "+"}
          </span>
          {table.fields.length >= MAX_FIELDS
            ? "Достигнуто максимальное число полей"
            : "Добавить поле"}
        </button>
      </div>

      <DeleteDialog
        tableId={props.id}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

const MemoizedDatabaseTableNode = React.memo(
  DatabaseTableNode,
  (prev, next) => {
    return prev.id === next.id && prev.data.name === next.data.name;
  }
);

const nodeTypes = {
  databaseTable: MemoizedDatabaseTableNode,
};

const getTableName = () => {
  const tables = Object.values(useSchemaStore.getState().getSchema().tables);
  return tables.some((t) => t.name === `table_${tables.length + 1}`)
    ? `table_${tables.length + 2}`
    : `table_${tables.length + 1}`;
};

const getPluralForm = (
  count: number,
  one: string,
  two: string,
  five: string
): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return five;
  }

  if (lastDigit === 1) {
    return one;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return two;
  }

  return five;
};

export const DatabaseDiagram: React.FC = () => {
  const { projectId } = useParams();

  const tables: Record<string, TableSchema> = useSchemaStore(
    useShallow((state) => state.tables)
  );
  const relations: Record<string, Relation> = useSchemaStore(
    (state) => state.relations
  );

  const loadSettingsFromApi = useGenerateStore(
    (state) => state.loadSettingsFromApi
  );
  const loadFromApi = useSchemaStore((state) => state.loadFromApi);
  const addTable = useSchemaStore((state) => state.addTable);
  const updateTablePosition = useSchemaStore(
    (state) => state.updateTablePosition
  );
  const updateField = useSchemaStore((state) => state.updateField);
  const addRelation = useSchemaStore((state) => state.addRelation);
  const removeRelation = useSchemaStore((state) => state.removeRelation);
  const getAllTables = useSchemaStore((state) => state.getAllTables);
  const getAllRelations = useSchemaStore((state) => state.getAllRelations);
  const setCurrentTable = useSchemaStore((state) => state.setCurrentTable);

  const tableLayoutsJson = useSchemaStore((state) =>
    JSON.stringify(
      Object.values(state.tables).map((t) => ({
        id: t.id,
        x: Math.round(t.layout.x),
        y: Math.round(t.layout.y),
      }))
    )
  );
  const isEditingRelations = useSchemaStore(
    (state) => state.isEditingRelations
  );
  const setIsEditingRelations = useSchemaStore(
    (state) => state.setIsEditingRelations
  );

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null);
  const [relationDialogOpen, setRelationDialogOpen] = useState(false);
  const [importSchemaDialogOpen, setImportSchemaDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    isError: true,
  });

  const tableLayouts = useMemo(
    () => JSON.parse(tableLayoutsJson),
    [tableLayoutsJson]
  );

  const storeNodesData: StoreNode[] = useMemo(() => {
    return tableLayouts.map((t: any) => ({
      id: t.id,
      type: "databaseTable",
      position: { x: t.x, y: t.y },
      data: { id: t.id },
    }));
  }, [tableLayouts]);

  const edges = useMemo(() => {
    return Object.values(relations).map((relation) => {
      let label = "";
      switch (relation.type) {
        case "one-to-one":
          label = "1:1";
          break;
        case "one-to-many":
          label = "1:N";
          break;
        case "many-to-many":
          label = "N:M";
          break;
        case "many-to-one":
          label = "N:1";
          break;
      }

      return {
        id: relation.id,
        source: relation.fromTable,
        target: relation.toTable,
        sourceHandle: `${relation.fromField}-${relation.fromHandle}`,
        targetHandle: `${relation.toField}-${relation.toHandle}`,
        type: relation.fromTable === relation.toTable ? "selfLoop" : "default",
        animated: false,
        style: {
          stroke: "#666",
          strokeWidth: 2,
        },
        label,
        labelStyle: {
          fill: "#666",
          fontSize: 11,
          fontWeight: "bold",
        },
        labelBgStyle: {
          fill: "white",
          fillOpacity: 0.8,
        },
      };
    });
  }, [relations]);

  const [reactFlowNodes, setReactFlowNodes, onNodesChange] =
    useNodesState<Node<TableNodeData>>(storeNodesData);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] =
    useEdgesState(edges);

  useEffect(() => {
    setReactFlowNodes((currentNodes) => {
      const currentIds = new Set(currentNodes.map((n) => n.id));
      if (
        currentNodes.length === storeNodesData.length &&
        storeNodesData.every((n) => currentIds.has(n.id))
      ) {
        return currentNodes;
      }

      return storeNodesData.map((storeNode) => {
        const existingNode = currentNodes.find((n) => n.id === storeNode.id);
        if (existingNode) {
          // Если нода уже была, оставляем её текущую позицию (чтобы не сбивать драг)
          return existingNode;
        }
        // Если новая - берем из стора
        return storeNode;
      });
    });
  }, [storeNodesData, setReactFlowNodes]);

  useEffect(() => {
    setReactFlowEdges(edges);
  }, [edges, setReactFlowEdges]);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        if (!projectId) return;
        const res = await SchemaService.getSchema(projectId);
        loadFromApi(res);
        loadSettingsFromApi(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSchema();
  }, [projectId, loadFromApi]);

  const isUpdatingRelations = useRef(false);

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!isEditingRelations || !projectId || isUpdatingRelations.current)
        return;

      if (
        !params.source ||
        !params.target ||
        !params.sourceHandle ||
        !params.targetHandle
      )
        return;

      const source = parseHandleId(params.sourceHandle);
      const target = parseHandleId(params.targetHandle);

      const fromTable = tables[params.source];
      const toTable = tables[params.target];

      // if (fromTable.id === toTable.id) {
      //   setSnackbar({
      //     open: true,
      //     message: "Нельзя провести связь между полями одной таблицы", теперь можно
      //     isError: true,
      //   });
      //   return;
      // }

      const fromField = fromTable?.fields.find((f) => f.id === source.fieldId);
      const toField = toTable?.fields.find((f) => f.id === target.fieldId);

      if (!fromField || !toField) return;

      // Проверяем что fromField не является первичным ключом
      if (fromField.isPrimaryKey) {
        setSnackbar({
          open: true,
          message: "Нельзя провести связь от первичного ключа",
          isError: true,
        });
        return;
      }

      if (fromField.id === toField.id) {
        setSnackbar({
          open: true,
          message: "Нельзя провести связь от поля на него же",
          isError: true,
        });
        return;
      }

      // Проверяем что toField не является внешним ключом
      if (toField.isForeignKey) {
        setSnackbar({
          open: true,
          message: "Нельзя провести связь к внешнему ключу",
          isError: true,
        });
        return;
      }

      // Проверяем что fromField ещё не FK
      if (fromField.isForeignKey) {
        setSnackbar({
          open: true,
          message: "Внешний ключ не может ссылаться на несколько полей",
          isError: true,
        });
        return;
      }

      const fromFieldHasRelation = getAllRelations().some(
        (r) => r.fromField === fromField.id
      );
      if (fromFieldHasRelation) {
        setSnackbar({
          open: true,
          message:
            "Нельзя провести связь от поля, на которое ссылается другое поле",
          isError: true,
        });
        return;
      }

      try {
        // const toFieldNewType =
        //   toField.type === "int" || toField.type === "uuid"
        //     ? toField.type
        //     : "int";
        const toFieldUpdates = {
          unique: true,
          type: toField.type, // выставляем правильный тип
        };
        // toField (целевое) становится PK
        updateField(params.target, target.fieldId, toFieldUpdates);

        // fromField (исходное) становится FK и наследует тип от toField
        const sourceUpdate: Partial<SchemaField> = {
          isPrimaryKey: false,
          isForeignKey: true,
          type: toField.type,
          viaFaker: toField.viaFaker,
          fakerType: toField.fakerType,
          locale: toField.locale,
        };

        updateField(params.source, source.fieldId, sourceUpdate);

        const newRelation = {
          fromTable: params.target, // идёт от unique
          toTable: params.source, // к FK
          fromField: target.fieldId,
          toField: source.fieldId,
          type: fromField.unique
            ? ("one-to-one" as const)
            : ("one-to-many" as const),
          fromHandle: target.direction as "left" | "right",
          toHandle: source.direction as "left" | "right",
        };

        let createdRelation;
        isUpdatingRelations.current = true;
        try {
          // Обновляем toTable (теперь содержит PK)
          await SchemaService.updateTable(
            projectId,
            params.target,
            mapTableToApiPayload({
              ...toTable,
              fields: toTable.fields.map((f) =>
                f.id === target.fieldId ? { ...f, ...toFieldUpdates } : f
              ),
              layout: getTableLayoutPayload(toTable),
            })
          );

          // Обновляем fromTable (теперь содержит FK)
          await SchemaService.updateTable(
            projectId,
            params.source,
            mapTableToApiPayload({
              ...fromTable,
              fields: fromTable.fields.map((f) =>
                f.id === source.fieldId
                  ? {
                      ...f,
                      ...sourceUpdate,
                    }
                  : f
              ),
              layout: getTableLayoutPayload(fromTable),
            })
          );

          createdRelation = await SchemaService.createRelation(
            projectId,
            newRelation
          );
          addRelation(createdRelation.relation);
        } catch (e) {
          if (createdRelation) {
            removeRelation(createdRelation.relation.id);
          }
          setSnackbar({
            open: true,
            message: "Не удалось создать связь",
            isError: true,
          });
          return;
        } finally {
          isUpdatingRelations.current = false;
        }
      } catch (error) {
        console.error("Failed to create relation:", error);
        setSnackbar({
          open: true,
          message: "Произошла ошибка при создании связи",
          isError: true,
        });
      }
    },
    [
      addRelation,
      isEditingRelations,
      projectId,
      tables,
      updateField,
      removeRelation,
    ]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node, nodes: Node[]) => {
      updateTablePosition(node.id, node.position.x, node.position.y);
    },
    [updateTablePosition]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);

      changes.forEach((change: any) => {
        if (change.type === "remove") {
          if (isEditingRelations) {
            removeRelation(change.id);
          }
        }
      });
    },
    [onEdgesChange, removeRelation, isEditingRelations]
  );

  //  Обработчик клика на edge
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (!isEditingRelations) return;

      event.preventDefault();
      event.stopPropagation();

      setSelectedRelation(edge.id);
      setRelationDialogOpen(true);
    },
    [isEditingRelations]
  );

  const handleAddTable = async () => {
    const allTables = getAllTables();
    const newTable = {
      name: getTableName(),
      fields: [
        {
          name: "id",
          type: "int",
          isPrimaryKey: true,
        },
      ],
      layout: {
        x: 200 + allTables.length * 50,
        y: 200,
      },
    };

    if (projectId) {
      try {
        const newApiTable = await SchemaService.createTable(projectId, {
          table: newTable,
        });
        addTable(newApiTable.table);
      } catch (e) {
        console.log("error");
      }
    }
  };

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    tableId: string | null;
  }>({ open: false, tableId: null });

  const handleDeleteClose = () => {
    setDeleteDialog({ open: false, tableId: null });
  };

  const toggleEditRelations = () => {
    setIsEditingRelations(!isEditingRelations);
  };

  const [generateConformationOpen, setGenerateConformationOpen] =
    useState(false);
  const navigate = useNavigate();

  const isPhone = window.innerWidth <= 600;

  const [phoneModalOpen, setPhoneModalOpen] = useState(isPhone);

  return (
    <LayoutWithHeader noJustify transparent>
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          position: "relative",
        }}
      >
        <button
          onClick={toggleEditRelations}
          style={{
            position: "absolute",
            top: 100,
            right: 20,
            zIndex: 10,
            padding: "10px 20px",
            background: isEditingRelations ? "rgb(54, 244, 101)" : "#4A90E2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 0.3s",
            display: isPhone ? "none" : "flex",
          }}
        >
          {isEditingRelations
            ? "✓ Завершить редактирование"
            : "Редактировать связи"}
        </button>

        {isEditingRelations && (
          <div
            style={{
              position: "absolute",
              top: 150,
              right: 20,
              zIndex: 10,
              width: "316px",
              padding: "12px 16px",
              background: "rgba(54, 244, 101, 0.9)",
              color: "white",
              borderRadius: "5px",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            🔗 Проведите линию для создания связи
            <br />
            Поле, от которого проводится связь станет FK, а поле, к которому
            идет связь станет уникальным
            <br />
            💬 Кликните на связь для изменения типа
          </div>
        )}

        {/* Сайдбар с таблицами */}
        <aside
          style={{
            position: "absolute",
            top: 78,
            left: 0,
            width: `350px`,
            bottom: 0,
            zIndex: 20,
            backgroundColor: "rgb(24, 25, 27)",

            color: "#000",
            padding: "12px",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
            borderTop: "1px solid #242424ff",
            borderRight: "1px solid #242424ff",

            display: isPhone ? "none" : "flex",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: "8px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, color: "#fff" }}>Таблицы</h3>
            {Object.values(tables).length < 10 ? (
              <Button
                onClick={handleAddTable}
                aria-label="Добавить таблицу"
                variant="contained"
                sx={{
                  background: "#4f8cff",
                  border: "none",
                  color: "white",
                  borderRadius: "6px",
                  height: "32px",
                  width: "32px",
                  cursor: "pointer",
                  fontSize: "20px",
                  "&.Mui-disabled": {
                    backgroundColor: "#3d3d3dff",
                    color: "#123",
                  },
                }}
              >
                +
              </Button>
            ) : (
              <Tooltip title="Максимальное число таблиц - 10" arrow>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#3d3d3dff",
                    color: "#123",
                    borderRadius: "6px",
                    height: "32px",
                    width: "32px",
                    cursor: "default",
                    fontSize: "20px",
                    "&:hover": {
                      backgroundColor: "#3d3d3dff",
                    },
                  }}
                >
                  +
                </Button>
              </Tooltip>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "rgb(24, 25, 27)",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#949494ff rgb(24, 25, 27)",
            }}
          >
            {Object.keys(tables).length === 0 && (
              <div style={{ color: "#999", fontSize: 13 }}>Таблиц пока нет</div>
            )}
            {Object.values(tables).map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #929292ff",
                  cursor: "pointer",
                  marginBottom: 10,
                  height: "70px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onClick={() => {
                  setCurrentTable(t.id);
                  setOpen(true);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ color: "#fff", fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {t.fields.length}{" "}
                    {getPluralForm(t.fields.length, "поле", "поля", "полей")} —
                    x: {Math.round(t.layout.x)}, y: {Math.round(t.layout.y)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    onClick={() => {
                      setCurrentTable(t.id);
                      setOpen(true);
                    }}
                  >
                    <Tooltip title="Настройки генерации таблицы" arrow>
                      <CodeIcon sx={{ color: "#fff" }} />
                    </Tooltip>
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "auto",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0",
              borderTop: "1px solid rgb(36, 36, 36)",
            }}
          >
            <Button
              variant="contained"
              sx={{
                width: "100%",
                height: "42px",
                backgroundColor: "transparent",
                border: "1px solid white",
                "&:hover": {
                  backgroundColor: "rgb(79, 140, 255)",
                  border: "rgb(79, 140, 255)",
                },
              }}
              onClick={() => setGenerateConformationOpen(true)}
            >
              Начать генерацию
            </Button>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                height: "42px",
                backgroundColor: "transparent",
                border: "1px solid white",
                "&:hover": {
                  backgroundColor: "rgb(79, 140, 255)",
                  border: "rgb(79, 140, 255)",
                },
              }}
              onClick={() => navigate(`/history/${projectId}`)}
            >
              Перейти к истории запросов
            </Button>
            <Button
              variant="contained"
              sx={{
                width: "100%",
                height: "42px",
                backgroundColor: "transparent",
                border: "1px solid white",
                "&:hover": {
                  backgroundColor: "rgb(79, 140, 255)",
                  border: "rgb(79, 140, 255)",
                },
              }}
              onClick={() => setImportSchemaDialogOpen(true)}
            >
              Импортировать схему
            </Button>
          </div>
        </aside>
        {isPhone && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "140px",
              display: "flex",
              alignItems: "flex-start",
              zIndex: "1000",
              backgroundColor: "black",
              border: "1px solid black",
            }}
          >
            <Button
              variant="contained"
              sx={{
                width: "100%",
                height: "42px",
                backgroundColor: "black",
                borderBottom: "1px solid #ccc",
                borderRadius: "0",
                top: "0",
                "&:hover": {
                  backgroundColor: "rgb(79, 140, 255)",
                  border: "rgb(79, 140, 255)",
                },
              }}
              onClick={() => navigate(`/history/${projectId}`)}
            >
              Перейти к истории запросов
            </Button>
          </div>
        )}

        {/* React Flow */}
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          edgeTypes={edgeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          fitView
          connectionMode={ConnectionMode["Loose"]}
          connectOnClick={isEditingRelations}
          connectionLineStyle={{
            stroke: isEditingRelations ? "#f44336" : "#666",
            strokeWidth: isEditingRelations ? 3 : 2,
          }}
          edgesFocusable={isEditingRelations}
          nodesDraggable={!isEditingRelations}
          nodesConnectable={isEditingRelations}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
          }}
        >
          <Background
            color="#cfd3d7"
            gap={16}
            size={3}
            variant={BackgroundVariant.Dots}
          />
        </ReactFlow>
      </div>

      <Generate open={open} setOpen={setOpen} projectId={projectId!} />
      <GenerateDialog
        open={generateConformationOpen}
        onClose={() => setGenerateConformationOpen(false)}
        onSucces={() =>
          setSnackbar({
            open: true,
            message: "Запрос на генерацию отправлен",
            isError: false,
          })
        }
      />
      <ImportSchemaDialog
        open={importSchemaDialogOpen}
        onClose={() => setImportSchemaDialogOpen(false)}
        onSucces={() =>
          setSnackbar({
            open: true,
            message: "Схема успешно импортирована",
            isError: false,
          })
        }
      />

      {deleteDialog.tableId && (
        <DeleteDialog
          tableId={deleteDialog.tableId}
          open={deleteDialog.open}
          onClose={handleDeleteClose}
        />
      )}

      {selectedRelation && (
        <RelationDialog
          relation={
            Object.values(relations).find((r) => r.id === selectedRelation) ||
            null
          }
          open={relationDialogOpen}
          onClose={() => {
            setRelationDialogOpen(false);
            setSelectedRelation(null);
          }}
          projectId={projectId!}
        />
      )}

      {isPhone && (
        <PhoneDialog
          open={phoneModalOpen}
          onClose={() => setPhoneModalOpen(false)}
        />
      )}
      <Snackbar
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        open={snackbar.open}
        message={(snackbar.isError ? "× " : "🗸 ") + snackbar.message}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: snackbar.isError
              ? "#940d0dff"
              : "rgba(54, 244, 101, 0.9)",
            color: "white",
            fontSize: "16px",
            borderRadius: "12px",
            marginTop: "60px",
          },
        }}
      />
    </LayoutWithHeader>
  );
};
