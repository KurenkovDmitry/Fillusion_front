import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { useStyles } from "./ProjectCard.styles";
import { IconButton, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { ProjectDialog } from "./ProjectDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

export const ProjectCard = (props: ProjectCardProps) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const beautifyUpdatedAt = (date: string) => {
    return date;
  };

  const [open, setOpen] = useState(false);

  const handleSettingsClick = () => {
    setOpen(true);
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
      <ProjectDialog
        open={open}
        onClose={() => setOpen(false)}
        title={props.title}
        description={props.description}
      />
    </article>
  );
};
