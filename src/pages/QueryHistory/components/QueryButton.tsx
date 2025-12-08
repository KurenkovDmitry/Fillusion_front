import { Chip } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import UpdateIcon from "@mui/icons-material/Update";
import DoneIcon from "@mui/icons-material/Done";

type ExportType =
  | "EXPORT_TYPE_JSON"
  | "EXPORT_TYPE_SNAPSHOT"
  | "EXPORT_TYPE_DIRECT_DB"
  | "EXPORT_TYPE_EXCEL"
  | "EXPORT_TYPE_UNSPECIFIED";

type Status = "PENDING" | "SUCCESS";

interface QueryButtonProps {
  requsetId: string;
  query: string;
  network: string;
  totalRecords: string;
  last?: boolean;
  status: Status;
  exportType: ExportType;
  createdAt: string;
  onClick?: () => void;
}

const sx = { width: "18px" };

const getStatusLabel = (status: Status) =>
  status === "PENDING"
    ? "В процессе генерации"
    : status === "SUCCESS"
    ? "Генерация завершена"
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
  status === "PENDING" ? <UpdateIcon sx={sx} /> : <DoneIcon sx={sx} />;

const formatDate = (date: string) => {
  // формат 2025-11-29T21:50:36.091372Z
  return "Создан " + date.slice(0, 10).split("-").reverse().join(".");
};

export const QueryButton = (props: QueryButtonProps) => {
  const statusLabel = getStatusLabel(props.status);

  const exportTypeLabel = getExportTypeLabel(props.exportType);

  const statusIcon = getStatusIcon(props.status);

  const dateLabel = formatDate(props.createdAt);

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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h3 style={{ margin: 0, fontWeight: "500", fontSize: "16px" }}>
            {props.query}
          </h3>
          <div style={{ width: "100%", display: "flex", gap: "12px" }}>
            <Chip
              label={statusLabel}
              style={{ height: "26px", borderRadius: "8px" }}
              icon={statusIcon}
              sx={{ minWidth: "183px" }}
            />
            <Chip
              label={props.network}
              style={{ height: "26px", borderRadius: "8px" }}
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
              label={"Количество таблиц: " + props.totalRecords}
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
