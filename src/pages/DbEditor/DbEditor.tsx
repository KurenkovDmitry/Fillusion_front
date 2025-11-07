import React, { useCallback, useEffect } from "react";
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
  addEdge,
  BackgroundVariant,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SelectField } from "../Generate/components/SelectField";
import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { Button } from "@mui/material";
import { AdditionalSettings } from "../Generate/components/AdditionalSettings";
import { SchemaService } from "@services/api/SchemaService/SchemaService";
import { useParams } from "react-router-dom";
import useSchemaStore, {
  TableSchema,
  SchemaField,
} from "../../store/schemaStore";
import { Generate } from "../Generate";

interface TableNodeData {
  id: string;
  name: string;
  fields: SchemaField[];
}

export type DatabaseTableNodeType = Node<TableNodeData, "databaseTable">;

const typeOptions = [
  { value: "string", label: "String" },
  { value: "int", label: "Integer" },
  { value: "float", label: "Float" },
];

const getTableLayoutPayload = (currentTable: TableSchema) => {
  return {
    x: Math.round(currentTable.layout.x),
    y: Math.round(currentTable.layout.y),
  };
};

const DatabaseTableNode = (props: NodeProps<DatabaseTableNodeType>) => {
  const { projectId } = useParams();
  const {
    updateTable,
    updateField,
    removeField,
    getCurrentTable,
    setCurrentTable,
  } = useSchemaStore();
  const data = props.data;
  const id = props.id;
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tableName, setTableName] = React.useState(data.name);

  // чтобы в handleFieldBlur не слать запросы, когда изменений не было
  const [isFieldChanged, setFieldChanged] = React.useState<
    Map<string, boolean>
  >(new Map());

  const handleTableNameBlur = () => {
    setIsEditingName(false);
    updateTable(id, { name: tableName });
  };

  const handleFieldChange = (
    fieldId: string,
    key: "name" | "type",
    value: string
  ) => {
    updateField(id, fieldId, { [key]: value });
    setFieldChanged((prev) => prev.set(fieldId, true));
  };

  const handleFieldBlur = (fieldId: string) => {
    if (!isFieldChanged.get(fieldId)) return;
    setCurrentTable(id);
    const currentTable = getCurrentTable();
    const updatedTable = {
      table: {
        ...getCurrentTable(),
        layout: getTableLayoutPayload(currentTable!),
      },
    };
    if (!updatedTable.table || !projectId) return;
    SchemaService.updateTable(projectId, id, updatedTable);
    setFieldChanged((prev) => prev.set(fieldId, false));
  };

  const handleAddField = async () => {
    setCurrentTable(id);
    const currentTable = getCurrentTable();
    if (!currentTable) return;
    const updatedTable = {
      table: {
        ...currentTable,
        layout: getTableLayoutPayload(currentTable),
        fields: [
          ...currentTable.fields,
          {
            name: `field_${data.fields.length + 1}`,
            type: "string",
            isPrimaryKey: false,
            isForeignKey: false,
          },
        ],
      },
    };
    if (projectId && updatedTable.table) {
      const newTable = await SchemaService.updateTable(
        projectId,
        id,
        updatedTable
      );
      updateTable(id, newTable.table);
    }
  };

  const handleDeleteField = (fieldId: string) => {
    if (data.fields.length > 1) {
      removeField(id, fieldId);
    }
  };

  return (
    <div
      style={{
        background: "white",
        border: "2px solid #000",
        borderRadius: "8px",
        minWidth: "250px",
        overflow: "hidden",
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
        }}
      >
        {isEditingName ? (
          <input
            autoFocus
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            onBlur={handleTableNameBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTableNameBlur();
              if (e.key === "Escape") {
                setTableName(data.name);
                setIsEditingName(false);
              }
            }}
            style={{
              background: "transparent",
              border: "1px solid white",
              color: "white",
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
            onDoubleClick={() => setIsEditingName(true)}
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "text",
            }}
          >
            {tableName}
          </div>
        )}
      </div>

      <div>
        {data.fields.map((field, index) => (
          <div
            key={field.id}
            style={{
              padding: "8px 12px",
              borderBottom:
                index < data.fields.length - 1 ? "1px solid #E0E0E0" : "none",
              display: "grid",
              gridTemplateColumns: "1fr 135px 30px 30px",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${field.id}-left`}
              style={{
                left: -8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "#666",
                width: 8,
                height: 8,
                border: "2px solid white",
              }}
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`${field.id}-right`}
              style={{
                right: -8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "#666",
                width: 8,
                height: 8,
                border: "2px solid white",
              }}
            />
            <input
              value={field.name}
              onChange={(e) =>
                handleFieldChange(field.id, "name", e.target.value)
              }
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
            />
            <div className="nodrag">
              <SelectField
                options={typeOptions}
                value={field.type}
                onChange={(val: string | string[]) =>
                  handleFieldChange(field.id, "type", val as string)
                }
              />
            </div>
            <div className="nodrag">
              <AdditionalSettings fieldId={field.id} />
            </div>
            <button
              onClick={() => handleDeleteField(field.id)}
              className="nodrag"
              disabled={data.fields.length <= 1}
              style={{
                background: "transparent",
                border: "none",
                color: data.fields.length <= 1 ? "#ddd" : "#999",
                cursor: data.fields.length <= 1 ? "not-allowed" : "pointer",
                fontSize: "18px",
                padding: "4px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={
                data.fields.length <= 1
                  ? "Нельзя удалить последнее поле"
                  : "Удалить поле"
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "8px 12px",
          borderTop: data.fields.length > 0 ? "1px solid #E0E0E0" : "none",
        }}
      >
        <button
          onClick={handleAddField}
          className="nodrag"
          style={{
            width: "100%",
            padding: "8px",
            background: "#f5f5f5",
            border: "1px dashed #ccc",
            borderRadius: "4px",
            color: "#666",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
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
          <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
          Добавить поле
        </button>
      </div>
    </div>
  );
};

const nodeTypes = {
  databaseTable: DatabaseTableNode,
};

export const DatabaseDiagram: React.FC = () => {
  const { projectId } = useParams();
  const {
    tables,
    relations,
    loadFromApi,
    addTable,
    updateTablePosition,
    addRelation,
    removeRelation,
    getAllTables,
    getAllRelations,
    setCurrentTable,
  } = useSchemaStore();

  const [rfInstance, setRfInstance] = React.useState<ReactFlowInstance | null>(
    null
  );
  const [open, setOpen] = React.useState(false);

  // Конвертация таблиц в ноды
  const convertTablesToNodes = useCallback(
    (tables: Record<string, TableSchema>): Node<TableNodeData>[] => {
      return Object.values(tables).map((table) => ({
        id: table.id,
        type: "databaseTable",
        position: { x: table.layout.x, y: table.layout.y },
        data: {
          id: table.id,
          name: table.name,
          fields: table.fields,
        },
      }));
    },
    []
  );

  // Конвертация связей в рёбра
  const convertRelationsToEdges = useCallback(() => {
    return getAllRelations().map((relation) => {
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
      }

      return {
        id: relation.id,
        source: relation.fromTable,
        target: relation.toTable,
        sourceHandle: `${relation.fromField}-right`,
        targetHandle: `${relation.toField}-left`,
        type: "default",
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
  }, [getAllRelations]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TableNodeData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Загрузка схемы из API
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const res = await SchemaService.getSchema(projectId!);
        loadFromApi(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSchema();
  }, [projectId, loadFromApi]);

  // Обновление нод при изменении таблиц
  useEffect(() => {
    setNodes(convertTablesToNodes(tables));
  }, [tables, convertTablesToNodes, setNodes]);

  // Обновление рёбер при изменении связей
  useEffect(() => {
    setEdges(convertRelationsToEdges());
  }, [relations, convertRelationsToEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (
        !params.source ||
        !params.target ||
        !params.sourceHandle ||
        !params.targetHandle
      )
        return;

      addRelation({
        fromTable: params.source,
        toTable: params.target,
        fromField: params.sourceHandle.replace("-right", ""),
        toField: params.targetHandle.replace("-left", ""),
        type: "one-to-many",
        id: "12",
      });
    },
    [addRelation]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);

      changes.forEach((change: any) => {
        if (change.type === "position" && change.position && !change.dragging) {
          updateTablePosition(change.id, change.position.x, change.position.y);
        }
      });
    },
    [onNodesChange, updateTablePosition]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);

      changes.forEach((change: any) => {
        if (change.type === "remove") {
          removeRelation(change.id);
        }
      });
    },
    [onEdgesChange, removeRelation]
  );

  const handleSave = useCallback(async () => {
    const allTables = getAllTables();
    const allRelations = getAllRelations();

    const payload = {
      tables: allTables,
      relations: allRelations,
    };

    console.log("Сохранение схемы:", payload);

    // try {
    //   await SchemaService.updateSchema(projectId!, payload);
    //   console.log("Схема успешно сохранена");
    // } catch (error) {
    //   console.error("Ошибка сохранения:", error);
    // }
  }, [getAllTables, getAllRelations]);

  const handleAddTable = () => {
    const allTables = getAllTables();
    addTable({
      name: `Table_${allTables.length + 1}`,
      fields: [],
      x: 200 + allTables.length * 50,
      y: 200 + allTables.length * 50,
    });
  };

  return (
    <LayoutWithHeader noJustify transparent>
      <div
        style={{
          width: "100vw",
          height: "calc(100vh)",
          position: "relative",
        }}
      >
        <button
          onClick={handleSave}
          style={{
            position: "absolute",
            top: 100,
            right: 20,
            zIndex: 10,
            padding: "10px 20px",
            background: "#4A90E2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Сохранить диаграмму
        </button>

        <aside
          style={{
            position: "absolute",
            top: 78,
            left: 0,
            width: `350px`,
            bottom: 0,
            zIndex: 20,
            background: "#18191b",
            color: "#fff",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
            borderTop: "1px solid #3b3b3bff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Таблицы</h3>
            <Button
              onClick={handleAddTable}
              aria-label="Добавить таблицу"
              style={{
                background: "#4f8cff",
                border: "none",
                color: "white",
                borderRadius: 6,
                height: "32px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              +
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#333 #18191b",
            }}
          >
            {Object.keys(tables).length === 0 && (
              <div style={{ color: "#bbb", fontSize: 13 }}>Таблиц пока нет</div>
            )}
            {Object.values(tables).map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #333",
                  cursor: "pointer",
                  marginBottom: 8,
                  height: "70px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>
                    {t.fields.length} полей — x: {Math.round(t.layout.x)}, y:{" "}
                    {Math.round(t.layout.y)}
                  </div>
                </div>
                <div
                  onClick={() => {
                    setCurrentTable(t.id);
                    setOpen(true);
                  }}
                >
                  sldlsk
                </div>
              </div>
            ))}
          </div>
        </aside>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          fitView
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
      <Generate open={open} setOpen={setOpen} />
    </LayoutWithHeader>
  );
};
