import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Dialog,
} from "@mui/material";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { useLocation } from "react-router-dom";
import { TextInput } from "../../ui/form";
import { useAuth } from "@shared/hooks";
import { useTokenStore } from "../../store/tokenStore";

// Схемы валидации
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Введите корректный email")
    .required("Email обязателен"),
  password: yup
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .required("Пароль обязателен"),
});

const signupSchema = yup.object({
  name: yup
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя слишком длинное")
    .required("Имя обязательно"),
  email: yup
    .string()
    .email("Введите корректный email")
    .required("Email обязателен"),
  password: yup
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру"
    )
    .required("Пароль обязателен"),
  repeatPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Пароли должны совпадать")
    .required("Повторите пароль"),
});

export const Auth = (props: { open: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "confirm">(
    "login"
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const { login, register } = useAuth();
  const location = useLocation();

  // Получаем путь для возврата после аутентификации
  const from = (location.state as any)?.from?.pathname || "/";

  const handleChangeTab = (
    event: React.SyntheticEvent,
    newValue: "login" | "signup" | "confirm"
  ) => {
    setIsChanging(true);
    setTimeout(() => {
      setActiveTab(newValue);
      setError(null);
      setIsChanging(false);
    }, 400); // Half of our transition time
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await login(values);
      props.onClose();
    } catch (error: any) {
      setError("Произошла ошибка при входе");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (values: {
    name: string;
    email: string;
    password: string;
    repeatPassword: string;
  }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { repeatPassword, ...registerData } = values;
      await register(registerData);

      setActiveTab("confirm");
    } catch (error: any) {
      setError(error.message || "Произошла ошибка при регистрации");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Box
        sx={{
          width: activeTab === "confirm" ? "600px" : "416px",
          margin: "auto",
          padding: 4,
          bgcolor: "background.paper",
          boxShadow: 3,
          borderRadius: 2,
          transition: "height 0.3s ease-in-out",
          height:
            activeTab === "login"
              ? "430px"
              : activeTab === "confirm"
              ? "auto"
              : "665px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            opacity: isChanging ? 0 : 1,
            transition: "opacity 0.3s ease-out",
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {activeTab === "login" ? (
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
              validateOnMount
            >
              {({ isValid, dirty }) => (
                <Form
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h3" component="h1">
                    Вход
                  </Typography>

                  <TextInput
                    name="email"
                    label="Email"
                    placeholder="Введите адрес эл. почты"
                    type="email"
                    disabled={isSubmitting}
                  />
                  <TextInput
                    name="password"
                    label="Пароль"
                    placeholder="Введите пароль"
                    type="password"
                    isPassword
                    disabled={isSubmitting}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || !dirty || isSubmitting}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      height: 44,
                      position: "relative",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress
                          size={20}
                          sx={{ color: "white", mr: 1 }}
                        />
                        Вход...
                      </>
                    ) : (
                      "Войти"
                    )}
                  </Button>

                  <Typography variant="body2" color="text.secondary">
                    Нет аккаунта?{" "}
                    <Link
                      component="button"
                      type="button"
                      onClick={() => handleChangeTab({} as any, "signup")}
                      sx={{ fontWeight: 600 }}
                      disabled={isSubmitting}
                    >
                      Зарегистрироваться
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          ) : activeTab === "signup" ? (
            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                repeatPassword: "",
              }}
              validationSchema={signupSchema}
              onSubmit={handleSignup}
              validateOnMount
            >
              {({ isValid, dirty }) => (
                <Form
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h3" component="h1">
                    Регистрация
                  </Typography>

                  <TextInput
                    name="name"
                    label="Имя"
                    placeholder="Введите ваше имя"
                    disabled={isSubmitting}
                  />
                  <TextInput
                    name="email"
                    label="Email"
                    placeholder="Введите адрес эл. почты"
                    type="email"
                    disabled={isSubmitting}
                  />
                  <TextInput
                    name="password"
                    label="Пароль"
                    placeholder="Введите пароль"
                    type="password"
                    isPassword
                    disabled={isSubmitting}
                  />
                  <TextInput
                    name="repeatPassword"
                    placeholder="Повторите пароль"
                    label="Повторите пароль"
                    type="password"
                    isPassword
                    disabled={isSubmitting}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || !dirty || isSubmitting}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      height: 44,
                      position: "relative",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress
                          size={20}
                          sx={{ color: "white", mr: 1 }}
                        />
                        Регистрация...
                      </>
                    ) : (
                      "Зарегистрироваться"
                    )}
                  </Button>

                  <Typography variant="body2" color="text.secondary">
                    Уже есть аккаунт?{" "}
                    <Link
                      component="button"
                      type="button"
                      onClick={() => handleChangeTab({} as any, "login")}
                      sx={{ fontWeight: 600 }}
                      disabled={isSubmitting}
                    >
                      Войти
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Проверьте вашу почту</h2>
              <p style={{ marginTop: 0 }}>
                Мы отправили письмо с подтверждением регистрации на ваш адрес
              </p>
              <p style={{ marginTop: 0 }}>
                Перейдите по ссылке в письме, чтобы завершить регистрацию и
                начать работу с платформой.
              </p>
              <Button
                variant="contained"
                onClick={() => setActiveTab("login")}
                sx={{ height: "37px", marginTop: "10px" }}
              >
                Войти
              </Button>
            </div>
          )}
        </div>
      </Box>
    </Dialog>
  );
};
