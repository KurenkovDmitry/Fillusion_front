import React, { useState } from "react";
// import { LoginForm } from "./LoginForm";
// import { SignupForm } from "./SignupForm";
import {
  Backdrop,
  Box,
  Button,
  Fade,
  Modal,
  Stack,
  Tab,
  Tabs,
  Typography,
  TextField,
  type TextFieldProps,
  Dialog,
  DialogTitle,
  Link,
} from "@mui/material";
import { Form, Formik } from "formik";

import { InputField } from "../../../pages/Generate/components/InputField";
import { TextInput } from "../../../ui/form";

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: "login" | "signup";
}

// const style = {

// };

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "login",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [open, setOpen] = useState(true);

  const handleClose = () => setOpen(false);

  const handleGoToSignup = () => setActiveTab("signup");
  const handleGoToLogin = () => setActiveTab("login");

  return (
    // <Modal
    //   aria-labelledby="transition-modal-title"
    //   aria-describedby="transition-modal-description"
    //   // open={open}
    //   open={open}
    //   onClose={handleClose}
    //   // onClose={handleClose}
    //   closeAfterTransition
    //   slots={{ backdrop: Backdrop }}
    //   slotProps={{
    //     backdrop: {
    //       timeout: 500,
    //     },
    //   }}
    // >
    <Dialog open={open} onClose={handleClose}>
      {/* <DialogTitle>Subscribe</DialogTitle> */}
      {/* <DialogContent></DialogContent> */}
      <Fade in={open}>
        <Box
          // position={"absolute"}
          // top={"50%"}
          // left={"50%"}
          bgcolor={"background.paper"}
          boxShadow={24}
          maxWidth={"416px"}
          minWidth={"416px"}
          // height={"400px"}
          paddingLeft={"36px"}
          paddingRight={"36px"}
          paddingTop={"36px"}
          paddingBottom={"36px"}
          // sx={{ transform: "translate(-50%, -50%)" }}
        >
          {activeTab === "login" ? (
            <Formik
              initialValues={{}}
              onSubmit={() => {}}
              // initialValues={initialValues}
              // validationSchema={object({
              //   query: string().required("Обязательное поле"),
              //   totalRecords: number()
              //     .min(1)
              //     .max(100)
              //     .required("Обязательное поле"),
              // })}
              // validateOnMount
              // onSubmit={async (values) => {
              //   const emptyNameField = schema.find((field) => !field.name.trim());
              //   if (emptyNameField) {
              //     handleError("Все поля 'Название' должны быть заполнены");
              //     return;
              //   }
              //   setLoading(true);
              //   setError("");
              //   try {
              //     const dto = mapValuesToDTO(values);
              //     const response = await generateData(dto);
              //     if (!response.ok) throw new Error("Ошибка при отправке формы");
              //     const data = await response.json();
              //     setResponseJson(data);
              //   } catch (err) {
              //     handleError((err as Error).message);
              //   } finally {
              //     setLoading(false);
              //   }
              // }}
            >
              {({ values, setValues, isValid }) => (
                <Form
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <Stack spacing={1}>
                    <Typography
                      id="transition-modal-title"
                      variant="h3"
                      component="h2"
                    >
                      Войдите в аккаунт
                    </Typography>
                    <Stack spacing={2}>
                      <Stack spacing={1}>
                        <TextInput
                          name="login"
                          placeholder="Введите адрес эл. почты"
                        />
                        <TextInput
                          name="password"
                          placeholder="Введите пароль"
                        />
                      </Stack>
                      {/* <InputField /> */}
                      <Button
                        variant="contained"
                        // startIcon={<AddIcon />}
                        // onClick={handleAddField}
                        sx={{
                          // marginTop: "16px",
                          background: "#4f8cff",
                          color: "white",
                          borderRadius: "7px",
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "16px",
                          lineHeight: "24px",
                          boxSizing: "content-box",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          paddingLeft: "12px",
                          // fontSize: "15px",
                          // height: "36px",
                          boxShadow: "none",
                          "&:hover": { background: "#3a6fd8" },
                        }}
                      >
                        Войти
                      </Button>
                      <Stack
                        padding={1}
                        gap={1}
                        direction="row"
                        justifyContent={"center"}
                        alignItems={"flex-end"}
                        flexWrap="nowrap"
                        width={"100%"}
                      >
                        <Typography variant="subtitle1">
                          Еще нет аккаунта?
                        </Typography>
                        <Link
                          onClick={handleGoToSignup}
                          underline="always"
                          color="text.primary"
                          variant="subtitle1"
                          sx={{
                            cursor: "pointer",
                            userSelect: "none",
                            fontWeight: "600",
                            "&:hover": {
                              color: "inherit", // or any specific color you want to maintain
                              backgroundColor: "transparent", // if there's any background color change
                            },
                          }}
                        >
                          Зарегистрироваться
                        </Link>
                      </Stack>
                    </Stack>
                  </Stack>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={{}}
              onSubmit={() => {}}
              // initialValues={initialValues}
              // validationSchema={object({
              //   query: string().required("Обязательное поле"),
              //   totalRecords: number()
              //     .min(1)
              //     .max(100)
              //     .required("Обязательное поле"),
              // })}
              // validateOnMount
              // onSubmit={async (values) => {
              //   const emptyNameField = schema.find((field) => !field.name.trim());
              //   if (emptyNameField) {
              //     handleError("Все поля 'Название' должны быть заполнены");
              //     return;
              //   }
              //   setLoading(true);
              //   setError("");
              //   try {
              //     const dto = mapValuesToDTO(values);
              //     const response = await generateData(dto);
              //     if (!response.ok) throw new Error("Ошибка при отправке формы");
              //     const data = await response.json();
              //     setResponseJson(data);
              //   } catch (err) {
              //     handleError((err as Error).message);
              //   } finally {
              //     setLoading(false);
              //   }
              // }}
            >
              {({ values, setValues, isValid }) => (
                <Form
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <Stack spacing={1}>
                    <Typography
                      id="transition-modal-title"
                      variant="h3"
                      component="h2"
                    >
                      Создайте аккаунт в Fillusion
                    </Typography>
                    <Stack spacing={2}>
                      <Stack spacing={1}>
                        <TextInput name="name" placeholder="Введите ваше имя" />
                        <TextInput
                          name="login"
                          placeholder="Введите адрес эл. почты"
                        />
                        <TextInput
                          name="password"
                          placeholder="Введите пароль"
                        />
                        <TextInput
                          name="repeatPassword"
                          placeholder="Повторите пароль"
                        />
                      </Stack>
                      {/* <InputField /> */}
                      <Button
                        variant="contained"
                        // startIcon={<AddIcon />}
                        // onClick={handleAddField}
                        sx={{
                          // marginTop: "16px",
                          background: "#4f8cff",
                          color: "white",
                          borderRadius: "7px",
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "16px",
                          lineHeight: "24px",
                          boxSizing: "content-box",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          paddingLeft: "12px",
                          // fontSize: "15px",
                          // height: "36px",
                          boxShadow: "none",
                          "&:hover": { background: "#3a6fd8" },
                        }}
                      >
                        Войти
                      </Button>
                      <Stack
                        padding={1}
                        gap={1}
                        direction="row"
                        justifyContent={"center"}
                        alignItems={"flex-end"}
                        flexWrap="nowrap"
                        width={"100%"}
                      >
                        <Typography variant="subtitle1">
                          Уже есть аккаунт?
                        </Typography>
                        <Link
                          onClick={handleGoToLogin}
                          underline="always"
                          color="text.primary"
                          variant="subtitle1"
                          sx={{
                            cursor: "pointer",
                            userSelect: "none",
                            fontWeight: "600",
                            "&:hover": {
                              color: "inherit", // or any specific color you want to maintain
                              backgroundColor: "transparent", // if there's any background color change
                            },
                          }}
                        >
                          Создать аккаунт
                        </Link>
                      </Stack>
                    </Stack>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
        </Box>
      </Fade>
    </Dialog>
    // </Modal>
    // <Modal isOpen={isOpen} onClose={onClose}>
    //   <Tabs>
    //     <Tab
    //       active={activeTab === "login"}
    //       onClick={() => setActiveTab("login")}
    //     >
    //       Login
    //     </Tab>
    //     <Tab
    //       active={activeTab === "signup"}
    //       onClick={() => setActiveTab("signup")}
    //     >
    //       Sign Up
    //     </Tab>
    //   </Tabs>
    //   {/*
    //   {activeTab === "login" ? (
    //     <LoginForm onSuccess={onClose} />
    //   ) : (
    //     <SignupForm onSuccess={onClose} />
    //   )} */}
    // </Modal>
  );
};
