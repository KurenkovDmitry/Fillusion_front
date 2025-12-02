import { makeStyles } from "tss-react/mui";
import { keyframes } from "tss-react";

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// const textAnimation = keyframes`
//   to { background-position: 100% center}
// `;

export const useStyles = makeStyles()((_theme) => ({
  feature: {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    border: "1px dashed black",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    transition: "all 0.3s ease",

    "&:hover": {
      boxShadow: "0 2px 10px #00000049",
      //   borderStyle: "solid",
      background: "linear-gradient(270deg, #f7f7f7, #d4d4d4ff, #f7f7f7 )",
      backgroundSize: "400% 400%",
      animation: `${gradientAnimation} 5s ease infinite`,
    },
  },

  format: {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    border: "1px solid black",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    transition: "all 0.3s ease",

    "&:hover": {
      boxShadow: "0 2px 10px #00000049",
      transform: "scale(1.02)",
      background: "linear-gradient(270deg, #f7f7f7, #d4d4d4ff, #f7f7f7 )",
      backgroundSize: "400% 400%",
      animation: `${gradientAnimation} 7s ease infinite`,
    },
  },

  feature__header: {
    display: "flex",
    justifyContent: "space-between",
  },

  feature__soon: {
    margin: 0,
    transition: "0.3s all ease",
    "-webkit-text-fill-color": "transparent",
    background: "linear-gradient(270deg, #000000ff, #8b8b8bff, #000000ff )",
    backgroundClip: "text",
    backgroundSize: "200% 200%",
    animation: `${gradientAnimation} 5s linear infinite`,
  },

  feature__icon: {
    borderRadius: "10px",
    // background: "linear-gradient(45deg, #bbbbbb, #5d5d5d)",
    backgroundColor: "black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    width: "fit-content",
  },

  feature__title: {
    fontSize: "20px",
    margin: "10px 0 0 0",
    fontWeight: "550",
  },

  feature__description: {
    marginBottom: 0,
  },
}));
