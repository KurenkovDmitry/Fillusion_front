import { useState } from "react";
import { Dialog, Button, Box, DialogTitle, DialogContent } from "@mui/material";
import { Form, Formik } from "formik";
import { object, string, number } from "yup";

import { InputField } from "./components/InputField";
import { SliderWithInput } from "./components/SliderWithinput";
import TableIcon from "@assets/table.svg?react";
import { SelectField } from "./components/SelectField";
import { NonModalGenerate } from "./NonModalGenerate";
import { SchemaMaker } from "./components/SchemaMaker";
import { generateData } from "./actions/Generate.actions";

// interface FormValues {
//   query: string;
//   totalRecords: number;
//   examples: string;
// }

const selectModelOptions = [
  { value: "deepseek", label: "Deepseek" },
  { value: "gemini", label: "Gemini" },
];

const selectOutputOptions = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "sql", label: "SQL" },
];

// Начальные значения теперь под новые имена DTO
const initialValues = {
  query: "",
  totalRecords: 50,
  examples: "",
};

export const Generate = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectModelValue, setSelectModelValue] = useState(
    selectModelOptions[0].value
  );
  const [selectOutputValue, setSelectOutputValue] = useState(
    selectOutputOptions[0].value
  );

  const [schema, setSchema] = useState<{ name: string; type: string }[]>([]);

  const formatSchemaForDTO = (schema: { name: string; type: string }[]) =>
    schema.map((field) => ({
      ...field,
      unique: false,
      autoIncrement: false,
    }));

  const mapValuesToDTO = (values) => ({
    query: values.query.trim(),
    network: selectModelValue,
    totalRecords: String(values.totalRecords),
    schema: formatSchemaForDTO(schema),
    examples: values.examples.trim() || undefined,
  });

  return (
    <>
      <NonModalGenerate open={open} setOpen={setOpen} />
      <Dialog
        open={open}
        maxWidth="lg"
        fullWidth
        onClose={() => setOpen(false)}
        PaperProps={{ style: { borderRadius: 12 } }}
      >
        <DialogTitle style={{ fontSize: 20 }}>Настройка генерации</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialValues}
            validationSchema={object({
              query: string().required("Обязательное поле"),
              totalRecords: number()
                .min(1)
                .max(100)
                .required("Обязательное поле"),
            })}
            validateOnMount
            onSubmit={async (values) => {
              setLoading(true);
              setError("");
              try {
                const dto = mapValuesToDTO(values);
                const response = await generateData(dto);
                if (!response.ok) throw new Error("Ошибка при отправке формы");
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            {({ values, setValues, isValid }) => (
              <Form
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <InputField
                  label="Правила генерации (query)"
                  name="query"
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
                <SliderWithInput
                  label="Количество строк (totalRecords)"
                  value={values.totalRecords}
                  min={1}
                  max={100}
                  onChange={(value) =>
                    setValues({ ...values, totalRecords: value })
                  }
                />
                <InputField
                  label="Примеры данных (examples)"
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
                  label="Модель для генерации (network)"
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
                <SchemaMaker schema={schema} setSchema={setSchema} />
                <Box
                  width="100%"
                  paddingX={2}
                  display="flex"
                  justifyContent="space-between"
                >
                  <Button onClick={() => setOpen(false)}>Отмена</Button>
                  <Button
                    type="submit"
                    disabled={!isValid || loading}
                    variant="contained"
                  >
                    {loading ? "Загрузка..." : "Применить"}
                  </Button>
                </Box>
                {!!error && (
                  <Box marginTop={2} color="error.main" fontWeight="bold">
                    {error}
                  </Box>
                )}
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};
