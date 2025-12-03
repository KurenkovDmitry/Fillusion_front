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
import TableIcon from "@assets/table.svg?react";
import { SchemaMaker } from "./components/SchemaMaker";
import useSchemaStore, {
  mapTableToApiPayload,
  TableSchema,
} from "@store/schemaStore";
import useGenerateStore from "@store/generateStore";
import { SchemaService } from "@services/api";
import { getTableLayoutPayload } from "../DbEditor/DbEditor";
import { useShallow } from "zustand/shallow";
import { SliderWithInput } from "./components/SliderWithinput";

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
  setSnackbar,
}: {
  tableId: string;
  projectId: string;
  onClose: () => void;
  error: string;
  setSnackbar: any;
}) => {
  const getTableSettings = useGenerateStore((state) => state.getTableSettings);
  const settings = getTableSettings(tableId);
  const isFakerOnly = useSchemaStore((state) =>
    state.isTableGeneratedWithFaker(tableId)
  );
  const [name, setName] = useState(settings.name ?? "");
  const [query, setQuery] = useState(settings.query ?? "");
  const [totalRecords, setTotalRecords] = useState(
    settings.totalRecords ? settings.totalRecords : isFakerOnly ? 50 : 10
  );
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
      totalRecords,
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

  const saveToServer = () => {
    SchemaService.updateTable(
      projectId,
      tableId,
      mapTableToApiPayload({
        ...table,
        meta: getTableSettings(tableId),
        layout: getTableLayoutPayload(table),
      })
    );
  };

  const handleQueryBlur = () => {
    saveTableSettings(tableId, {
      name,
      query,
      totalRecords,
      examples,
    });
  };

  const handleExamplesBlur = () => {
    saveTableSettings(tableId, {
      name,
      query,
      totalRecords,
      examples,
    });
  };

  const handleTotalRecordsChange = (value: number) => {
    setTotalRecords(value);
    saveTableSettings(tableId, {
      name,
      query,
      totalRecords: value,
      examples,
    });
  };

  useEffect(() => {
    if (!isFakerOnly && totalRecords > 10) {
      handleTotalRecordsChange(10);
    }
  }, [isFakerOnly, totalRecords]);

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
      <SliderWithInput
        label="Количество строк"
        value={totalRecords}
        min={1}
        max={isFakerOnly ? 100 : 10}
        onChange={(value) => {
          handleTotalRecordsChange(value);
        }}
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
        <Button
          onClick={() => {
            saveToServer();
            setSnackbar({ open: true, message: "🗸 Изменения сохранены" });
          }}
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
          Сохранить изменения
        </Button>
      </Box>
    </div>
  );
};

export const Generate = (props: GenerateProps) => {
  const { open, setOpen, projectId } = props;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "error",
  });
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
              setSnackbar={setSnackbar}
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
            backgroundColor:
              snackbar.variant === "error" ? "#940d0dff" : "#4f8cff",
            color: "white",
            fontSize: "16px",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
          },
        }}
      />
    </>
  );
};
