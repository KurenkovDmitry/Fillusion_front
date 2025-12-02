// components/Generate.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Box,
  DialogTitle,
  DialogContent,
  Snackbar,
} from "@mui/material";
import { InputField } from "./components/InputField";
import { SliderWithInput } from "./components/SliderWithinput";
import TableIcon from "@assets/table.svg?react";
import { SelectField } from "./components/SelectField";
import { SchemaMaker } from "./components/SchemaMaker";
import useSchemaStore, {
  mapTableToApiPayload,
  TableSchema,
  type SchemaField,
} from "@store/schemaStore";
import useGenerateStore, {
  type TableGenerateSettings,
} from "@store/generateStore";
import { SchemaService } from "@services/api";
import { getTableLayoutPayload } from "../DbEditor/DbEditor";
import { useShallow } from "zustand/shallow";

const SELECT_MODEL_OPTIONS = [
  { value: "deepseek", label: "Deepseek" },
  { value: "gemini", label: "Gemini" },
];

const SELECT_OUTPUT_OPTIONS = [
  { value: "EXPORT_TYPE_SNAPSHOT", label: "Snapshot" },
  { value: "EXPORT_TYPE_JSON", label: "JSON" },
  // { value: "EXPORT_TYPE_DIRECT_DB", label: "Прямое подключение" },
];

interface GenerateProps {
  projectId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const GenerateFormContent = ({
  tableId,
  projectId,
  onClose,
  error,
}: {
  tableId: string;
  projectId: string;
  onClose: () => void;
  error: string;
}) => {
  const getTableSettings = useGenerateStore((state) => state.getTableSettings);
  const settings = getTableSettings(tableId);
  const [name, setName] = useState(settings.name ?? "");
  const [query, setQuery] = useState(settings.query ?? "");
  const [examples, setExamples] = useState(settings.examples ?? "");

  const saveTableSettings = useGenerateStore(
    (state) => state.saveTableSettings
  );
  const updateTable = useSchemaStore((state) => state.updateTable);
  const table: TableSchema = useSchemaStore(
    useShallow((state) => state.tables[tableId])
  );

  useEffect(() => {
    const settings = getTableSettings(tableId);
    setName(settings.name);
    setQuery(settings.query);
    setExamples(settings.examples);
  }, [tableId, getTableSettings]);

  useEffect(() => {
    setName(table.name);
  }, [table.name]);

  // Сохранение с API запросом при blur имени таблицы
  const handleNameBlur = async () => {
    const settings = {
      name,
      query,
      examples,
    };

    saveTableSettings(tableId, settings);

    // Обновляем имя таблицы в schemaStore и на сервере
    if (name !== table?.name) {
      updateTable(tableId, { name });

      try {
        await SchemaService.updateTable(projectId, tableId, {
          ...table,
          name,
          layout: getTableLayoutPayload(table),
        });
      } catch (error) {
        console.error("Failed to update table name:", error);
      }
    }
  };

  const handleQueryBlur = () => {
    saveTableSettings(tableId, {
      name,
      query,
      examples,
    });
  };

  const handleExamplesBlur = () => {
    saveTableSettings(tableId, {
      name,
      query,
      examples,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <InputField
        label="Название таблицы"
        name="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleNameBlur}
      />
      <InputField
        label="Правила генерации"
        name="query"
        labelIcon={<TableIcon />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={handleQueryBlur}
        multiline
        placeholder="Например: name: русские имена и фамилии"
      />
      <InputField
        label="Примеры данных"
        name="examples"
        labelIcon={<TableIcon />}
        value={examples}
        onChange={(e) => setExamples(e.target.value)}
        onBlur={handleExamplesBlur}
        multiline
        placeholder='Например: { "name": "Иван Петров" }'
      />

      <SchemaMaker />

      {error && (
        <div style={{ color: "#d32f2f", fontSize: "14px", padding: "8px" }}>
          {error}
        </div>
      )}

      <Box width="100%" display="flex" justifyContent="space-between">
        <Button
          onClick={onClose}
          sx={{
            border: "1px solid #4f8cff",
            height: "40px",
            transition: "background-color 0.3s ease, color 0.3s ease",
            "&:hover": {
              backgroundColor: "#4f8cff",
              color: "white",
            },
          }}
        >
          Отмена
        </Button>
      </Box>
    </div>
  );
};

export const Generate = (props: GenerateProps) => {
  const { open, setOpen, projectId } = props;

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [error, setError] = useState("");

  const currentTable = useSchemaStore((s) => s.getCurrentTable)();
  const getTableSettings = useGenerateStore((state) => state.getTableSettings);

  const handleClose = () => {
    setOpen(false);
    if (!currentTable) return;
    const tableId = currentTable.id;
    SchemaService.updateTable(
      projectId,
      tableId,
      mapTableToApiPayload({
        ...currentTable,
        meta: getTableSettings(tableId),
        layout: getTableLayoutPayload(currentTable),
      })
    );
  };

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth onClose={handleClose}>
        <DialogTitle style={{ fontSize: 20 }}>Настройка генерации</DialogTitle>
        <DialogContent
          style={{ scrollbarWidth: "thin", scrollbarColor: "#c0c0c0ff white" }}
        >
          {currentTable && projectId && (
            <GenerateFormContent
              tableId={currentTable.id}
              projectId={projectId}
              onClose={handleClose}
              error={error}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        open={snackbar.open}
        message={snackbar.message}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#940d0dff",
            color: "white",
            fontSize: "16px",
            borderRadius: "12px",
          },
        }}
      />
    </>
  );
};
