import { LayoutWithHeader } from "@shared/components/LayoutWithHeader";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

interface NonModalGenerateProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const NonModalGenerate = (props: NonModalGenerateProps) => {
  const navigate = useNavigate();
  const navigateToHistory = () => {
    navigate("/history");
  };
  return (
    <LayoutWithHeader>
      <div>
        <table
          style={{
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            overflow: "hidden",
            minWidth: "480px",
          }}
        >
          <thead>
            <tr style={{ background: "#4f8cff", color: "white" }}>
              <th
                style={{
                  padding: "12px 24px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "none",
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: "12px 24px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "none",
                }}
              >
                Имя
              </th>
              <th
                style={{
                  padding: "12px 24px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "none",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "12px 24px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "none",
                }}
              >
                Город
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: "40px 24px",
                  textAlign: "center",
                  color: "#888",
                  fontSize: "16px",
                  borderBottom: "1px solid #eee",
                  background: "#F8F8FA",
                  cursor: "pointer",
                }}
                onClick={() => (props.setOpen ? props.setOpen(true) : null)}
              >
                Нажмите, чтобы сгенерировать данные
              </td>
            </tr>
          </tbody>
        </table>
        <Button
          onClick={navigateToHistory}
          variant="contained"
          style={{
            width: "480px",
            height: "32px",
            marginTop: "20px",
            borderRadius: "10px",
          }}
        >
          Перейти к истории запросов
        </Button>
      </div>
    </LayoutWithHeader>
  );
};
