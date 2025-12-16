import { Button, Dialog, DialogTitle } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { InputField } from "../../Generate/components/InputField";
import { SchemaService } from "@services/api";
import { ImportSchemaPayload } from "@services/api/SchemaService/SchemaService.types";
import useSchemaStore from "@store/schemaStore";

interface ImportSchemaDialogProps {
  open: boolean;
  onClose: () => void;
  onSucces: () => void;
}

export const ImportSchemaDialog = (props: ImportSchemaDialogProps) => {
  const { projectId } = useParams();
  const [schema, setSchema] = useState("");
  const loadFromApi = useSchemaStore((state) => state.loadFromApi);

  const handleSchemaImport = async () => {
    if (!projectId || !schema) return;

    const payload: ImportSchemaPayload = {
      replace_existing: true,
      sql: schema,
    };

    try {
      const newSchema = await SchemaService.importSchema(projectId, payload);
      loadFromApi(newSchema);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="md" fullWidth>
      <DialogTitle>Импорт схемы</DialogTitle>
      <div style={{ paddingInline: "24px", paddingBottom: "24px" }}>
        <InputField
          label="SQL схема"
          lineCount={20}
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          multiline
          placeholder={`Пример: 
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    group_id REFERENCES Groups(id)
  );

  CREATE TABLE IF NOT EXISTS Groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`}
        />
        <Button
          variant="contained"
          sx={{
            height: "38px",
            mt: "16px",
            borderRadius: "10px",
            backgroundColor: "black",
            "&:hover": {
              backgroundColor: "#2c2c2cff",
            },
          }}
          onClick={handleSchemaImport}
        >
          Импортировать схему
        </Button>
      </div>
    </Dialog>
  );
};
