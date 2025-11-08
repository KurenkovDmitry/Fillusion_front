import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { QueryButton } from "./components/QueryButton";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { DatasetDialog } from "./components/DatasetDialog";
import { API_BASE_URL } from "@services/api";

interface DatasetsDTO {
  requestId: string;
  query: string;
  network: string;
  totalRecords: string;
}

export const QueryHistory = () => {
  const [datasets, setDatasets] = useState<DatasetsDTO[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [requsetId, setRequestId] = useState("");

  const [open, setOpen] = useState(false);

  const handleOpen = (val: any) => {
    setOpen(true);
    setRequestId(val);
  };

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/datasets?projectId=${
            import.meta.env.VITE_PROJECT_ID
          }`
        );
        if (!response.ok) {
          return new Error("Failed to fetch");
        }
        const data = await response.json();
        setDatasets(data.datasets);
      } catch (e) {
        return e;
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  return (
    <LayoutWithHeader noJustify>
      <DatasetDialog open={open} setOpen={setOpen} requestId={requsetId} />
      <div style={{ height: "80px", opacity: 0 }}> a</div>
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
          ) : (
            datasets &&
            datasets.map((val, idx, arr) => (
              <QueryButton
                key={idx}
                requsetId={val.requestId}
                query={val.query}
                network={val.network}
                totalRecords={val.totalRecords}
                last={idx === arr.length - 1}
                onClick={() => handleOpen(val.requestId)}
              />
            ))
          )}
        </section>
      </div>
    </LayoutWithHeader>
  );
};
