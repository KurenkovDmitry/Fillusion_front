import React, { useState, useEffect } from "react";
import { SelectField } from "./SelectField";
import { InputField } from "./InputField";
import { IconButton, Button, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { AdditionalSettings } from "./AdditionalSettings";
import useSchemaStore from "../../../store/schemaStore";
import { getLabelByValue } from "./constants/constants";
import { PkSettings } from "./PkSettings";
import { useParams } from "react-router-dom";

const typeOptions = [
  { value: "string", label: "String" },
  { value: "int", label: "Integer" },
  { value: "float", label: "Float" },
];

interface Field {
  id: string;
  name: string;
  type: string;
  unique?: boolean;
  autoIncrement?: boolean;
  viaFaker?: boolean;
  fakerType?: string;
  locale?: "RU_RU" | "EN_US";
}

export const SchemaMaker: React.FC = () => {
  const { projectId } = useParams();
  const currentTable = useSchemaStore((s) => s.getCurrentTable());
  const currentTableId = useSchemaStore((s) => s.currentTableId);

  const addField = useSchemaStore((s) => s.addField);
  const updateField = useSchemaStore((s) => s.updateField);
  const removeField = useSchemaStore((s) => s.removeField);
  const reorderFields = useSchemaStore((s) => s.reorderFields);

  const [error, setError] = useState<string>("");
  const [errClass, setErrClass] = useState<string>("zero-opacity");

  // Локальные значения для быстрой печати
  const [localFieldNames, setLocalFieldNames] = useState<
    Record<string, string>
  >({});
  const [localFieldTypes, setLocalFieldTypes] = useState<
    Record<string, string>
  >({});

  const schema = currentTable?.fields || [];

  // Инициализируем локальные значения когда меняется таблица
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

  // Обновляем локальное значение при печати
  const handleFieldNameChange = (fieldId: string, value: string) => {
    setLocalFieldNames((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Сохраняем в стор при blur
  const handleFieldNameBlur = (fieldId: string) => {
    if (!currentTableId) return;
    const newName = localFieldNames[fieldId];
    updateField(currentTableId, fieldId, { name: newName });
  };

  // Обновляем тип в стор сразу (так как select быстрый)
  const handleFieldTypeChange = (fieldId: string, value: string) => {
    if (!currentTableId) return;

    setLocalFieldTypes((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    updateField(currentTableId, fieldId, { type: value });
  };

  const handleSchemaErrorDisplay = () => {
    setError("(Не может быть меньше одного поля)");
    setErrClass("");
    setTimeout(() => {
      setErrClass("zero-opacity");
      setTimeout(() => setError(""), 500);
    }, 5000);
  };

  const handleAddField = () => {
    if (!currentTableId) return;
    addField(currentTableId, {
      name: `field_${currentTable ? currentTable.fields.length + 1 : "new"}`,
      type: "string",
      isPrimaryKey: false,
      isForeignKey: false,
    });
  };

  const handleRemoveField = (idx: number) => {
    if (!currentTableId) return;

    const id = schema[idx]?.id;
    if (!id) return;
    removeField(currentTableId, id, handleSchemaErrorDisplay);
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination || !currentTableId) return;
    reorderFields(
      currentTableId,
      result.source.index,
      result.destination.index
    );
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

                      {/* Используем локальное значение */}
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
                      {/* Тип сохраняется сразу при изменении */}
                      <SelectField
                        value={localFieldTypes[field.id] || field.type}
                        options={typeOptions}
                        onChange={(val: any) =>
                          handleFieldTypeChange(field.id, val as string)
                        }
                        displayLabel={
                          field.viaFaker
                            ? getLabelByValue(field.fakerType!) +
                              " (" +
                              field.locale +
                              ")"
                            : undefined
                        }
                        disabled={field.viaFaker}
                      />
                      {/* Настройки */}
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <AdditionalSettings fieldId={field.id} />
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
