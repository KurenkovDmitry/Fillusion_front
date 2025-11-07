import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { useStyles } from "./ProjectCard.styles";
import { IconButton, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  setOpenFromCard: (projectId: string, open: boolean) => void;
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

export const ProjectCard = (props: ProjectCardProps) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  function beautifyUpdatedAt(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин назад`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} дн назад`;

    return date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const handleSettingsClick = () => {
    props.setOpenFromCard(props.id, true);
  };

  return (
    <article className={classes.project__card}>
      <div>
        <span className={classes.card__headerSection}>
          <h4 className={classes.card__header}>{props.title}</h4>
          <Tooltip title="Редактировать проект" placement="top" arrow>
            <IconButton size="small" onClick={handleSettingsClick}>
              <SettingsIcon sx={{ color: "#888" }} />
            </IconButton>
          </Tooltip>
        </span>
        <p className={classes.card__description}>{props.description}</p>
      </div>
      <span className={classes.card__updatedAt}>
        <CalendarTodayOutlinedIcon sx={{ height: "16px", width: "16px" }} />
        Изменен
        {" " + beautifyUpdatedAt(props.updatedAt)}
      </span>
      <a
        className={classes.card__link}
        onClick={() => navigate(`/projects/${props.id}`)}
      >
        Открыть проект
      </a>
    </article>
  );
};
