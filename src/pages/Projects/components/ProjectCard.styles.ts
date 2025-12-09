import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  project__card: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    borderRadius: "8px",
    boxShadow: "0 5px 7px rgba(0,0,0,0.1)",
    transition: "box-shadow 0.3s ease",
    padding: "20px",
    border: "1px solid #ccc",

    "&:hover": {
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    },
  },

  card__headerSection: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: "10px",
    alignItems: "center",
  },

  card__header: {
    margin: "0",
    fontWeight: "normal",
  },

  card__description: {
    color: "#717182",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  card__updatedAt: {
    alignItems: "center",
    display: "flex",
    gap: "10px",
    fontSize: "14px",
    color: "#717182",
    lineHeight: "20px",
  },

  card__link: {
    marginTop: "16px",
    cursor: "pointer",
  },
}));
