import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  dialog: {
    width: "500px",
    padding: "20px",

    "@media (max-width: 600px)": {
      width: "100%",
    },
  },

  button: {
    backgroundColor: "#000",
    height: "32px",
    marginTop: "15px",
    width: "100%",

    "&:hover": {
      backgroundColor: "#414141ff",
    },
  },

  header: {
    marginTop: 0,
  },
}));
