import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export const LayoutWithHeader = ({
  children,
  noJustify,
  transparent,
}: {
  children: ReactNode;
  noJustify?: boolean;
  transparent?: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <header
        style={{
          width: "100%",
          backgroundColor: /*transparent ? "#18191b44" :*/ "#18191b",
          boxShadow: "0 7px 10px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "center",
          position: transparent ? "absolute" : "unset",
          zIndex: transparent ? "1" : "auto",
          backdropFilter: transparent ? "blur(2px)" : "none",
        }}
      >
        <div style={{ width: "70%" }}>
          <h2
            style={{
              color: "white",
              background:
                /*transparent
                ? "linear-gradient(90deg, #000b69ff 0%, #000a44ff 50%, #000000ff 100%)"
                : */ "linear-gradient(90deg, #2d3383ff 0%, #7f53ff 50%, #d6002bff 100%)",
              width: "fit-content",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 800,
              fontSize: "2rem",
              letterSpacing: "2px",
              cursor: "pointer",
              margin: "15px 0",
            }}
            onClick={() => navigate("/")}
          >
            Fillusion
          </h2>
        </div>
      </header>
      <div
        style={{
          width: "100%",
          display: "flex",
          minHeight: "calc(100dvh - 80px)",
          flexDirection: "column",
          justifyContent: noJustify ? "" : "center",
          alignItems: "center",
          background: "#F3F3F5",
        }}
      >
        {children}
      </div>
    </div>
  );
};
