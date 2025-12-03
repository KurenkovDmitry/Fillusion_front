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
  input__border: {
    border: "1px solid #ccc",
    transition: "border-color 0.3s ease",

    '&[type="password"]:not(:placeholder-shown)': {
      letterSpacing: "2px",
      fontFamily: "caption",
    },

    ":hover, :focus": {
      borderColor: "#818181ff",
    },
  },
}));
