import React, { useState } from "react";
import { SelectField } from "./SelectField";
import { InputField } from "./InputField";
import { IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { AdditionalSettings } from "./AdditionalSettings";

const typeOptions = [
  { value: "string", label: "String" },
  { value: "int", label: "Integer" },
  { value: "float", label: "Float" },
];

// Обновленный интерфейс для поддержки всех полей
interface Field {
  id: string;
  name: string;
  type: string;
  unique: boolean;
  autoIncrement: boolean;
}

interface SchemaMakerProps {
  schema: Field[];
  setSchema: (schema: Field[]) => void;
}

export const SchemaMaker: React.FC<SchemaMakerProps> = ({
  schema,
  setSchema,
}) => {
  const [error, setError] = useState<string>("");
  const [errClass, setErrClass] = useState<string>("zero-opacity");

  // Обновленная функция для обработки всех типов значений
  const handleFieldChange = (
    idx: number,
    key: keyof Omit<Field, "id">,
    value: string | boolean
  ) => {
    const updated = [...schema];
    (updated[idx] as any)[key] = value;
    setSchema(updated);
  };

  const handleSchemaErrorDisplay = (errorMessage: string) => {
    setError(errorMessage);
    setErrClass("");
    setTimeout(() => {
      setErrClass("zero-opacity");
      setTimeout(() => setError(""), 500);
    }, 5000);
  };

  const handleAddField = () => {
    setSchema([
      ...schema,
      {
        id: `field-${Date.now()}`,
        name: "",
        type: "string",
        unique: false,
        autoIncrement: false,
      },
    ]);
  };

  const handleRemoveField = (idx: number) => {
    if (schema.length === 1) {
      handleSchemaErrorDisplay("(Не может быть меньше одного поля)");
      return;
    }
    const updated = schema.filter((_, i) => i !== idx);
    setSchema(updated);
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(schema);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSchema(items);
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "30px 1fr 1fr 90px 40px",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        <div />
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
                        gridTemplateColumns: "30px 1fr 1fr 90px 40px",
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

                      <InputField
                        name={`field_${idx}_name`}
                        value={field.name}
                        placeholder="Введите название поля"
                        onChange={(e) =>
                          handleFieldChange(idx, "name", e.target.value)
                        }
                        useFormik={false}
                      />

                      <SelectField
                        value={field.type}
                        options={typeOptions}
                        onChange={(val) =>
                          handleFieldChange(idx, "type", val as string)
                        }
                      />

                      {/* Настройки */}
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <AdditionalSettings />
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
