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
import useSchemaStore, { type SchemaField } from "@store/schemaStore";
import useGenerateStore from "@store/generateStore";
import { SchemaService } from "@services/api";
import { getTableLayoutPayload } from "../DbEditor/DbEditor";

const SELECT_MODEL_OPTIONS = [
  { value: "deepseek", label: "Deepseek" },
  { value: "gemini", label: "Gemini" },
];

const SELECT_OUTPUT_OPTIONS = [
  { value: "EXPORT_TYPE_JSON", label: "JSON" },
  { value: "EXPORT_TYPE_SNAPSHOT", label: "Snapshot" },
  { value: "EXPORT_TYPE_DIRECT_DB", label: "Прямое подключение" },
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
  onSubmit,
  loading,
  error,
}: {
  tableId: string;
  projectId: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  error: string;
}) => {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(50);
  const [examples, setExamples] = useState("");
  const [selectModelValue, setSelectModelValue] = useState("deepseek");
  const [selectOutputValue, setSelectOutputValue] =
    useState("EXPORT_TYPE_JSON");

  const getTableSettings = useGenerateStore((state) => state.getTableSettings);
  const saveTableSettings = useGenerateStore(
    (state) => state.saveTableSettings
  );
  const updateTable = useSchemaStore((state) => state.updateTable);
  const tables = useSchemaStore((state) => state.tables);

  useEffect(() => {
    const settings = getTableSettings(tableId);
    setName(settings.name);
    setQuery(settings.query);
    setTotalRecords(settings.totalRecords);
    setExamples(settings.examples);
    setSelectModelValue(settings.selectModelValue);
    setSelectOutputValue(settings.selectOutputValue);
  }, [tableId, getTableSettings]);

  // ✅ Сохранение с API запросом при blur имени таблицы
  const handleNameBlur = async () => {
    const settings = {
      name,
      query,
      totalRecords,
      examples,
      selectModelValue,
      selectOutputValue,
    };

    saveTableSettings(tableId, settings);

    // ✅ Обновляем имя таблицы в schemaStore и на сервере
    if (name !== tables[tableId]?.name) {
      updateTable(tableId, { name });

      try {
        const table = tables[tableId];
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
        {/* <Button
          onClick={onSubmit}
          disabled={!isValid || loading}
          variant="contained"
          sx={{ height: "40px" }}
        >
          {loading ? "Загрузка..." : "Начать генерацию"}
        </Button> */}
      </Box>
    </div>
  );
};

export const Generate = (props: GenerateProps) => {
  const { open, setOpen, projectId } = props;

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [responseJson, setResponseJson] = useState<JSON | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tables = useSchemaStore((state) => state.tables);
  const relations = useSchemaStore((state) => state.relations);
  const currentTable = useSchemaStore().getCurrentTable();
  const getTableSettings = useGenerateStore((state) => state.getTableSettings);

  const handleClose = () => {
    setOpen(false);
    setResponseJson(null);
  };

  const handleFormSubmit = async () => {
    if (!currentTable || !projectId) return;

    // ✅ Проверяем что все поля заполнены
    const emptyNameField = currentTable.fields.find(
      (field) => !field.name.trim()
    );

    if (emptyNameField) {
      setError("Все поля 'Название' должны быть заполнены");
      setSnackbar({
        open: true,
        message: "Все поля 'Название' должны быть заполнены",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ Берём значения из generateStore
      const settings = getTableSettings(currentTable.id);

      // ✅ Форматируем схему для API
      const formattedSchema = currentTable.fields.map((field) => {
        const schemaField: any = {
          name: field.name,
          type: field.type,
          unique: field.unique || false,
          autoIncrement: field.autoIncrement || false,
          viaFaker: field.viaFaker || false,
          isPk: field.isPrimaryKey || false,
          isFk: false,
        };

        if (field.viaFaker) {
          schemaField.fakerType = field.fakerType || "COLUMN_TYPE_UNSPECIFIED";
          schemaField.locale = field.locale || "LOCALE_UNSPECIFIED";
        }

        // ✅ Проверяем является ли поле FK через relations
        const relatedRelation = Object.values(relations).find(
          (rel) => rel.toTable === currentTable.id && rel.toField === field.id
        );

        if (relatedRelation) {
          schemaField.isFk = true;
          schemaField.fkData = {
            table: tables[relatedRelation.fromTable]?.name,
            column: tables[relatedRelation.fromTable]?.fields.find(
              (f) => f.id === relatedRelation.fromField
            )?.name,
            unique: false,
          };
        }

        return schemaField;
      });

      // ✅ Формируем запрос для генерации
      const generateRequest = {
        projectId,
        network: settings.selectModelValue,
        tables: [
          {
            name: settings.name || currentTable.name,
            query: settings.query.trim(),
            totalRecords: String(settings.totalRecords),
            schema: formattedSchema,
            examples: settings.examples.trim() || "",
          },
        ],
        exportType: settings.selectOutputValue.toUpperCase(),
      };

      console.log("Generate request:", generateRequest);

      // ✅ Отправляем запрос на генерацию (замените на ваш метод API)
      // const response = await SchemaService.generateData(generateRequest);
      // const data = await response.json();
      // setResponseJson(data);

      // Временная заглушка
      setResponseJson({ success: true } as any);
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
        {!responseJson && (
          <DialogTitle style={{ fontSize: 20 }}>
            Настройка генерации
          </DialogTitle>
        )}
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
          ) : currentTable && projectId ? (
            <GenerateFormContent
              tableId={currentTable.id}
              projectId={projectId}
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
