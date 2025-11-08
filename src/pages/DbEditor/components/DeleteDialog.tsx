import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useParams } from "react-router-dom";
import useSchemaStore from "@store/schemaStore";
import { SchemaService } from "@services/api/SchemaService/SchemaService";
import { useState } from "react";

interface DeleteDialogProps {
  tableId: string;
  tableName?: string; // Опционально: имя таблицы для отображения
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback после успешного удаления
}

export const DeleteDialog = (props: DeleteDialogProps) => {
  const { projectId } = useParams();
  const removeTable = useSchemaStore((state) => state.removeTable);
  const table = useSchemaStore((state) => state.tables[props.tableId]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!projectId) return;

    setIsDeleting(true);
    setError(null);

    try {
      await SchemaService.deleteTable(projectId, props.tableId);
      removeTable(props.tableId);
      props.onSuccess?.();
      props.onClose();
    } catch (err) {
      console.error("Failed to delete table:", err);
      setError("Не удалось удалить таблицу. Попробуйте еще раз.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
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
          Удалить таблицу?
        </DialogTitle>

        <DialogContent>
          <div style={{ marginBottom: "16px" }}>
            Вы уверены, что хотите удалить таблицу{" "}
            <strong>{props.tableName || table?.name || "без имени"}</strong>?
          </div>

          {table && table.fields.length > 0 && (
            <div
              style={{ color: "#aaa", fontSize: "16px", marginBottom: "8px" }}
            >
              Будут удалены {table.fields.length}{" "}
              {table.fields.length === 1 ? "поле" : "полей"}.
            </div>
          )}

          <div style={{ color: "#f44336", fontSize: "16px" }}>
            Это действие нельзя будет отменить.
          </div>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                border: "1px solid #d32f2f",
                borderRadius: "4px",
                color: "#f44336",
                fontSize: "16px",
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
            disabled={isDeleting}
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
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              textTransform: "none",
              fontSize: "14px",
              padding: "8px 20px",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
              "&:disabled": {
                backgroundColor: "#666",
                color: "#999",
              },
            }}
          >
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};
