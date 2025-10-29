import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  root: {
    fontSize: "16px",
  },
  requiredLabel: {
    "::after": {
      content: '"*"',
      color: "red",
    },
  },
}));
