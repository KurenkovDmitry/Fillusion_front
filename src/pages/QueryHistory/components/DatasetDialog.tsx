import {
  Dialog,
  DialogContent,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { CopyButton } from "../../Generate/components/CopyButton";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8085/api/v1";

interface DatasetDialogProps {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  requestId: string;
}

export const DatasetDialog = (props: DatasetDialogProps) => {
  const [responseJson, setResponseJson] = useState<any>("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!props.open) return;
    const fetchRequest = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/datasets/${props.requestId}?projectId=${
            import.meta.env.VITE_PROJECT_ID
          }`
        );
        if (!response.ok) {
          setResponseJson("Произошла ошибка при получении запроса");
          return new Error("Failed to fetch");
        }
        const data = await response.json();
        setResponseJson(data);
      } catch (e) {
        setResponseJson("Произошла ошибка при получении запроса");
        return e;
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [props.open]);
  return (
    <Dialog
      open={props.open}
      maxWidth="lg"
      fullWidth
      onClose={() => props.setOpen(false)}
    >
      <DialogContent
        style={{ scrollbarWidth: "thin", scrollbarColor: "#c0c0c0ff white" }}
      >
        {loading ? (
          <CircularProgress />
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
              {responseJson && <pre>{responseJson}</pre>}
            </Box>
            <Box display="flex" mt={1} gap={"20px"}>
              <CopyButton textToCopy={JSON.stringify(responseJson, null, 2)} />
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
