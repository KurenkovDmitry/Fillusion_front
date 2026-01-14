import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((_theme) => ({
  main: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    alignItems: "center",
  },

  main__container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "80dvh",
    alignItems: "center",
    justifyContent: "center",
    "@media (max-width: 960px)": {
      padding: "16px",
    },
  },

  main__page: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
    alignItems: "center",
    justifyContent: "center",
    width: "inherit",
  },

  main__content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  main__title: {
    margin: 0,
    textShadow: "0 0 8px #08080844",
    fontWeight: 600,

    "@media (max-width: 600px)": {
      fontSize: "36px",
    },
  },

  main__description: {
    margin: 0,
    marginTop: "20px",
    textShadow: "0 0 8px #08080844",
    fontWeight: "normal",
    fontSize: "18px",

    "@media (max-width: 600px)": {
      fontSize: "16px",
    },
  },

  main__description_secondary: {
    margin: 0,
    textShadow: "0 0 8px #08080844",
    fontWeight: "normal",
    fontSize: "18px",

    "@media (max-width: 600px)": {
      fontSize: "16px",
    },
  },

  main__actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  // Элемент button
  main__button: {
    width: "280px",
    height: "50px",
    marginTop: "20px",
    borderRadius: "16px",
    backgroundColor: "black",
    transition: "all 0.3s ease",

    "&:hover": {
      boxShadow: "0 3px 10px #00000033",
      backgroundColor: "#333",
    },
  },

  main__icon: {
    width: "24px",
    height: "24px",
    color: "white",
  },

  format__icon: {
    width: "48px",
    height: "48px",
    color: "black",
  },

  notifications__icon: {
    width: "32px",
    height: "32px",
    color: "white",
  },

  container__wrapper: {
    marginTop: "70px",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },

  main__divider: {
    width: "80%",
    height: "1px",
    backgroundColor: "#bbb",
  },

  main__featureTitle: {
    margin: 0,
    marginTop: "20px",
    textShadow: "0 0 8px #08080844",
    fontWeight: 600,
    textAlign: "center",

    "@media (max-width: 600px)": {
      fontSize: "32px",
    },
  },

  main__featureSubTitle: {
    marginTop: "15px",
    fontSize: "16px",
    textAlign: "center",
  },

  main__features: {
    marginTop: "40px",
    width: "70%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridAutoRows: "auto",
    gap: "20px",

    "@media (max-width: 960px)": {
      gridTemplateColumns: "1fr 1fr",
      width: "95%",
    },

    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
  },

  main__codeWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },

  main__startContainer: {
    marginTop: "40px",
    height: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    borderRadius: "24px",
    border: "1px solid black",
    boxShadow: "0 3px 10px #00000033",

    "@media (max-width: 960px)": {
      width: "95%",
      height: "fit-content",
      marginBottom: "20px",
    },
  },

  main__startButton: {
    width: "280px",
    height: "42px",
    marginTop: "20px",
    borderRadius: "16px",
    backgroundColor: "black",
    color: "white",
    transition: "all 0.3s ease",

    "&:hover": {
      boxShadow: "0 3px 10px #00000033",
      backgroundColor: "#333",
    },

    "@media (max-width: 960px)": {
      marginBottom: "30px",
      marginTop: "10px",
    },
  },

  main__footer: {
    width: "100%",
    backgroundColor: "#18191b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    height: "150px",

    "@media (max-width: 600px)": {
      height: "fit-content",
    },
  },
}));
