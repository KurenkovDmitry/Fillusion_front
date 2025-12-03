import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import { useParams } from "react-router-dom";
import useSchemaStore from "@store/schemaStore";
import useGenerateStore from "@store/generateStore";
import { GenerateService } from "@services/api/GenerateService/GenerateService";
import { useEffect, useState } from "react";
import type {
  GenerateRequest,
  ColumnSchema,
} from "@services/api/GenerateService/GenerateService.types";
import { SliderWithInput } from "../../Generate/components/SliderWithinput";
import { SelectField } from "../../Generate/components/SelectField";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { AnimatePresence, motion } from "framer-motion";

interface GenerateDialogProps {
  open: boolean;
  onClose: () => void;
}

type SelectModelType = "deepseek" | "gemini";
type SelectOutputType =
  | "EXPORT_TYPE_SNAPSHOT"
  | "EXPORT_TYPE_JSON"
  | "EXPORT_TYPE_EXCEL"
  | "EXPORT_TYPE_DIRECT_DB";

const SELECT_MODEL_OPTIONS = [
  { value: "deepseek", label: "Deepseek" },
  { value: "gemini", label: "Gemini" },
];

const SELECT_OUTPUT_OPTIONS = [
  { value: "EXPORT_TYPE_SNAPSHOT", label: "Snapshot" },
  { value: "EXPORT_TYPE_JSON", label: "JSON" },
  { value: "EXPORT_TYPE_EXCEL", label: "Excel" },
  { value: "EXPORT_TYPE_DIRECT_DB", label: "Прямое подключение" },
];

export const GenerateDialog = (props: GenerateDialogProps) => {
  const { projectId } = useParams();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectModelValue, setSelectModelValue] =
    useState<SelectModelType>("deepseek");
  const [selectOutputValue, setSelectOutputValue] = useState<SelectOutputType>(
    "EXPORT_TYPE_SNAPSHOT"
  );
  // Получаем данные из stores
  const tables = useSchemaStore((state) => state.tables);
  const relations = useSchemaStore((state) => state.relations);
  const getAllTables = useSchemaStore((state) => state.getAllTables);
  const getTableSettings = useGenerateStore((state) => state.getTableSettings);
  // 1. Подписываемся сразу на результат вычисления (boolean)
  const isFakerOnly = useSchemaStore((state) =>
    state.isEveryFieldGeneratedWithFaker()
  );

  const handleGenerate = async () => {
    if (!projectId) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Получаем все таблицы
      const allTables = getAllTables();

      // Маппим таблицы в формат API
      const tablesData = allTables.map((table) => {
        // Получаем настройки генерации для таблицы
        const settings = getTableSettings(table.id);

        // Форматируем схему полей
        const schema: ColumnSchema[] = table.fields.map((field) => {
          const columnSchema: ColumnSchema = {
            name: field.name.toLowerCase(),
            type: field.type,
            unique: field.unique || false,
            autoIncrement: field.autoIncrement || false,
            viaFaker: field.viaFaker || false,
            fakerType: field.viaFaker
              ? field.fakerType || "COLUMN_TYPE_UNSPECIFIED"
              : "COLUMN_TYPE_UNSPECIFIED",
            locale: field.viaFaker
              ? field.locale || "LOCALE_UNSPECIFIED"
              : "LOCALE_UNSPECIFIED",
            isPk: field.isPrimaryKey || false,
            isFk: false,
          };

          // Проверяем является ли поле FK через relations
          const relatedRelation = Object.values(relations).find(
            (rel) => rel.toTable === table.id && rel.toField === field.id
          );

          if (relatedRelation) {
            const referencedTable = tables[relatedRelation.fromTable];
            const referencedField = referencedTable?.fields.find(
              (f) => f.id === relatedRelation.fromField
            );

            columnSchema.isFk = true;
            columnSchema.fkData = {
              table: referencedTable?.name || "",
              column: referencedField?.name || "",
              unique: false,
            };
          }

          return columnSchema;
        });

        return {
          name: settings.name || table.name,
          query: settings.query || "",
          totalRecords: String(settings.totalRecords),
          schema,
          examples: settings.examples || "",
        };
      });

      // Получаем общие настройки (берем из первой таблицы или дефолты)
      const firstTableSettings = {
        selectModelValue: selectModelValue,
        selectOutputValue: selectOutputValue,
      };

      // Формируем финальный payload
      const generatePayload: GenerateRequest = {
        projectId,
        network: firstTableSettings.selectModelValue || "deepseek",
        tables: tablesData,
        exportType:
          firstTableSettings.selectOutputValue?.toUpperCase() || "JSON",
      };

      // Отправляем запрос на генерацию
      await GenerateService.generateData(generatePayload);

      // Закрываем диалог после успешного запуска
      props.onClose();

      // Можно показать уведомление об успехе
      // showNotification("Генерация данных запущена!");
    } catch (err) {
      console.error("Generation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось запустить генерацию данных"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    if (!isGenerating) {
      setError(null);
      props.onClose();
    }
  };

  return (
    <Dialog open={props.open} onClose={handleCancel} maxWidth="md" fullWidth>
      <div style={{ paddingBottom: "0px" }}>
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            paddingBottom: "0px",
          }}
        >
          Начать генерацию
        </DialogTitle>

        <DialogContent sx={{ paddingBottom: 0 }}>
          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "4px",
                color: "#c00",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}
        </DialogContent>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "20px 24px",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px" }}>
            Завершите настройку и начните генерацию
          </p>
          {!isFakerOnly && (
            <SelectField
              label="Модель для генерации"
              value={selectModelValue}
              options={SELECT_MODEL_OPTIONS}
              onChange={(val: string) => {
                setSelectModelValue(val as SelectModelType);
              }}
            />
          )}
          <SelectField
            label="Тип выходных данных"
            value={selectOutputValue}
            options={SELECT_OUTPUT_OPTIONS}
            onChange={(val: string) => {
              setSelectOutputValue(val as SelectOutputType);
            }}
          />
          <AnimatePresence mode="wait">
            {selectOutputValue === "EXPORT_TYPE_DIRECT_DB" && (
              <motion.div
                key="warning-box"
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  marginTop: 8,
                  transition: {
                    height: { duration: 0.3, ease: "easeOut" },
                    marginTop: { duration: 0.3, ease: "easeOut" },
                    opacity: { delay: 0.3, duration: 0.2 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  marginTop: 0,
                  transition: {
                    opacity: { duration: 0.2 },
                    height: { delay: 0.2, duration: 0.3, ease: "easeInOut" },
                    marginTop: { delay: 0.2, duration: 0.3 },
                  },
                }}
                style={{ overflow: "hidden" }}
                viewport={{ once: true }}
              >
                <div
                  style={{
                    display: "flex",
                    padding: "20px",
                    border: "1px solid black",
                    borderRadius: "12px",
                    gap: "12px",
                    fontSize: "16px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ErrorOutlineIcon />
                  При выборе прямого подключения вам нужно будет скачать агент
                  Fillusion в истории запросов
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogActions
          sx={{
            padding: "0 24px 16px 24px",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleCancel}
            disabled={isGenerating}
            sx={{
              color: "#000",
              border: "1px solid #666",
              textTransform: "none",
              fontSize: "14px",
              padding: "8px 20px",
              "&:hover": {
                backgroundColor: "#333",
                color: "#fff",
                border: "1px solid #999",
              },
            }}
          >
            Отмена
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="contained"
            sx={{
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              padding: "8px 20px",
              "&:disabled": {
                backgroundColor: "#666",
                color: "#999",
              },
            }}
          >
            {isGenerating ? "Запуск генерации..." : "Начать генерацию"}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};
