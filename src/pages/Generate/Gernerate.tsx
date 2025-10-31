import { useState } from "react";
import {
  Dialog,
  Button,
  Box,
  DialogTitle,
  DialogContent,
  Snackbar,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import { object, string, number } from "yup";
import { InputField } from "./components/InputField";
import { SliderWithInput } from "./components/SliderWithinput";
import TableIcon from "@assets/table.svg?react";
import { SelectField } from "./components/SelectField";
import { NonModalGenerate } from "./NonModalGenerate";
import { SchemaMaker } from "./components/SchemaMaker";
import { generateData } from "./actions/Generate.actions";
import useSchemaStore, { type SchemaField } from "../../store/schemaStore";

const selectModelOptions = [
  { value: "deepseek", label: "Deepseek" },
  { value: "gemini", label: "Gemini" },
];

const selectOutputOptions = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "sql", label: "SQL" },
];

const initialValues = {
  name: "",
  query: "",
  totalRecords: 50,
  examples: "",
  export_type: selectModelOptions[0].value,
};

export const Generate = () => {
  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseJson, setResponseJson] = useState<JSON | null>(null);

  const [selectModelValue, setSelectModelValue] = useState(
    selectModelOptions[0].value
  );
  const [selectOutputValue, setSelectOutputValue] = useState(
    selectOutputOptions[0].value
  );

  const schema = useSchemaStore((s) => s.schema);

  // Убираем id из запроса
  const formatSchemaForDTO = (
    schema: SchemaField[]
  ): Omit<SchemaField, "id">[] => {
    return schema.map(({ id, ...rest }) => rest);
  };

  const mapValuesToDTO = (values: any) => ({
    projectId: import.meta.env.VITE_PROJECT_ID,
    query: values.query.trim(),
    name: values.name,
    export_type: selectOutputValue,
    network: selectModelValue,
    totalRecords: String(values.totalRecords),
    schema: formatSchemaForDTO(schema),
    examples: values.examples.trim() || undefined,
  });

  const handleError = (err: string) => {
    setError(err);
    setOpenSnackbar(true);
  };

  const handleClose = () => {
    openSnackbar && setOpenSnackbar(false);
  };

  return (
    <>
      <NonModalGenerate open={open} setOpen={setOpen} />
      <Dialog
        open={open}
        maxWidth="lg"
        fullWidth
        onClose={() => setOpen(false)}
      >
        {!responseJson && (
          <DialogTitle style={{ fontSize: 20 }}>
            {responseJson ? "Результат генерации" : "Настройка генерации"}
          </DialogTitle>
        )}
        <DialogContent
          style={{ scrollbarWidth: "thin", scrollbarColor: "#c0c0c0ff white" }}
        >
          {responseJson ? (
            <>
              <h1>Запрос отправлен!</h1>
              <h3>
                Посмотреть результат можно будет на странице истории запросов
              </h3>
            </>
          ) : (
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
                const emptyNameField = schema.find(
                  (field) => !field.name.trim()
                );
                if (emptyNameField) {
                  handleError("Все поля 'Название' должны быть заполнены");
                  return;
                }
                setLoading(true);
                setError("");
                try {
                  const dto = mapValuesToDTO(values);
                  const response = await generateData(dto);
                  if (!response.ok)
                    throw new Error("Ошибка при отправке формы");
                  const data = await response.json();
                  setResponseJson(data);
                } catch (err) {
                  handleError((err as Error).message);
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
                    label="Название таблицы"
                    name="name"
                    required
                    value={values.name}
                    onChange={(e) =>
                      setValues({ ...values, name: e.target.value })
                    }
                  />
                  <InputField
                    label="Правила генерации"
                    name="query"
                    labelIcon={<TableIcon />}
                    value={values.query}
                    onChange={(e) =>
                      setValues({ ...values, query: e.target.value })
                    }
                    multiline
                    placeholder="Например: name: русские имена и фамилии"
                    required
                  />
                  <SliderWithInput
                    label="Количество строк"
                    value={values.totalRecords}
                    min={1}
                    max={100}
                    onChange={(value) =>
                      setValues({ ...values, totalRecords: value })
                    }
                  />
                  <InputField
                    label="Примеры данных"
                    name="examples"
                    labelIcon={<TableIcon />}
                    value={values.examples}
                    onChange={(e) =>
                      setValues({ ...values, examples: e.target.value })
                    }
                    multiline
                    placeholder='Например: { "name": "Иван Петров" }'
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
                  <SchemaMaker />
                  <Box
                    width="100%"
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Button
                      onClick={() => setOpen(false)}
                      sx={{
                        border: "1px solid #4f8cff",
                        height: "40px",
                        "&": {
                          transition:
                            "background-color 0.3s ease, color 0.3s ease",
                        },
                        "&:hover": {
                          backgroundColor: "#4f8cff",
                          color: "white",
                        },
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isValid || loading}
                      variant="contained"
                      sx={{ height: "40px" }}
                    >
                      {loading ? "Загрузка..." : "Начать генерацию"}
                    </Button>
                  </Box>
                  {!!error && (
                    <Snackbar
                      onClose={handleClose}
                      open={openSnackbar}
                      message={error}
                      autoHideDuration={6000}
                      anchorOrigin={{ vertical: "top", horizontal: "center" }}
                      sx={{
                        "& .MuiSnackbarContent-root": {
                          backgroundColor: "#940d0dff",
                          color: "white",
                          fontSize: "16px",
                          borderRadius: "12px",
                        },
                      }}
                    />
                  )}
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
