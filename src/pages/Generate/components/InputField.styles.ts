import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  requiredLabel: {
    "::after": {
      content: '"*"',
      color: "red",
    },
  },
}));
