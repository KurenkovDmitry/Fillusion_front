import {
  Dialog,
  DialogContent,
  DialogActions, // <--- Добавлен импорт
  Box,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
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
import { useNavigate } from "react-router-dom";

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
  // { value: "linux", label: "Linux" },
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

  const navigate = useNavigate();

  const handleInput = (value: string, type: any) => {
    setConnectionOptions((prev) => ({ ...prev, [type]: value }));
  };

  useEffect(() => {
    if (!props.open || props.status === "PENDING" || props.status === "ERROR")
      return;

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);

      try {
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
      const blob = await GenerateService.downloadFile(
        props.requestId,
        props.projectId
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = JSON.parse(responseJson).fileName ?? "generation";
      link.style.display = "none";

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

  const handleAgentDownload = async () => {
    setDownloading(true);

    try {
      const blob = await GenerateService.downloadAgent(selectOSValue);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fillusion-agent-${selectOSValue}-amd64.${
        selectOSValue === "linux" ? "tar.gz" : "zip"
      }`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDirectFill = async () => {
    try {
      await ProjectService.directFill(props.projectId, props.requestId, {
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

  const renderDatasetsTables = () => {
    if (!responseObj || !responseObj.datasets) {
      if (responseJson) return <pre>{formatResponse(responseJson)}</pre>;
      return <div style={{ color: "#666" }}>Нет данных</div>;
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {responseObj.datasets.map((dataset: any, idx: number) => {
          const headers =
            dataset.records.length > 0 ? Object.keys(dataset.records[0]) : [];

          return (
            <Box key={idx}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {dataset.table_name || `Table ${idx + 1}`}
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table
                  stickyHeader
                  size="small"
                  aria-label={dataset.table_name}
                >
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataset.records.map((row: any, rowIdx: number) => (
                      <TableRow hover key={rowIdx}>
                        {headers.map((header) => (
                          <TableCell key={`${rowIdx}-${header}`}>
                            {typeof row[header] === "object" &&
                            row[header] !== null
                              ? JSON.stringify(row[header])
                              : String(row[header] ?? "")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Dialog
      open={props.open}
      maxWidth={props.status === "ERROR" ? "md" : "xl"}
      fullWidth={props.status !== "PENDING"}
      onClose={() => props.setOpen(false)}
      disableScrollLock
      // Добавляем paper props для flex-layout, если понадобится тонкая настройка,
      // но обычно DialogActions работает и так.
    >
      {/* 
        Мы выносим DialogTitle и DialogActions за пределы DialogContent, 
        чтобы скролл был только у контента. 
      */}

      {/* --- Заголовок (всегда виден сверху) --- */}
      {props.status !== "PENDING" &&
        props.status !== "ERROR" &&
        responseObj?.exportType !== "EXPORT_TYPE_DIRECT_DB" && (
          <DialogTitle
            sx={{ paddingBottom: "10px", fontSize: "16px", flexShrink: 0 }}
          >
            Результат генерации
          </DialogTitle>
        )}

      <DialogContent
        sx={{
          scrollbarWidth: "thin",
          scrollbarColor: "#c0c0c0ff white",
          height: loading ? "200px" : "auto",
          transition: "height 0.2s ease",
          // dividers prop автоматически добавляет разделители при скролле
        }}
        dividers={
          !loading && props.status !== "PENDING" && props.status !== "ERROR"
        }
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
        ) : props.status === "ERROR" ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "10px 20px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Произошла ошибка при генерации</h2>
            <span>
              Во время генерации произошла ошибка. Попробуйте повторить запрос
              позже
            </span>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: "black",
                height: "42px",
                width: "fit-content",
              }}
              onClick={() => navigate(`/projects/${props.projectId}`)}
            >
              Вернуться к редактору
            </Button>
          </div>
        ) : responseObj?.exportType !== "EXPORT_TYPE_DIRECT_DB" ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {error ? (
              <div style={{ color: "#d32f2f", padding: "12px" }}>{error}</div>
            ) : (
              renderDatasetsTables()
            )}
          </Box>
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
              включить агент...
            </div>
            {/* ... accordion и инпуты ... */}
            <Accordion
              sx={{
                boxShadow: "none",
                border: "1px solid black",
                "&.MuiPaper-rounded": {
                  borderRadius: "10px",
                },
                "&.Mui-expanded": {
                  margin: 0,
                },
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                <span style={{ fontWeight: "600" }}>Скачать агент</span>
              </AccordionSummary>
              <AccordionDetails>
                <p style={{ marginTop: "0" }}>
                  Для прямого подключения необходимо скачать клиент Fillusion...
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
                type="password"
              />
            </div>
          </div>
        )}
      </DialogContent>

      {/* --- Нижняя панель с кнопками (Всегда видна) --- */}
      {props.status !== "PENDING" && props.status !== "ERROR" && (
        <DialogActions sx={{ padding: "16px 24px" }}>
          {responseObj?.exportType !== "EXPORT_TYPE_DIRECT_DB" ? (
            <Box display="flex" width="100%" gap="20px">
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

              {/* Flex-grow пушер, если нужно прижать кнопку Назад вправо, 
                  но у вас было всё слева, поэтому оставляем как есть или добавляем Spacer */}
              <Box flexGrow={0} />

              <Button
                variant="contained"
                onClick={() => props.setOpen(false)}
                sx={{ height: "40px", backgroundColor: "black" }}
              >
                Назад
              </Button>
            </Box>
          ) : (
            // Кнопка для режима Direct Fill (тоже вынесена вниз, чтобы не уезжала)
            <Button
              variant="contained"
              sx={{
                backgroundColor: "black",
                height: "42px",
                "&:hover": { backgroundColor: "#242424ff" },
                width: "100%", // или как вам удобнее по дизайну
              }}
              onClick={handleDirectFill}
            >
              Начать прямое заполнение
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};
