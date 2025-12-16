import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  datatypeContainer: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "1fr 1fr",
    "&>:last-child:nth-child(odd)": {
      gridColumn: "1 / -1",
    },
  },

  dataTypeBox: {
    padding: "8px",
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    // border: "1px solid #ccc",
    "&:hover": {
      backgroundColor: "#e4e4e4ff",
    },
  },

  parametrs: {
    display: "flex",
    borderRadius: "8px",
    height: "46px",
    transition: "background-color 0.3s ease",

    "&:hover": {
      backgroundColor: "#e4e4e4ff",
    },
  },
}));
