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
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SelectField } from "../Generate/components/SelectField";
import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { Button } from "@mui/material";
import { AdditionalSettings } from "../Generate/components/AdditionalSettings";

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
}

const typeOptions = [
  { value: "TEXT", label: "String" },
  { value: "INT", label: "Integer" },
  { value: "TIMESTAMP", label: "Float" },
  { value: "VARCHAR", label: "Text" },
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
          display: "flex",
          justifyContent: "space-between",
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
              gridTemplateColumns: "1fr 135px 30px",
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
              // value={`${
              //   field.isPrimaryKey ? "🔑 " : field.isForeignKey ? "🔗 " : ""
              // }${field.name}`}
              value={field.name}
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
            <div className="nodrag">
              <AdditionalSettings fieldId="1" />
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
  return relations.map((relation) => {
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
};

export const DatabaseDiagram: React.FC<DatabaseDiagramProps> = ({
  tables,
  relations = [],
  onTableUpdate,
}) => {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [currentTables, setCurrentTables] = useState<Table[]>(tables);
  const [currentRelations, setCurrentRelations] =
    useState<Relation[]>(relations);

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TableNodeData>>(
    convertTablesToNodes(currentTables, (tableId, updates) => {
      setCurrentTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, ...updates } : t))
      );
      if (onTableUpdate) {
        onTableUpdate(tableId, updates);
      }
    })
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    convertRelationsToEdges(currentRelations)
  );

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

      changes.forEach((change: any) => {
        if (change.type === "position" && change.position) {
          setCurrentTables((prev) =>
            prev.map((t) =>
              t.id === change.id
                ? { ...t, x: change.position.x, y: change.position.y }
                : t
            )
          );

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

  // Функция сохранения с выводом в консоль
  // const handleSave = useCallback(() => {
  //   if (rfInstance) {
  //     // Способ 1: React Flow toObject() - полное состояние с viewport
  //     const flowState = rfInstance.toObject();
  //     console.log("React Flow полное состояние:", flowState);
  //     console.log("JSON:", JSON.stringify(flowState, null, 2));
  //   }

  //   // Способ 2: Ваш кастомный формат (рекомендуется для БД)
  //   const customState = {
  //     tables: currentTables,
  //     relations: currentRelations,
  //   };
  //   console.log("Кастомное состояние для API:", customState);
  //   console.log("JSON для API:", JSON.stringify(customState, null, 2));

  //   // Пример вызова API:
  //   // fetch('/api/save-diagram', {
  //   //   method: 'POST',
  //   //   headers: { 'Content-Type': 'application/json' },
  //   //   body: JSON.stringify(customState)
  //   // });
  // }, [rfInstance, currentTables, currentRelations]);

  const handleSave = async () => {
    const res = await fetch("http://localhost:8080/api/users/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Добавьте этот заголовок!
      },
      body: JSON.stringify({
        email: "itwasnear78@gmail.com",
        password: "SecurePassword123",
      }),
      credentials: "include",
    });
    if (!res.ok) {
      console.log("error");
    }
    console.log(await res.json());
  };

  // Добавить новую таблицу
  const handleAddTable = () => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      name: `Table_${currentTables.length + 1}`,
      fields: [],
      x: 200,
      y: 200,
    };
    const newTables = [...currentTables, newTable];
    setCurrentTables(newTables);
    setNodes(convertTablesToNodes(newTables, onTableUpdate));
    setSelectedTableId(newTable.id);
  };

  const handleTableNameChange = (tableId: string, newName: string) => {
    setCurrentTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, name: newName } : t))
    );
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === tableId
          ? { ...node, data: { ...node.data, name: newName } }
          : node
      )
    );
    if (onTableUpdate) {
      onTableUpdate(tableId, { name: newName });
    }
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
        {/* <button
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
        </button> */}

        {/* SIDEBAR */}
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
            {currentTables.length === 0 && (
              <div style={{ color: "#bbb", fontSize: 13 }}>Таблиц пока нет</div>
            )}
            {currentTables.map((t) => (
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
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {editingTableId === t.id ? (
                  <input
                    autoFocus
                    value={t.name}
                    onChange={(e) =>
                      handleTableNameChange(t.id, e.target.value)
                    }
                    onBlur={() => setEditingTableId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingTableId(null);
                      if (e.key === "Escape") {
                        handleTableNameChange(t.id, t.name);
                        setEditingTableId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "transparent",
                      border: "1px solid #444",
                      borderRadius: "4px",
                      color: "white",
                      padding: "4px 8px",
                      width: "100%",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <div
                    style={{ fontSize: "14px" }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingTableId(t.id);
                    }}
                  >
                    {t.name}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#aaa" }}>
                  {t.fields.length} полей — x: {Math.round(t.x)}, y:{" "}
                  {Math.round(t.y)}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <ReactFlow
          nodes={nodes}
          // edges={edges}
          onNodesChange={handleNodesChange}
          // onEdgesChange={onEdgesChange}
          // onConnect={onConnect}
          onInit={setRfInstance} // Получаем инстанс через onInit
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
    </LayoutWithHeader>
  );
};
