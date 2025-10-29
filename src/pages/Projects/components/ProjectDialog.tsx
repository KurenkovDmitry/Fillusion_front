import { Button, Dialog } from "@mui/material";
import { InputField } from "../../Generate/components/InputField";
import React, { useState } from "react";
import { useStyles } from "./ProjectDialog.styles";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  newProject?: boolean;
}

export const ProjectDialog = (props: ProjectDialogProps) => {
  const { classes } = useStyles();
  const [nameInputValue, setNameInputValue] = useState(props.title ?? "");
  const [descriptionInputValue, setDescriptionInputValue] = useState(
    props.description ?? ""
  );
  const [nameError, setNameError] = useState(false);

  // Проверка, что поле заполнено (не пустое и не только пробелы)
  const isNameValid = nameInputValue.trim().length > 0;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInputValue(e.target.value);
    // Убираем ошибку, если пользователь начал вводить текст
    if (e.target.value.trim().length > 0) {
      setNameError(false);
    }
  };

  const handleNameBlur = () => {
    // Показываем ошибку при потере фокуса, если поле пустое
    if (!isNameValid) {
      setNameError(true);
    }
  };

  const handleSubmit = async () => {
    const token = import.meta.env.VITE_TOKEN;
    const response = await fetch("http://localhost:8085/api/v1/projects", {
      method: props.newProject ? "POST" : "PATCH",
      body: JSON.stringify({
        name: nameInputValue,
        description: descriptionInputValue,
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
      credentials: "include",
    });
    const text = await response.json();
    if (!response.ok) {
      console.error(text);
    }
    console.log(text);
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
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
          onChange={(e) => setDescriptionInputValue(e.target.value)}
          multiline
        />
        <Button
          variant="contained"
          className={classes.button}
          disabled={!isNameValid}
          onClick={handleSubmit}
        >
          {props.newProject ? "Создать проект" : "Сохранить изменения"}
        </Button>
      </div>
    </Dialog>
  );
};
