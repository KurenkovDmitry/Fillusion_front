import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  header: {
    backgroundColor: "#18191b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 16px",
    boxSizing: "border-box",
    width: "100%",
  },
  headerTransparent: {
    position: "absolute",
    top: "0px",
    minWidth: "100dvw",
    zIndex: 2,
  },
  header__logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  header__divider: {
    width: "1px",
    height: "45px",
    backgroundColor: "#5c5c5cff",
  },
  header__projectsLink: {
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "text-shadow 0.3s ease",

    "&:hover": {
      textShadow: "0 0 8px #ffffff6b",
    },
  },
  logo: {
    margin: "16px 0",
    color: "white",
    background:
      "linear-gradient(90deg, #2d3383ff 0%, #7f53ff 50%, #d6002bff 100%)",
    width: "fit-content",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: 800,
    fontSize: "2rem",
    letterSpacing: "2px",
    cursor: "pointer",
  },
  mainContent: {
    width: "100%",
    display: "flex",
    minHeight: "calc(100dvh - 80px)",
    flexDirection: "column",
    alignItems: "center",
    background: "#F3F3F5",
  },
  mainContentCentered: {
    justifyContent: "center",
  },

  // Стили для диалогов
  dialogActions: {
    padding: "0 24px 16px 24px",
    gap: "8px",
  },
  saveButton: {
    textTransform: "none",
    fontWeight: 500,
    borderRadius: "8px",
    background: "#000000ff",
    color: "white",
    "&:hover": { background: "#292929ff" },
  },
  cancelButton: {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: "8px",
    color: "black",
  },
  avatarUploadBtn: {
    display: "none",
  },

  changePasswordTitle: {
    paddingBottom: "0px",
  },

  buttonOutlined: {
    color: "black",
    borderColor: "black",
    fontWeight: "500",
    borderRadius: "11px",
  },
}));
