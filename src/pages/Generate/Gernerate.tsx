import { useState } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Box,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Form, Formik } from "formik";
import { object, string } from "yup";
import { TextInput as Input } from "../../ui";

const initalValues = {
  length: 50,
  name: "",
  prompt: "",
  examples: "",
};
import { InputField } from "./components/InputField";
import { SliderWithInput } from "./components/SliderWithinput";
import TableIcon from "@assets/table.svg?react";

export const Generate = () => {
  const [open, _] = useState(true);
  const [value, setValue] = useState("string");
  return (
    <Dialog open={open} maxWidth="lg" fullWidth sx={{ borderRadius: "12px" }}>
      <DialogTitle>Настройка генерации</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initalValues}
          validationSchema={object({
            name: string().required("Обязательное поле"),
            prompt: string().required("Обязательное поле"),
          })}
          validateOnMount
          onSubmit={(values, formikHelpers) => {
            console.log(values);
            formikHelpers.resetForm();
          }}
        >
          {({
            errors,
            isValid,
            values,
            touched,
            dirty,
            setValues,
            submitForm,
          }) => {
            console.log(values);

            return (
              <Form>
                <SliderWithInput
                  label="Количество строк"
                  value={values.length}
                  min={1}
                  max={100}
                  onChange={(value) => {
                    setValues({ ...values, length: value });
                  }}
                />
                <InputField
                  label="Название таблицы"
                  name="name"
                  placeholder="users"
                />
                <InputField
                  label="Правила генерации"
                  name="prompt"
                  labelIcon={<TableIcon />}
                  multiline
                  placeholder={`Например:
- name: русские имена и фамилии
- email: корпоративные email адреса
- age: от 18 до 65 лет
- phone: российские номера телефонов
- city: города России`}
                />
                <InputField
                  label="Примеры данных"
                  name="examples"
                  labelIcon={<TableIcon />}
                  multiline
                  placeholder={`{
  "name": "Иван Петров",
  "email": "ivan.petrov@company.ru",
  "age": 32,
  "phone": "+7(999)123-45-67",
  "city": "Москва"
}`}
                />
                <Box
                  width="100%"
                  paddingX={"20px"}
                  display={"flex"}
                  justifyContent={"space-between"}
                >
                  <Button>Отмена</Button>
                  <Button disabled={!isValid}>Применить</Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
