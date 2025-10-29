import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  root: {
    "& .MuiInputBase-root": {
      "& .MuiInputBase-input": {
        fontSize: "16px",
        lineHeight: "24px",
        boxSizing: "content-box",
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "12px",
      },
    },
  },
}));
