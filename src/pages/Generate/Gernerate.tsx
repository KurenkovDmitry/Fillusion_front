import { useState } from "react";
import {
  Dialog,
  Button,
  Box,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Form, Formik } from "formik";
import { object, Schema, string } from "yup";

const initalValues = {
  length: 50,
  name: "",
  prompt: "",
  examples: "",
};
import { InputField } from "./components/InputField";
import { SliderWithInput } from "./components/SliderWithinput";
import TableIcon from "@assets/table.svg?react";
import { SelectField } from "./components/SelectField";
import { NonModalGenerate } from "./NonModalGenerate";
import { SchemaMaker } from "./components/SchemaMaker";

export const Generate = () => {
  const [open, setOpen] = useState(true);

  const selectModelOptions = [
    { value: "deepseek", label: "Deepseek" },
    { value: "gemini", label: "Gemini" },
  ];

  const selectOutputOptions = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "sql", label: "SQL" },
  ];

  const [selectModelValue, setSelectModelValue] = useState(
    selectModelOptions[0].value
  );
  const [selectOutputValue, setSelectOutputValue] = useState(
    selectOutputOptions[0].value
  );

  return (
    <>
    <NonModalGenerate open={open} setOpen={setOpen}/>
    <Dialog open={open} maxWidth="lg" fullWidth style={{ borderRadius: "12px !important" }} onClose={() => setOpen(false)}>
      <DialogTitle style={{fontSize: '20px'}}>Настройка генерации</DialogTitle>
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
            // console.log(values);

            return (
              <Form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <InputField
                  label="Название таблицы"
                  name="name"
                  placeholder="users"
                  required
                />
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
                  required
                />
                <SchemaMaker />
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
                <SelectField
                  label="Модель для генерации"
                  value={selectModelValue}
                  options={selectModelOptions}
                  onChange={setSelectModelValue}
                />
                <SelectField
                  label="Тип выходных данных"
                  value={selectOutputValue}
                  options={selectOutputOptions}
                  onChange={setSelectOutputValue}
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
    </>
  );
};
