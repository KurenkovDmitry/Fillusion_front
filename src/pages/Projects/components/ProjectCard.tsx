import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { useStyles } from "./ProjectCard.styles";
import { IconButton, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  setOpenFromCard: (projectId: string, open: boolean) => void;
  setDeleteOpenFromCard: (projectId: string, open: boolean) => void;
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

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

const MAX_PROJECT_TITLE_LENGTH = 200;
const MAX_PROJECT_DESCRIPTION_LENGTH = 2000;

export const ProjectCard = (props: ProjectCardProps) => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    props.setOpenFromCard(props.id, true);
  };

  const handleDeleteClick = () => {
    props.setDeleteOpenFromCard(props.id, true);
  };

  const safeTitle = (props.title ?? "").slice(0, MAX_PROJECT_TITLE_LENGTH);
  const safeDescription = (props.description ?? "").slice(
    0,
    MAX_PROJECT_DESCRIPTION_LENGTH
  );

  return (
    <article className={classes.project__card}>
      <div>
        <span className={classes.card__headerSection}>
          <h4
            className={classes.card__header}
            title={props.title}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {safeTitle}
          </h4>

          <Tooltip title="Редактировать проект" placement="top" arrow>
            <IconButton size="small" onClick={handleSettingsClick}>
              <SettingsIcon sx={{ color: "#888" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Удалить проект" placement="top" arrow>
            <IconButton size="small" onClick={handleDeleteClick}>
              <DeleteIcon sx={{ color: "#e00000ff" }} />
            </IconButton>
          </Tooltip>
        </span>

        <p
          className={classes.card__description}
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {safeDescription}
        </p>
      </div>

      <span className={classes.card__updatedAt}>
        <CalendarTodayOutlinedIcon sx={{ height: "16px", width: "16px" }} />
        Изменен {" " + beautifyUpdatedAt(props.updatedAt)}
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
