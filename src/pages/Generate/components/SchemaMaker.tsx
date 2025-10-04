import { useState } from "react";
import { SelectField } from "./SelectField";
import { InputField } from "./InputField";
import { IconButton, Button } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const typeOptions = [
    { value: "int", label: "Integer" },
    { value: "float", label: "Float" },
    { value: "string", label: "String" },
];

const initialFields = [
    { name: "", type: "full_name" },
];

export const SchemaMaker = () => {
    const [fields, setFields] = useState(initialFields);

    const handleFieldChange = (idx: number, key: "name" | "type", value: string) => {
        const updated = [...fields];
        updated[idx][key] = value;
        setFields(updated);
    };

    const handleAddField = () => {
        setFields([...fields, { name: "", type: "full_name" }]);
    };

    const handleRemoveField = (idx: number) => {
        const updated = fields.filter((_, i) => i !== idx);
        setFields(updated.length ? updated : initialFields);
    };

    return (
        <div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 40px",
                alignItems: "center",
                gap: "12px"
            }}>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>Название поля</div>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>Тип поля</div>
                <div></div>
            </div>
            {fields.map((field, idx) => (
                <div
                    key={idx}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 40px",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px"
                    }}
                >
                    <InputField
                        name={`field_${idx}_name`}
                        value={field.name}
                        placeholder="Введите название поля"
                        inputIcon={null}
                        onChange={e => handleFieldChange(idx, "name", e.target.value)}
                        style={{
                            background: "#2c2c2c",
                            color: "white",
                            border: "1px solid #444",
                        }}
                    />
                    <SelectField
                        value={field.type}
                        options={typeOptions}
                        onChange={val => handleFieldChange(idx, "type", val)}
                    />
                    <IconButton
                        size="small"
                        onClick={() => handleRemoveField(idx)}
                        sx={{
                            color: "#d32f2f",
                            marginLeft: "4px"
                        }}
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
                    '&:hover': {
                        background: "#3a6fd8"
                    }
                }}
            >
                Добавить поле
            </Button>
        </div>
    );
};