import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { QueryButton } from "./components/QueryButton";
import { useLayoutEffect, useState } from "react";
import { CircularProgress, IconButton } from "@mui/material";
import { DatasetDialog } from "./components/DatasetDialog";
import { GenerateService } from "@services/api/GenerateService/GenerateService";
import { useNavigate, useParams } from "react-router-dom";
import { Dataset } from "@services/api/GenerateService/GenerateService.types";
import EmptyIcon from "@assets/emptyIcon.svg?react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useStyles } from "./QueryHistory.styles";

export const QueryHistory = () => {
  const { classes } = useStyles();
  const { projectId } = useParams();
  const [datasets, setDatasets] = useState<Dataset[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [requsetId, setRequestId] = useState("");
  const [requsetStatus, setRequsetStatus] = useState("");
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleOpen = (val: string, status: string) => {
    setOpen(true);
    setRequestId(val);
    setRequsetStatus(status);
  };

  const handleEditorClick = () => {
    navigate(`/projects/${projectId}`);
  };
  useLayoutEffect(() => {
    setLoading(true);

    const fetchDatasets = async () => {
      try {
        const datasets = await GenerateService.getDatasets(projectId!);
        setDatasets(datasets.datasets);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();

    const intervalId = setInterval(fetchDatasets, 30000);

    return () => clearInterval(intervalId);
  }, [projectId]);

  return (
    <LayoutWithHeader noJustify>
      <DatasetDialog
        projectId={projectId!}
        open={open}
        setOpen={setOpen}
        requestId={requsetId}
        status={requsetStatus}
      />
      <div className={classes.container}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <IconButton
            sx={{ width: "32px", height: "32px" }}
            onClick={handleEditorClick}
          >
            <ArrowBackIcon />
          </IconButton>
          <h1 style={{ fontSize: "1.5rem" }}>История запросов</h1>
        </div>
        <section
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : datasets?.length ? (
            datasets.map((val, idx, arr) => (
              <QueryButton
                key={idx}
                status={val.status}
                exportType={val.exportType}
                requsetId={val.requestId}
                query={`Таблиц${
                  val.tableNames.length === 1 ? "а" : "ы"
                } ${val.tableNames.reduce(
                  (prev, cur, idx, arr) =>
                    (prev += idx === arr.length - 1 ? `${cur}` : `${cur}, `),
                  ""
                )}`}
                queuePosition={
                  val.queuePosition && val.queuePosition != 0
                    ? val.queuePosition
                    : undefined
                }
                network={val.network}
                totalRecords={val.tablesCount}
                createdAt={val.createdAt}
                doneTablesCount={val.doneTablesCount}
                last={idx === arr.length - 1}
                onClick={() => handleOpen(val.requestId, val.status)}
              />
            ))
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EmptyIcon
                style={{ width: "90px", height: "90px", marginBottom: "10px" }}
              />
              <span>
                Пока здесь пусто...{" "}
                <a style={{ cursor: "pointer" }} onClick={handleEditorClick}>
                  Перейти к редактору
                </a>
              </span>
            </div>
          )}
        </section>
      </div>
    </LayoutWithHeader>
  );
};
