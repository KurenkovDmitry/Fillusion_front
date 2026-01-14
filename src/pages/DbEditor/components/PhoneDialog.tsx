import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

interface PhoneDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PhoneDialog = (props: PhoneDialogProps) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          width: "95%",
          margin: 0,
        },
      }}
    >
      <div style={{ padding: "5px" }}>
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Предупреждение
        </DialogTitle>

        <DialogContent>
          <div style={{ marginBottom: "8px" }}>
            В мобильной версии недоступно импортирование и редактирование схемы,
            изменение параметров и запуск генерации. Доступен только просмотр
            схемы.
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "0 12px 16px 12px",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={props.onClose}
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
            Понятно
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};
