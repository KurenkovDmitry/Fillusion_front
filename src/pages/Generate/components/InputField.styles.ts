import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  requiredLabel: {
    "::after": {
      content: '"*"',
      color: "red",
    },
  },
  input__border: {
    border: "1px solid #ccc",
    transition: "border-color 0.3s ease",

    // ":focus": {
    //   borderColor: "black",
    // },

    ":hover, :focus": {
      borderColor: "#818181ff",
    },
  },
}));
