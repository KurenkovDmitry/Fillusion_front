import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Connection,
  addEdge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SelectField } from "../Generate/components/SelectField";

// Интерфейсы (ваш текущий формат идеален!)
interface Field {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

interface Table {
  id: string;
  name: string;
  fields: Field[];
  x: number;
  y: number;
}

interface TableNodeData {
  id: string;
  name: string;
  fields: Field[];
  onUpdate?: (tableId: string, updates: Partial<Table>) => void;
}

type RelationType = "one-to-one" | "one-to-many" | "many-to-many";

interface Relation {
  fromTable: string;
  toTable: string;
  fromField: string;
  toField: string;
  type: RelationType;
}

interface DatabaseDiagramProps {
  tables: Table[];
  relations?: Relation[];
  onTableUpdate?: (tableId: string, updates: Partial<Table>) => void;
  onDiagramSave?: (tables: Table[], relations: Relation[]) => void; // Новый колбэк
}

const typeOptions = [
  { value: "TEXT", label: "TEXT" },
  { value: "INT", label: "INT" },
  { value: "VARCHAR", label: "VARCHAR" },
  { value: "TIMESTAMP", label: "TIMESTAMP" },
];

const DatabaseTableNode = ({ data, id }: NodeProps<TableNodeData>) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tableName, setTableName] = useState(data.name);
  const [fields, setFields] = useState<Field[]>(data.fields);

  const handleTableNameBlur = () => {
    setIsEditingName(false);
    if (data.onUpdate) {
      data.onUpdate(id, { name: tableName });
    }
  };

  const handleFieldChange = (
    index: number,
    key: "name" | "type",
    value: string
  ) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
    if (data.onUpdate) {
      data.onUpdate(id, { fields: updated });
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
        {fields.map((field, index) => (
          <div
            key={index}
            style={{
              padding: "8px 12px",
              borderBottom:
                index < fields.length - 1 ? "1px solid #E0E0E0" : "none",
              display: "grid",
              gridTemplateColumns: "1fr 135px",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${field.name}-left`}
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
              id={`${field.name}-right`}
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
              value={`${
                field.isPrimaryKey ? "🔑 " : field.isForeignKey ? "🔗 " : ""
              }${field.name}`}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/^(🔑 |🔗 )/, "");
                handleFieldChange(index, "name", cleaned);
              }}
              onDoubleClick={(e) => e.currentTarget.select()}
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
                onChange={(val) =>
                  handleFieldChange(index, "type", val as string)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  databaseTable: DatabaseTableNode,
};

const convertTablesToNodes = (
  tables: Table[],
  onUpdate?: (tableId: string, updates: Partial<Table>) => void
): Node<TableNodeData>[] => {
  return tables.map((table) => ({
    id: table.id,
    type: "databaseTable",
    position: { x: table.x, y: table.y },
    data: {
      id: table.id,
      name: table.name,
      fields: table.fields,
      onUpdate,
    },
  }));
};

const convertRelationsToEdges = (relations: Relation[]): Edge[] => {
  return relations.map((relation, index) => {
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
      id: `${relation.fromTable}-${relation.toTable}-${relation.fromField}-${relation.toField}`,
      source: relation.fromTable,
      target: relation.toTable,
      sourceHandle: `${relation.fromField}-right`,
      targetHandle: `${relation.toField}-left`,
      type: "deafult",
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
};

export const DatabaseDiagram: React.FC<DatabaseDiagramProps> = ({
  tables,
  relations = [],
  onTableUpdate,
  onDiagramSave,
}) => {
  // Локальное состояние для актуальных данных
  const [currentTables, setCurrentTables] = useState<Table[]>(tables);
  const [currentRelations, setCurrentRelations] =
    useState<Relation[]>(relations);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TableNodeData>>(
    convertTablesToNodes(currentTables, (tableId, updates) => {
      // Обновляем локальное состояние
      setCurrentTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, ...updates } : t))
      );
      // Вызываем внешний колбэк
      if (onTableUpdate) {
        onTableUpdate(tableId, updates);
      }
    })
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    convertRelationsToEdges(currentRelations)
  );

  // Синхронизация с внешним state при изменении пропсов
  useEffect(() => {
    setCurrentTables(tables);
    setNodes(convertTablesToNodes(tables, onTableUpdate));
  }, [tables, setNodes, onTableUpdate]);

  useEffect(() => {
    setCurrentRelations(relations);
    setEdges(convertRelationsToEdges(relations));
  }, [relations, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#666", strokeWidth: 2 },
        label: "1:N",
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);

      // Обновляем позиции в локальном state
      changes.forEach((change: any) => {
        if (change.type === "position" && change.position) {
          setCurrentTables((prev) =>
            prev.map((t) =>
              t.id === change.id
                ? { ...t, x: change.position.x, y: change.position.y }
                : t
            )
          );

          // Вызываем внешний колбэк
          if (onTableUpdate) {
            onTableUpdate(change.id, {
              x: change.position.x,
              y: change.position.y,
            });
          }
        }
      });
    },
    [onNodesChange, onTableUpdate]
  );

  // Функция для сохранения всей диаграммы
  const handleSave = useCallback(() => {
    if (onDiagramSave) {
      onDiagramSave(currentTables, currentRelations);
    }
  }, [currentTables, currentRelations, onDiagramSave]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Кнопка сохранения */}
      {onDiagramSave && (
        <button
          onClick={handleSave}
          style={{
            position: "absolute",
            top: 20,
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
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
        <Controls />
      </ReactFlow>
    </div>
  );
};
