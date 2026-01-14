import { Chip } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import UpdateIcon from "@mui/icons-material/Update";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

type ExportType =
  | "EXPORT_TYPE_JSON"
  | "EXPORT_TYPE_SNAPSHOT"
  | "EXPORT_TYPE_DIRECT_DB"
  | "EXPORT_TYPE_EXCEL"
  | "EXPORT_TYPE_UNSPECIFIED";

type Status = "PENDING" | "SUCCESS" | "ERROR";

interface QueryButtonProps {
  requsetId: string;
  query: string;
  network: string;
  totalRecords: string;
  last?: boolean;
  doneTablesCount: string;
  status: Status;
  exportType: ExportType;
  createdAt: string;
  queuePosition?: number;
  onClick?: () => void;
}

const sx = { width: "18px" };

const getStatusLabel = (status: Status) =>
  status === "PENDING"
    ? "В процессе генерации"
    : status === "SUCCESS"
    ? "Генерация завершена"
    : status === "ERROR"
    ? "Ошибка генерации"
    : status;

const getExportTypeLabel = (exportType: ExportType) =>
  exportType === "EXPORT_TYPE_DIRECT_DB"
    ? "Прямое подключение"
    : exportType === "EXPORT_TYPE_EXCEL"
    ? "Excel"
    : exportType === "EXPORT_TYPE_JSON"
    ? "JSON"
    : exportType === "EXPORT_TYPE_SNAPSHOT"
    ? "Снапшот БД"
    : exportType;

const getStatusIcon = (status: Status) =>
  status === "PENDING" ? (
    <UpdateIcon sx={sx} />
  ) : status === "ERROR" ? (
    <ErrorOutlineIcon sx={sx} />
  ) : (
    <DoneIcon sx={sx} />
  );

function beautifyUpdatedAt(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} мин назад`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ч назад`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} дн назад`;

  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const QueryButton = (props: QueryButtonProps) => {
  const statusLabel = getStatusLabel(props.status);

  const exportTypeLabel = getExportTypeLabel(props.exportType);

  const statusIcon = getStatusIcon(props.status);

  const dateLabel = beautifyUpdatedAt(props.createdAt);

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "rgb(243, 243, 245)",
        padding: "6px 0",
        cursor: "pointer",
      }}
      onClick={props.onClick}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <h3 style={{ margin: 0, fontWeight: "500", fontSize: "16px" }}>
              {props.query}{" "}
            </h3>
            <h3 style={{ margin: 0, fontWeight: "400", fontSize: "16px" }}>
              {props.queuePosition
                ? `⏳ ${props.queuePosition}-й в очереди`
                : ""}
            </h3>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={statusLabel}
              style={{
                height: "26px",
                borderRadius: "8px",
                border: props.status === "ERROR" ? "1px solid red" : "unset",
              }}
              icon={statusIcon}
              sx={{ minWidth: "183px" }}
            />
            <Chip
              label={props.network}
              style={{ height: "26px", borderRadius: "8px" }}
            />

            <Chip
              label={
                props.status === "PENDING"
                  ? `Готово таблиц: ${props.doneTablesCount}/${props.totalRecords}`
                  : "Количество таблиц: " + props.totalRecords
              }
              sx={{
                height: "26px",
                borderRadius: "8px",
                border: "1px solid rgba(121, 121, 121, 1)",
                backgroundColor: "transparent",
              }}
            />
            <Chip
              label={dateLabel}
              sx={{
                height: "26px",
                borderRadius: "8px",
                border: "1px solid rgba(121, 121, 121, 1)",
                backgroundColor: "transparent",
              }}
            />
            <Chip
              label={exportTypeLabel}
              sx={{
                height: "26px",
                borderRadius: "8px",
                border: "1px solid rgba(121, 121, 121, 1)",
                backgroundColor: "transparent",
              }}
            />
          </div>
        </div>
        <KeyboardArrowRightIcon />
      </div>
      {!props.last && (
        <div
          style={{
            marginTop: "18px",
            width: "100%",
            height: "1px",
            backgroundColor: "rgba(200, 200, 200, 1)",
          }}
        />
      )}
    </article>
  );
};
