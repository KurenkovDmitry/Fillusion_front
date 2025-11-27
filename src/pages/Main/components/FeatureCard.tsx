import { ReactElement } from "react";
import { useStyles } from "./FeatureCard.styles";

interface FeatureCardProps {
  icon: ReactElement<any, any>;
  title: string;
  description: string;
  variant?: "features" | "formats";
}

export const FeatureCard = (props: FeatureCardProps) => {
  const { classes } = useStyles();
  return (
    <article
      className={props.variant === "formats" ? classes.format : classes.feature}
    >
      {props.variant === "formats" ? (
        props.icon
      ) : (
        <div className={classes.feature__icon}>{props.icon}</div>
      )}
      <div>
        <h4 className={classes.feature__title}>{props.title}</h4>
        <p>{props.description}</p>
      </div>
    </article>
  );
};
