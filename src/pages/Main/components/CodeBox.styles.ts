import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  container: {
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#ffffffff", // Темный фон VS Code
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    fontFamily: "'Fira Code', 'Consolas', monospace",
    border: "1px solid #333",
    minWidth: "300px",
    width: "70%",
    marginTop: "40px",

    "@media (max-width: 960px)": {
      width: "95%",
    },
  },
  header: {
    backgroundColor: "#d3d3d3ff",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #333",

    "@media (max-width: 600px)": {
      padding: "6px 12px",
    },
  },
  dots: {
    display: "flex",
    gap: "6px",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  content: {
    display: "flex",
    padding: "16px 0",
    overflowX: "auto" as const,
  },
  lineNumbers: {
    textAlign: "right" as const,
    paddingRight: "16px",
    paddingLeft: "16px",
    color: "#858585",
    userSelect: "none" as const, // Чтобы не выделялись при копировании
    borderRight: "1px solid #333",
    minWidth: "40px",

    "@media (max-width: 600px)": {
      paddingLeft: "4px",
      paddingRight: "4px",
      minWidth: "20px",
    },
  },
  codeBlock: {
    paddingLeft: "16px",
    paddingRight: "16px",
    color: "#d4d4d4",
    margin: 0,
    flex: 1,
    overflowX: "auto" as const, // Добавляем скролл если строка очень длинная
    scrollbarColor: "#d4d4d4 white",

    "@media (max-width: 600px)": {
      paddingLeft: "4px",
      paddingRight: "4px",
    },
  },

  codeLine: {
    display: "block", // Заставляет каждый span быть новой строкой
    color: "black",
    fontFamily: "monospace",
    minHeight: "1.5em", // Чтобы пустые строки не схлопывались
    lineHeight: "1.5", // Синхронизация с номерами
    whiteSpace: "pre" as const, // Сохраняет пробелы и отступы!
    "@media (max-width: 600px)": {
      fontSize: "14px",
    },
  },
  numberLine: {
    display: "block",
    lineHeight: "1.5", // Такая же высота, как у кода
    fontFamily: "monospace",

    "@media (max-width: 600px)": {
      fontSize: "14px",
    },
  },

  export: {
    marginLeft: "auto",
    marginRight: "auto",
    color: "black",
    fontSize: "16px",

    "@media (max-width: 600px)": {
      fontSize: "14px",
    },
  },
}));
