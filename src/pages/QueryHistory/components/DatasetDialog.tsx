import {
  Dialog,
  DialogContent,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { CopyButton } from "../../Generate/components/CopyButton";
import { useEffect, useState } from "react";
import { GenerateService } from "@services/api/GenerateService/GenerateService";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

interface DatasetDialogProps {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  requestId: string;
  status: string;
}

export const DatasetDialog = (props: DatasetDialogProps) => {
  const [responseJson, setResponseJson] = useState<any>("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.open) return;

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);

      try {
        // Используем GenerateService вместо прямого fetch
        const data = await GenerateService.getDataset(
          props.requestId,
          import.meta.env.VITE_PROJECT_ID
        );

        setResponseJson(JSON.stringify(data, null, 2));
      } catch (e) {
        console.error("Failed to fetch dataset:", e);
        setError("Произошла ошибка при получении запроса");
        setResponseJson("");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [props.open, props.requestId]);

  // Функция скачивания файла
  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      // Получаем файл через API
      const response = await GenerateService.downloadFile(
        props.requestId,
        import.meta.env.VITE_PROJECT_ID
      );

      // Если ваш API возвращает URL файла
      if (typeof response === "string" || (response as any).url) {
        const downloadUrl =
          typeof response === "string" ? response : (response as any).url;

        // Скачиваем через прямую ссылку
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `dataset-${props.requestId}.csv`; // или получите имя из response
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Если ваш API возвращает blob напрямую
      // (нужно модифицировать apiGeneratorClient для поддержки blob)
      const blob = response as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dataset-${props.requestId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Не удалось скачать файл");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      maxWidth="lg"
      fullWidth={props.status !== "PENDING"}
      onClose={() => props.setOpen(false)}
    >
      <DialogContent
        style={{ scrollbarWidth: "thin", scrollbarColor: "#c0c0c0ff white" }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : props.status === "PENDING" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 20px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Генерация еще не завершилась</h2>
            <PendingActionsIcon sx={{ width: "100px", height: "100px" }} />
          </div>
        ) : (
          <>
            <Box
              sx={{
                fontFamily: "monospace",
                fontSize: "15px",
                maxHeight: "60vh",
                overflowY: "auto",
                scrollbarWidth: "thin",
              }}
            >
              <h3>Запрос</h3>
              {error ? (
                <div style={{ color: "#d32f2f", padding: "12px" }}>{error}</div>
              ) : responseJson ? (
                <pre>{responseJson}</pre>
              ) : (
                <div style={{ color: "#666" }}>Нет данных</div>
              )}
            </Box>

            <Box display="flex" mt={1} gap="20px">
              {/* Кнопка скачивания файла */}
              <Button
                variant="outlined"
                startIcon={
                  downloading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DownloadIcon />
                  )
                }
                onClick={handleDownload}
                disabled={downloading || loading}
                sx={{ height: "40px" }}
              >
                {downloading ? "Скачивание..." : "Скачать файл"}
              </Button>

              <CopyButton textToCopy={responseJson} />

              <Button
                variant="contained"
                onClick={() => props.setOpen(false)}
                sx={{ height: "40px" }}
              >
                Назад
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
