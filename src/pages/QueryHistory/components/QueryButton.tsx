import { Chip } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

interface QueryButtonProps {
  requsetId: string;
  query: string;
  network: string;
  totalRecords: string;
  last?: boolean;
  onClick?: () => void;
}

export const QueryButton = (props: QueryButtonProps) => {
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
              label={props.network}
              style={{ height: "26px", borderRadius: "8px" }}
            />
            <Chip
              label={"Количество записей: " + props.totalRecords}
              style={{
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
