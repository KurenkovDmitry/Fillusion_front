import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "70%",
    padding: "10px 32px 26px 32px",
    border: "1px solid rgb(200 200 200)",
    borderRadius: "12px",
    margin: "20px 0",
    "@media (max-width: 600px)": {
      width: "95%",
      padding: "5px 16px 13px 16px",
    },
  },
}));
