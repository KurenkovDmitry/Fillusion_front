// theme.ts
import { createTheme } from "@mui/material/styles";

const headingLineHeight = 1.4;

export const theme = createTheme({
  spacing: 8, // базовый спейсинг (1 единица = 8px)
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: {
      fontSize: 34,
      lineHeight: headingLineHeight,
      fontWeight: 700,
    },
    h2: {
      fontSize: 28,
      lineHeight: headingLineHeight,
      fontWeight: 700,
    },
    h3: {
      fontSize: 24,
      lineHeight: headingLineHeight,
      fontWeight: 700,
    },
    h4: {
      fontSize: 22,
      lineHeight: headingLineHeight,
      fontWeight: 700,
    },
    h5: {
      fontSize: 17,
      lineHeight: headingLineHeight,
      fontWeight: 600,
    },
    h6: {
      fontSize: 15,
      lineHeight: headingLineHeight,
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.9rem",
    },
    subtitle1: {
      fontSize: "0.85rem",
    },
    subtitle2: {
      fontSize: "0.8rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none", // отключить капслок
          padding: "12px 24px",
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: "#0055cc",
          "&:hover": {
            backgroundColor: "#003a99",
          },
        },
      },
    },
  },
});

export default theme;
