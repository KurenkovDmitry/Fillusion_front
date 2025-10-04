import React from "react";
import { SelectField } from "./SelectField";
import { InputField } from "./InputField";
import { IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const typeOptions = [
  { value: "int", label: "Integer" },
  { value: "float", label: "Float" },
  { value: "string", label: "String" },
];

interface Field {
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
  const handleFieldChange = (idx: number, key: keyof Field, value: string) => {
    const updated = [...schema];
    updated[idx][key] = value;
    setSchema(updated);
  };

  const handleAddField = () => {
    setSchema([...schema, { name: "", type: "int" }]);
  };

  const handleRemoveField = (idx: number) => {
    const updated = schema.filter((_, i) => i !== idx);
    setSchema(updated.length ? updated : [{ name: "", type: "int" }]);
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 40px",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        <div>Название поля</div>
        <div>Тип поля</div>
        <div></div>
      </div>
      {schema.map((field, idx) => (
        <div
          key={idx}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 40px",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <InputField
            name={`field_${idx}_name`}
            value={field.name}
            placeholder="Введите название поля"
            onChange={(e) => handleFieldChange(idx, "name", e.target.value)}
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
            sx={{ color: "#d32f2f", marginLeft: "4px" }}
            aria-label="Удалить поле"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ))}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddField}
        sx={{
          marginTop: "12px",
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
