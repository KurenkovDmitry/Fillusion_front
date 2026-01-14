import { Alert, Button, Dialog, DialogTitle } from "@mui/material";
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

export const IMPORT_SCHEMA_ERROR_MAP = [
  {
    match: /import schema: too many tables in SQL payload/i,
    uiMessage: "Слишком много таблиц в импортируемой схеме",
  },

  {
    match:
      /import schema: statement\[(\d+)\]: duplicate column "([^"]+)" in table "([^"]+)"/i,
    uiMessage: "В таблице найдены дубликаты колонок",
  },

  {
    match: /import schema: foreign key references unknown table "([^"]+)"/i,
    uiMessage: "Внешний ключ ссылается на несуществующую таблицу",
  },

  {
    match: /import schema: statement\[(\d+)\]: unterminated parentheses/i,
    uiMessage: "Синтаксическая ошибка SQL: не закрыта скобка",
  },

  {
    match:
      /import schema: statement\[(\d+)\]: too many columns in table "([^"]+)"/i,
    uiMessage: "Слишком много колонок в таблице",
  },

  {
    match:
      /import schema: foreign key "([^"]*)" \(([^)]+)\): referenced table "([^"]+)" has no primary key/i,
    uiMessage:
      "Ошибка внешнего ключа: таблица, на которую идёт ссылка, не содержит первичного ключа",
  },
];

// Функция маппинга ошибки
const mapImportSchemaError = (errorMessage: string): string => {
  for (const errorPattern of IMPORT_SCHEMA_ERROR_MAP) {
    if (errorPattern.match.test(errorMessage)) {
      return errorPattern.uiMessage;
    }
  }
  // Если не нашли совпадение - возвращаем оригинальное сообщение
  return errorMessage;
};

export const ImportSchemaDialog = (props: ImportSchemaDialogProps) => {
  const { projectId } = useParams();
  const [schema, setSchema] = useState("");
  const [error, setError] = useState<string | null>(null);
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
      props.onSucces();
      props.onClose();
    } catch (e) {
      console.error(e);
      const rawError =
        (e as { message: string })?.message || "Неизвестная ошибка";
      const mappedError = mapImportSchemaError(rawError);
      setError(mappedError);
    }
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="md" fullWidth>
      <DialogTitle>Импорт схемы</DialogTitle>
      {error && (
        <div style={{ paddingInline: "24px" }}>
          <Alert variant="outlined" severity="error">
            {error}
          </Alert>
        </div>
      )}
      <div style={{ paddingInline: "24px", paddingBottom: "24px" }}>
        <InputField
          label="SQL схема"
          lineCount={20}
          value={schema}
          onChange={(e) => {
            setError(null);
            setSchema(e.target.value);
          }}
          multiline
          placeholder={`Пример: 
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    group_id INTEGER REFERENCES Groups(id)
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
