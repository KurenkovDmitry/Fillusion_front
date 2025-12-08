import { Button, Dialog } from "@mui/material";
import { InputField } from "../../Generate/components/InputField";
import React, { useState, useEffect } from "react";
import { useStyles } from "./ProjectDialog.styles";
import { ProjectService } from "@services/api/ProjectService/ProjectService";
import { Project } from "@services/api/ProjectService/ProjectService.types";
import { DialogState } from "../Projects";

interface ProjectDialogProps {
  dialogState: DialogState;
  onClose: () => void;
  projectId?: string;
  onSuccess?: () => void;
  projects: Project[];
  newProject: boolean;
}

export const ProjectDialog = (props: ProjectDialogProps) => {
  const open = props.dialogState.open;
  const { classes } = useStyles();

  const currentProject = props.projects.find(
    (v) => v.id === props.dialogState.projectId
  );

  const [nameInputValue, setNameInputValue] = useState("");
  const [descriptionInputValue, setDescriptionInputValue] = useState("");
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  useEffect(() => {
    if (props.dialogState.open) {
      if (!props.newProject && currentProject) {
        setNameInputValue(currentProject.name);
        setDescriptionInputValue(currentProject.description);
      } else {
        setNameInputValue("");
        setDescriptionInputValue("");
      }
      setNameError(false);
      setDescriptionError(false);
    }
  }, [props.dialogState.open, currentProject, props.newProject]);

  // Проверка, что поле заполнено (не пустое и не только пробелы)
  const isNameValid = nameInputValue.trim().length > 0;
  const isDescriptionValid = descriptionInputValue.trim().length > 0;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInputValue(e.target.value);
    // Убираем ошибку, если пользователь начал вводить текст
    if (e.target.value.trim().length > 0) {
      setNameError(false);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionInputValue(e.target.value);
    // Убираем ошибку, если пользователь начал вводить текст
    if (e.target.value.trim().length > 0) {
      setDescriptionError(false);
    }
  };

  const handleNameBlur = () => {
    // Показываем ошибку при потере фокуса, если поле пустое
    if (!isNameValid) {
      setNameError(true);
    }
  };

  const handleDescriptionBlur = () => {
    // Показываем ошибку при потере фокуса, если поле пустое
    if (!isDescriptionValid) {
      setDescriptionError(true);
    }
  };

  const handleSubmit = async () => {
    if (!isNameValid) setNameError(true);
    if (!isDescriptionValid) setDescriptionError(true);

    if (!isNameValid || !isDescriptionValid) return;

    try {
      if (props.newProject) {
        await ProjectService.createProject({
          name: nameInputValue,
          description: descriptionInputValue,
        });
      } else if (props.dialogState.projectId) {
        await ProjectService.updateProject(props.dialogState.projectId, {
          name: nameInputValue,
          description: descriptionInputValue,
        });
      }

      props.onSuccess?.();
      props.onClose();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  return (
    <Dialog open={open} onClose={props.onClose}>
      <div className={classes.dialog}>
        <h3 className={classes.header}>
          {props.newProject ? "Создание проекта" : "Редактирование проекта"}
        </h3>
        <InputField
          label="Название проекта"
          name="name"
          placeholder="Введите название проекта"
          value={nameInputValue}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          required
          error={nameError}
          helperText={
            nameError ? "Название проекта обязательно для заполнения" : ""
          }
        />
        <InputField
          label="Описание проекта"
          name="description"
          placeholder="Введите описание проекта"
          value={descriptionInputValue}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          multiline
          required
          error={descriptionError}
          helperText={
            descriptionError
              ? "Описание проекта обязательно для заполнения"
              : ""
          }
        />
        <Button
          variant="contained"
          className={classes.button}
          disabled={!isNameValid || !isDescriptionValid}
          onClick={handleSubmit}
        >
          {props.newProject ? "Создать проект" : "Сохранить изменения"}
        </Button>
      </div>
    </Dialog>
  );
};
