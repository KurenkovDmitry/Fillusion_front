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
import { CopyButton } from './components/CopyButton';
import { generateData } from "./actions/Generate.actions";

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
  query: "",
  totalRecords: 50,
  examples: "",
};

export const Generate = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseJson, setResponseJson] = useState<JSON | null>(null);

  const [selectModelValue, setSelectModelValue] = useState(
    selectModelOptions[0].value
  );
  const [selectOutputValue, setSelectOutputValue] = useState(
    selectOutputOptions[0].value
  );

  const [schema, setSchema] = useState<{ id: string, name: string; type: string }[]>(() => [{id: '1', name: '', type: ''}]);

  const formatSchemaForDTO = (schema: { name: string; type: string }[]) =>
    schema.map((field) => ({
      ...field,
      unique: false,
      autoIncrement: false,
    }));

  const mapValuesToDTO = (values: any) => ({
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
      >
        <DialogTitle style={{ fontSize: 20 }}>{responseJson ? 'Результат генерации' : 'Настройка генерации'}</DialogTitle>
        <DialogContent style={{scrollbarWidth: 'thin', scrollbarColor: '#c0c0c0ff white'}}>
          {responseJson ? (
            <>
              <Box
                sx={{
                  fontFamily: "monospace",
                  fontSize: "15px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  scrollbarWidth: 'thin'
                }}
              >
                {Array.isArray(responseJson) && responseJson.length > 0 ? (
                  <pre>{JSON.stringify(responseJson, null, 2)}</pre>
                ) : (
                  <pre>{JSON.stringify(responseJson, null, 2)}</pre>
                )}
              </Box>
              <Box display="flex" mt={1} gap={'20px'}>
                <CopyButton textToCopy={JSON.stringify(responseJson, null, 2)} />
                  <Button variant="contained" onClick={() => setResponseJson(null)} sx={{height: '40px'}}>
                    Назад
                  </Button>
                </Box>
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
                setLoading(true);
                setError("");
                try {
                  const dto = mapValuesToDTO(values);
                  const response = await generateData(dto);
                  if (!response.ok) throw new Error("Ошибка при отправке формы");
                  const data = await response.json();
                  setResponseJson(data);
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
                    placeholder="Например: name: русские имена и фамилии"
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
                    placeholder='Например: { "name": "Иван Петров" }'
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
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Button onClick={() => setOpen(false)} 
                      sx={{
                        border: '1px solid #4f8cff', 
                        height: '40px',
                        '&': {
                          transition: 'background-color 0.3s ease, color 0.3s ease',
                        },
                        '&:hover': {
                            backgroundColor: '#4f8cff',
                            color: 'white'
                          }
                        }
                      }
                      >Отмена</Button>
                    <Button
                      type="submit"
                      disabled={!isValid || loading}
                      variant="contained"
                      sx={{height: '40px'}}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
