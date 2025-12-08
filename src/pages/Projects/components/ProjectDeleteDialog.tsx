import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ProjectService } from "@services/api/ProjectService/ProjectService";
import { useState } from "react";
import { DeleteDialogState } from "../Projects";
import { Project } from "@services/api/ProjectService/ProjectService.types";

interface ProjectDeleteDialogProps {
  dialogState: DeleteDialogState;
  onClose: () => void;
  projectId?: string;
  projects: Project[];
  onSuccess?: () => void;
}

export const ProjectDeleteDialog = (props: ProjectDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = props.dialogState.open;

  const currentProject = props.projects.find(
    (v) => v.id === props.dialogState.projectId
  );

  const handleDelete = async () => {
    if (!currentProject) return;

    setIsDeleting(true);
    setError(null);

    try {
      await ProjectService.deleteProject(currentProject.id);
      props.onSuccess?.();
      props.onClose();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("Не удалось удалить проект. Попробуйте еще раз.");
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
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <div style={{ padding: "5px" }}>
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Удалить проект?
        </DialogTitle>

        <DialogContent>
          <div style={{ marginBottom: "16px" }}>
            Вы уверены, что хотите удалить проект{" "}
            <strong>{currentProject?.name}</strong>?
          </div>

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
            justifyContent: "flex-end",
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
              minWidth: "135px",
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
