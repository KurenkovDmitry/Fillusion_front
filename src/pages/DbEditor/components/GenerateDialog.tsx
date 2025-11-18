import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useParams } from "react-router-dom";
import useSchemaStore from "@store/schemaStore";
import useGenerateStore from "@store/generateStore";
import { GenerateService } from "@services/api/GenerateService/GenerateService";
import { useState } from "react";
import type {
  GenerateRequest,
  ColumnSchema,
} from "@services/api/GenerateService/GenerateService.types";

interface GenerateDialogProps {
  open: boolean;
  onClose: () => void;
}

export const GenerateDialog = (props: GenerateDialogProps) => {
  const { projectId } = useParams();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем данные из stores
  const tables = useSchemaStore((state) => state.tables);
  const relations = useSchemaStore((state) => state.relations);
  const getAllTables = useSchemaStore((state) => state.getAllTables);
  const getTableSettings = useGenerateStore((state) => state.getTableSettings);

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
          totalRecords: String(settings.totalRecords || 50),
          schema,
          examples: settings.examples || "",
        };
      });

      // Получаем общие настройки (берем из первой таблицы или дефолты)
      const firstTableSettings =
        allTables.length > 0
          ? getTableSettings(allTables[0].id)
          : {
              selectModelValue: "deepseek",
              selectOutputValue: "EXPORT_TYPE_JSON",
            };

      // Формируем финальный payload
      const generatePayload: GenerateRequest = {
        projectId,
        network: firstTableSettings.selectModelValue || "deepseek",
        tables: tablesData,
        exportType:
          firstTableSettings.selectOutputValue?.toUpperCase() || "JSON",
      };

      console.log("Generate payload:", generatePayload);

      // Отправляем запрос на генерацию
      const response = await GenerateService.generateData(generatePayload);

      console.log("Generation started:", response);

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
    <Dialog open={props.open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <div style={{ padding: "5px" }}>
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Начать генерацию
        </DialogTitle>

        <DialogContent>
          <div style={{ marginBottom: "16px" }}>
            Вы уверены, что хотите начать генерацию данных для всех таблиц?
          </div>

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

        <DialogActions
          sx={{
            padding: "0 24px 16px 24px",
            gap: "12px",
            justifyContent: "flex-start",
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
