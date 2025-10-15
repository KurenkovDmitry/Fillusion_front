import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export const LayoutWithHeader = ({
  children,
  noJustify,
}: {
  children: ReactNode;
  noJustify?: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          width: "100dvw",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: noJustify ? "" : "center",
          alignItems: "center",
          background: "#F3F3F5",
        }}
      >
        <header
          style={{
            position: "absolute",
            top: "0px",
            width: "100dvw",
            backgroundColor: "#becaffff",
          }}
        >
          <h2
            style={{
              margin: "16px",
              color: "white",
              background:
                "linear-gradient(90deg, #4f8cff 0%, #7f53ff 50%, #ff6a88 100%)",
              width: "fit-content",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 800,
              fontSize: "2rem",
              letterSpacing: "2px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Fillusion
          </h2>
        </header>
        {children}
      </div>
    </div>
  );
};
