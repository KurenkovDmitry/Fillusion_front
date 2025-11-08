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
import { generateData } from "./actions/Generate.actions";
import useSchemaStore, { type SchemaField } from "@store/schemaStore";
import useGenerateStore from "@store/generateStore";

const SELECT_MODEL_OPTIONS = [
  { value: "deepseek", label: "Deepseek" },
  { value: "gemini", label: "Gemini" },
];

const SELECT_OUTPUT_OPTIONS = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "sql", label: "SQL" },
];

interface GenerateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const GenerateFormContent = ({
  tableId,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  tableId: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  error: string;
}) => {
  // Локальные стейты для быстрой печати
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(50);
  const [examples, setExamples] = useState("");
  const [selectModelValue, setSelectModelValue] = useState("deepseek");
  const [selectOutputValue, setSelectOutputValue] = useState("json");

  const getTableSettings = useGenerateStore((state) => state.getTableSettings);
  const saveTableSettings = useGenerateStore(
    (state) => state.saveTableSettings
  );

  // Загружаем значения из store при открытии
  useEffect(() => {
    const settings = getTableSettings(tableId);
    setName(settings.name);
    setQuery(settings.query);
    setTotalRecords(settings.totalRecords);
    setExamples(settings.examples);
    setSelectModelValue(settings.selectModelValue);
    setSelectOutputValue(settings.selectOutputValue);
  }, [tableId, getTableSettings]);

  // Сохраняем в store при blur (для каждого поля)
  const handleNameBlur = () => {
    saveTableSettings(tableId, {
      name,
      query,
      totalRecords,
      examples,
      selectModelValue,
      selectOutputValue,
    });
  };

  const handleQueryBlur = () => {
    saveTableSettings(tableId, {
      name,
      query,
      totalRecords,
      examples,
      selectModelValue,
      selectOutputValue,
    });
  };

  const handleExamplesBlur = () => {
    saveTableSettings(tableId, {
      name,
      query,
      totalRecords,
      examples,
      selectModelValue,
      selectOutputValue,
    });
  };

  const isValid =
    query.trim().length > 0 && totalRecords >= 1 && totalRecords <= 100;

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
        required
      />
      <SliderWithInput
        label="Количество строк"
        value={totalRecords}
        min={1}
        max={100}
        onChange={(value) => {
          setTotalRecords(value);
          // Сохраняем сразу при изменении slider
          saveTableSettings(tableId, {
            name,
            query,
            totalRecords: value,
            examples,
            selectModelValue,
            selectOutputValue,
          });
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
      <SelectField
        label="Модель для генерации"
        value={selectModelValue}
        options={SELECT_MODEL_OPTIONS}
        onChange={(val: string) => {
          const newValue = val;
          setSelectModelValue(newValue);
          saveTableSettings(tableId, {
            name,
            query,
            totalRecords,
            examples,
            selectModelValue: newValue,
            selectOutputValue,
          });
        }}
      />
      <SelectField
        label="Тип выходных данных"
        value={selectOutputValue}
        options={SELECT_OUTPUT_OPTIONS}
        onChange={(val: string) => {
          const newValue = val;
          setSelectOutputValue(newValue);
          // Сохраняем сразу при изменении
          saveTableSettings(tableId, {
            name,
            query,
            totalRecords,
            examples,
            selectModelValue,
            selectOutputValue: newValue,
          });
        }}
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
          onClick={onSubmit}
          disabled={!isValid || loading}
          variant="contained"
          sx={{ height: "40px" }}
        >
          {loading ? "Загрузка..." : "Начать генерацию"}
        </Button>
      </Box>
    </div>
  );
};

export const Generate = (props: GenerateProps) => {
  const { open, setOpen } = props;

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [responseJson, setResponseJson] = useState<JSON | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const schema = useSchemaStore((state) => state.tables);
  const currentTable = useSchemaStore().getCurrentTable();
  const getTableSettings = useGenerateStore((state) => state.getTableSettings);

  const handleClose = () => {
    setOpen(false);
    setResponseJson(null);
  };

  const handleFormSubmit = async () => {
    if (!currentTable) return;

    const schemaArray = Object.values(schema).flatMap(
      (table: any) => table?.fields || []
    );

    const emptyNameField = (schemaArray as SchemaField[]).find(
      (field) => !field.name.trim()
    );

    if (emptyNameField) {
      setSnackbar({
        open: true,
        message: "Все поля 'Название' должны быть заполнены",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Берём значения из store
      const settings = getTableSettings(currentTable.id);

      const dto = {
        projectId: import.meta.env.VITE_PROJECT_ID,
        query: settings.query.trim(),
        network: settings.selectModelValue,
        totalRecords: String(settings.totalRecords),
        schema: schemaArray.map(({ id, ...rest }: SchemaField) => rest),
        examples: settings.examples.trim() || undefined,
      };

      const response = await generateData(dto);

      const data = await response;
      setResponseJson(data);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      setSnackbar({
        open: true,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth onClose={handleClose}>
        <DialogTitle style={{ fontSize: 20 }}>
          {responseJson ? "Результат генерации" : "Настройка генерации"}
        </DialogTitle>
        <DialogContent
          style={{ scrollbarWidth: "thin", scrollbarColor: "#c0c0c0ff white" }}
        >
          {responseJson ? (
            <>
              <h1>Запрос отправлен!</h1>
              <h3>
                Посмотреть результат можно будет на странице истории запросов
              </h3>
            </>
          ) : currentTable ? (
            <GenerateFormContent
              tableId={currentTable.id}
              onClose={handleClose}
              onSubmit={handleFormSubmit}
              loading={loading}
              error={error}
            />
          ) : null}
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
