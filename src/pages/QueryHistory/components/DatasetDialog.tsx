import {
  Dialog,
  DialogContent,
  Box,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { CopyButton } from "../../Generate/components/CopyButton";
import { useEffect, useState } from "react";
import { GenerateService } from "@services/api/GenerateService/GenerateService";
import { ProjectService } from "@services/api/ProjectService/ProjectService";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { DatasetsRequestResponse } from "@services/api/GenerateService/GenerateService.types";
import { SelectField } from "../../Generate/components/SelectField";
import { InputField } from "../../Generate/components/InputField";

interface DatasetDialogProps {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  requestId: string;
  projectId: string;
  status: string;
}

export interface ConnectionOptions {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

const selectOSOptions = [
  { value: "windows", label: "Windows" },
  { value: "linux", label: "Linux" },
];

const selectDBOptions = [
  { value: "DATABASE_ENGINE_POSTGRESQL", label: "PostgreSQL" },
];

export const DatasetDialog = (props: DatasetDialogProps) => {
  const [responseJson, setResponseJson] = useState("");
  const [responseObj, setResponseObj] =
    useState<DatasetsRequestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectOSValue, setSelectOSValue] = useState<"windows" | "linux">(
    "windows"
  );

  const [connectionOptions, setConnectionOptions] = useState<ConnectionOptions>(
    {
      host: "",
      port: "",
      database: "",
      username: "",
      password: "",
    }
  );

  const handleInput = (value: string, type: any) => {
    setConnectionOptions((prev) => ({ ...prev, [type]: value }));
  };

  useEffect(() => {
    if (!props.open) return;

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);

      try {
        // Используем GenerateService вместо прямого fetch
        const data = await GenerateService.getDataset(
          props.requestId,
          props.projectId
        );

        setResponseObj(data);

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
      // Используйте исправленный метод
      const blob = await GenerateService.downloadFile(
        props.requestId,
        props.projectId
      );

      // Создаем URL для Blob
      const url = window.URL.createObjectURL(blob);

      // Создаем и кликаем ссылку
      const link = document.createElement("a");
      link.href = url;
      link.download = JSON.parse(responseJson).fileName ?? "generation";
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Очищаем память
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Не удалось скачать файл");
    } finally {
      setDownloading(false);
    }
  };

  const handleAgentDownload = async () => {
    setDownloading(true);

    try {
      // Используйте исправленный метод
      const blob = await GenerateService.downloadAgent(selectOSValue);

      // Создаем URL для Blob
      const url = window.URL.createObjectURL(blob);

      // Создаем и кликаем ссылку
      const link = document.createElement("a");
      link.href = url;
      link.download = `fillusion-agent-${selectOSValue}-amd64.${
        selectOSValue === "linux" ? "tar.gz" : "zip"
      }`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Очищаем память
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDirectFill = async () => {
    try {
      await ProjectService.directFill(props.projectId, {
        ...connectionOptions,
        engine: selectDBOptions[0].value,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatResponse = (responseJson: string) => {
    if (!responseJson) {
      return responseJson;
    }
    const data = JSON.parse(responseJson);

    const { file, fileName, exportType, ...rest } = data;

    return JSON.stringify(rest, null, 2);
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
        ) : responseObj?.exportType !== "EXPORT_TYPE_DIRECT_DB" ? (
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
              <h3>Результат генерации</h3>
              {error ? (
                <div style={{ color: "#d32f2f", padding: "12px" }}>{error}</div>
              ) : responseJson ? (
                <pre>{formatResponse(responseJson)}</pre>
              ) : (
                <div style={{ color: "#666" }}>Нет данных</div>
              )}
            </Box>

            <Box display="flex" mt={1} gap="20px">
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
                sx={{
                  height: "40px",
                  color: "black",
                  border: "1px solid black",
                  fontWeight: "500",
                }}
              >
                {downloading ? "Скачивание..." : "Скачать файл"}
              </Button>

              <CopyButton textToCopy={formatResponse(responseJson)} />

              <Button
                variant="contained"
                onClick={() => props.setOpen(false)}
                sx={{ height: "40px", backgroundColor: "black" }}
              >
                Назад
              </Button>
            </Box>
          </>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <h3 style={{ marginTop: "0" }}>Прямое подключение к БД</h3>
            <div
              style={{
                display: "flex",
                padding: "20px",
                border: "1px solid #003dc2ff",
                borderRadius: "12px",
                gap: "12px",
                fontSize: "16px",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#201de02d",
              }}
            >
              <ErrorOutlineIcon />
              Для правильной работы прямого заполения необходимо скачать и
              включить агент
            </div>
            <Accordion
              sx={{
                boxShadow: "none",
                border: "1px solid black",
                "&.MuiPaper-rounded": {
                  borderRadius: "10px",
                },
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                <span style={{ fontWeight: "600" }}>Скачать агент</span>
              </AccordionSummary>
              <AccordionDetails>
                <p style={{ marginTop: "0" }}>
                  Для прямого подключения необходимо скачать клиент Fillusion
                  для вашей ОС (на данный момент гарантированно поддерживается
                  только Windows)
                </p>
                <SelectField
                  options={selectOSOptions}
                  onChange={setSelectOSValue}
                  value={selectOSValue}
                  label="Операционная система"
                />
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    height: "42px",
                    "&:hover": { backgroundColor: "#242424ff" },
                    marginTop: "16px",
                  }}
                  onClick={handleAgentDownload}
                >
                  Скачать агент Fillusion
                </Button>
              </AccordionDetails>
            </Accordion>
            <div>
              <SelectField
                options={selectDBOptions}
                onChange={() => {}}
                value={selectDBOptions[0].value}
                label="СУБД"
              />
              <InputField
                label="Хост"
                onChange={(e) => handleInput(e.target.value, "host")}
                value={connectionOptions.host}
              />
              <InputField
                label="Порт"
                onChange={(e) => handleInput(e.target.value, "port")}
                value={connectionOptions.port}
              />
              <InputField
                label="Название БД"
                onChange={(e) => handleInput(e.target.value, "database")}
                value={connectionOptions.database}
              />
              <InputField
                label="Имя пользователя"
                onChange={(e) => handleInput(e.target.value, "username")}
                value={connectionOptions.username}
              />
              <InputField
                label="Пароль"
                onChange={(e) => handleInput(e.target.value, "password")}
                value={connectionOptions.password}
              />
            </div>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "black",
                height: "42px",
                "&:hover": { backgroundColor: "#242424ff" },
                marginTop: "16px",
              }}
              onClick={handleDirectFill}
            >
              Начать прямое заполнение
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
