import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  dataTypeBox: {
    padding: "8px",
    borderRadius: "8px",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
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
