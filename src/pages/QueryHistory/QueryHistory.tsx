import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { QueryButton } from "./components/QueryButton";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { DatasetDialog } from "./components/DatasetDialog";
import { GenerateService } from "@services/api/GenerateService/GenerateService";
import { useNavigate, useParams } from "react-router-dom";
import { Dataset } from "@services/api/GenerateService/GenerateService.types";
import EmptyIcon from "@assets/emptyIcon.svg?react";

export const QueryHistory = () => {
  const { projectId } = useParams();
  const [datasets, setDatasets] = useState<Dataset[]>();
  const [loading, setLoading] = useState<boolean>(false);
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

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
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
  }, []);

  return (
    <LayoutWithHeader noJustify>
      <DatasetDialog
        projectId={projectId!}
        open={open}
        setOpen={setOpen}
        requestId={requsetId}
        status={requsetStatus}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "70%",
          padding: "10px 32px 26px 32px",
          border: "1px solid rgb(200 200 200)",
          borderRadius: "12px",
          margin: "20px 0",
        }}
      >
        <h1 style={{ fontSize: "1.5rem" }}>История запросов</h1>
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
                requsetId={val.requestId}
                query={
                  val.tables[0]?.name ?? `Запрос ${val.requestId.slice(6, 10)}`
                }
                network={val.network}
                totalRecords={val.tablesCount}
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
