// theme.ts
import { createTheme } from "@mui/material/styles";

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
      fontSize: "2rem",
      fontWeight: 700,
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
