import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { SelectField } from "./SelectField";
import { InputField } from "./InputField";
import { IconButton, Button, Tooltip, tooltipClasses } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { AdditionalSettings } from "./AdditionalSettings";
import useSchemaStore, {
  mapTableToApiPayload,
  SchemaField,
  TableSchema,
} from "../../../store/schemaStore";
import { getLabelByValue } from "./constants/constants";
import { PkSettings } from "./PkSettings";
import { useParams } from "react-router-dom";
import { SchemaService } from "@services/api";

const typeOptions = [
  { value: "text", label: "Text" },
  { value: "int", label: "Integer" },
  { value: "bigint", label: "Big Integer" },
  { value: "float", label: "Float" },
  { value: "bool", label: "Boolean" },
  { value: "uuid", label: "UUID" },
];

const PKTypeOptions = [
  { value: "int", label: "Integer" },
  { value: "uuid", label: "UUID" },
];

// Утилита debounce для отложенных запросов
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

const getTableLayoutPayload = (currentTable: any) => {
  return {
    x: Math.round(currentTable.layout.x),
    y: Math.round(currentTable.layout.y),
  };
};

const getFieldName = (table: TableSchema) =>
  table.fields.some((f) => f.name === `field_${table.fields.length + 1}`)
    ? `field_${table.fields.length + 2}`
    : `field_${table.fields.length + 1}`;

export const SchemaMaker: React.FC = () => {
  const { projectId } = useParams();
  const currentTable = useSchemaStore((s) => s.getCurrentTable());
  const currentTableId = useSchemaStore((s) => s.currentTableId);

  const updateField = useSchemaStore((s) => s.updateField);
  const removeField = useSchemaStore((s) => s.removeField);
  const reorderFields = useSchemaStore((s) => s.reorderFields);
  const updateTable = useSchemaStore((s) => s.updateTable);
  const getCurrentTable = useSchemaStore((s) => s.getCurrentTable);
  const getAllRelations = useSchemaStore((s) => s.getAllRelations);

  const [error, setError] = useState<string>("");
  const [errClass, setErrClass] = useState<string>("zero-opacity");

  const [localFieldNames, setLocalFieldNames] = useState<
    Record<string, string>
  >({});
  const [localFieldTypes, setLocalFieldTypes] = useState<
    Record<string, string>
  >({});

  const schema = useMemo(() => currentTable?.fields || [], [currentTable]);

  const saveTableToServer = async (tableId: string) => {
    if (!projectId) return;

    const table = useSchemaStore.getState().tables[tableId];
    if (!table) return;

    try {
      await SchemaService.updateTable(
        projectId,
        tableId,
        mapTableToApiPayload({
          ...table,
          layout: getTableLayoutPayload(table),
        })
      );
    } catch (err) {
      console.error("Failed to save table:", err);
    }
  };

  // Debounced функция для сохранения на сервер
  const debouncedSaveToServer = useRef(
    debounce(async (tableId: string) => {
      saveTableToServer(tableId);
    }, 1000)
  ).current;

  useEffect(() => {
    const names: Record<string, string> = {};
    const types: Record<string, string> = {};

    schema.forEach((field) => {
      names[field.id] = field.name;
      types[field.id] = field.type;
    });

    setLocalFieldNames(names);
    setLocalFieldTypes(types);
  }, [currentTableId, schema]);

  useEffect(() => {
    return () => {
      debouncedSaveToServer.cancel?.();
    };
  }, []);

  const handleFieldNameChange = (fieldId: string, value: string) => {
    setLocalFieldNames((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Сохраняем в store и на сервер при blur
  const handleFieldNameBlur = (fieldId: string) => {
    if (!currentTableId) return;
    const newName = localFieldNames[fieldId];

    // Обновляем в store
    updateField(currentTableId, fieldId, { name: newName });

    // Сохраняем на сервер
    debouncedSaveToServer(currentTableId);
  };

  // Обновляем тип в store и сохраняем на сервер
  const handleFieldTypeChange = async (fieldId: string, value: string) => {
    if (!currentTableId || !projectId) return;

    setLocalFieldTypes((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    const relations = getAllRelations().filter((r) => r.fromField === fieldId);
    if (relations) {
      relations.forEach((relation) => {
        updateField(relation.toTable, relation.toField, { type: value });

        saveTableToServer(relation.toTable);
      });
    }
    updateField(currentTableId, fieldId, { type: value });

    // Сохраняем на сервер
    debouncedSaveToServer(currentTableId);
  };

  const handleSchemaErrorDisplay = () => {
    setError("(Не может быть меньше одного поля)");
    setErrClass("");
    setTimeout(() => {
      setErrClass("zero-opacity");
      setTimeout(() => setError(""), 500);
    }, 5000);
  };

  // Добавление поля с сохранением на сервер
  const handleAddField = async () => {
    if (!currentTableId || !projectId) return;

    const currentTable = getCurrentTable();
    const id = currentTableId;
    if (!currentTable) return;

    const newField = {
      name: getFieldName(currentTable),
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
        updateTable(id, newTable.table);
      } catch (err) {
        console.error("Failed to add field:", err);
      }
    }
  };

  // Удаление поля с сохранением на сервер
  const handleRemoveField = async (idx: number) => {
    if (!currentTableId || !projectId) return;

    const id = schema[idx]?.id;
    if (!id) return;

    // Удаляем из store
    removeField(currentTableId, id, handleSchemaErrorDisplay);

    // Сохраняем на сервер
    debouncedSaveToServer(currentTableId);
  };

  // Изменение порядка полей с сохранением на сервер
  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination || !currentTableId || !projectId || !currentTable)
      return;

    // Обновляем в store
    reorderFields(
      currentTableId,
      result.source.index,
      result.destination.index
    );

    const items = Array.from(currentTable.fields);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const reorderedTable: TableSchema = {
      ...currentTable,
      layout: getTableLayoutPayload(currentTable),
      fields: items.map((f, idx) => ({ ...f, position: idx })),
    };

    // Сохраняем на сервер
    SchemaService.updateTable(
      projectId,
      currentTableId,
      mapTableToApiPayload(reorderedTable)
    );
  };

  const getSelectDisabledState = (field: SchemaField) => {
    return field.viaFaker || field.isForeignKey;
  };

  if (!currentTable || !currentTableId) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
        Выберите или создайте таблицу для работы со схемой
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "30px 50px 1fr 1fr 90px 40px",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        <div />
        <div
          style={{
            display: "flex",
            justifySelf: "center",
            alignItems: "center",
            gap: "2px",
          }}
        >
          PK{" "}
          <Tooltip
            title="Настройка типа ключа (Primary key, Foreign key)"
            arrow
            placement="top-start"
          >
            <HelpOutlineIcon
              sx={{ width: "16px", height: "16px", color: "#9c9c9cff" }}
            />
          </Tooltip>
        </div>
        <div>
          Название поля{" "}
          <span style={{ color: "red" }} className={errClass + " error-span"}>
            {error && error}
          </span>
        </div>
        <div>Тип поля</div>
        <div style={{ display: "flex", justifySelf: "center" }}>Настройки</div>
        <div />
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="schemaFields">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {schema.map((field, idx) => (
                <Draggable key={field.id} draggableId={field.id} index={idx}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "30px 50px 1fr 1fr 90px 40px",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div
                        {...provided.dragHandleProps}
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <DragIndicatorIcon
                          sx={{ color: "#888", cursor: "grab" }}
                        />
                      </div>

                      <PkSettings
                        field={field}
                        tableId={currentTable.id}
                        projectId={projectId!}
                      />

                      <InputField
                        name={`${idx}`}
                        value={localFieldNames[field.id] || field.name}
                        placeholder="Введите название поля"
                        onChange={(e) =>
                          handleFieldNameChange(field.id, e.target.value)
                        }
                        onBlur={() => handleFieldNameBlur(field.id)}
                        useFormik={false}
                      />

                      <Tooltip
                        title={
                          field.isForeignKey
                            ? "Нельзя менять тип внешнего ключа"
                            : field.viaFaker
                            ? "Тип фейкера можно поменять только в настройках"
                            : ""
                        }
                        enterDelay={500}
                        arrow
                        slotProps={{
                          popper: {
                            sx: {
                              [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
                                {
                                  marginTop: "5px",
                                },
                            },
                          },
                        }}
                      >
                        <div>
                          <SelectField
                            value={localFieldTypes[field.id] || field.type}
                            options={
                              field.isPrimaryKey ? PKTypeOptions : typeOptions
                            }
                            onChange={(val: any) =>
                              handleFieldTypeChange(field.id, val as string)
                            }
                            displayLabel={
                              field.viaFaker
                                ? getLabelByValue(field.fakerType!) +
                                  " (" +
                                  field.locale?.slice(7) +
                                  ")"
                                : undefined
                            }
                            disabled={getSelectDisabledState(field)}
                          />
                        </div>
                      </Tooltip>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <AdditionalSettings
                          fieldId={field.id}
                          projectId={projectId!}
                        />
                      </div>

                      <IconButton
                        size="small"
                        onClick={() => handleRemoveField(idx)}
                        sx={{ color: "#d32f2f" }}
                        aria-label="Удалить поле"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddField}
        sx={{
          marginTop: "6px",
          background: "#4f8cff",
          color: "white",
          borderRadius: "7px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "15px",
          height: "36px",
          boxShadow: "none",
          "&:hover": { background: "#3a6fd8" },
        }}
      >
        Добавить поле
      </Button>
    </div>
  );
};
