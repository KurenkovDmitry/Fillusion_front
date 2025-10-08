import React, { useState } from "react";
import { SelectField } from "./SelectField";
import { InputField } from "./InputField";
import { IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"; // Иконка для перетаскивания
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import type { DropResult } from "@hello-pangea/dnd";

const typeOptions = [
  { value: "int", label: "Integer" },
  { value: "float", label: "Float" },
  { value: "string", label: "String" },
];

interface Field {
  id: string;
  name: string;
  type: string;
}

interface SchemaMakerProps {
  schema: Field[];
  setSchema: (schema: Field[]) => void;
}

export const SchemaMaker: React.FC<SchemaMakerProps> = ({
  schema,
  setSchema,
}) => {
  const [error, setError] = useState<string>('');
  const [errClass, setErrClass] = useState<string>('zero-opacity');

  const handleFieldChange = (
    idx: number,
    key: keyof Omit<Field, "id">,
    value: string
  ) => {
    const updated = [...schema];
    updated[idx][key] = value;
    setSchema(updated);
  };

  const handleSchemaErrorDisplay = (errorMessage: string) => {
    setError(errorMessage);
    setErrClass('');
    setTimeout(() => {
      setErrClass('zero-opacity');
      setTimeout(() => setError(''), 500);
    }, 5000);
  }

  const handleAddField = () => {
    setSchema([...schema, { id: `field-${Date.now()}`, name: "", type: "int" }]);
  };

  const handleRemoveField = (idx: number) => {
    if(schema.length === 1) {
      handleSchemaErrorDisplay('(Не может быть меньше одного поля)')
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
          gridTemplateColumns: "30px 1fr 1fr 40px", // Место для иконки перетаскивания
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        <div /> {/* Пустая ячейка для выравнивания */}
        <div>Название поля <span style={{color: 'red'}} className={errClass + ' error-span'}>{error && error}</span></div>
        <div>Тип поля</div>
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
                        gridTemplateColumns: "30px 1fr 1fr 40px",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                        ...provided.draggableProps.style, // Стили от библиотеки
                      }}
                    >
                      {/* Элемент для захвата и перетаскивания */}
                      <div
                        {...provided.dragHandleProps}
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <DragIndicatorIcon sx={{ color: "#888", cursor: 'grab' }} />
                      </div>

                      {/* Ваши поля ввода */}
                      <InputField
                        name={`field_${idx}_name`}
                        value={field.name}
                        placeholder="Введите название поля"
                        onChange={(e) =>
                          handleFieldChange(idx, "name", e.target.value)
                        }
                        style={{
                          background: "#2c2c2c",
                          color: "white",
                          border: "1px solid #444",
                        }}
                      />
                      <SelectField
                        value={field.type}
                        options={typeOptions}
                        onChange={(val) => handleFieldChange(idx, "type", val)}
                      />
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
