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
import { TextInput } from "../../ui/form";
import { useAuth } from "@shared/hooks";

// Схемы валидации
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Введите корректный email")
    .required("Email обязателен"),
  password: yup
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
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
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(100, "Пароль не может содержать более 100 символов")
    .matches(
      /.*[A-ZА-Я].*/,
      "Пароль должен содержать хотя бы одну заглавную букву"
    )
    .matches(/.*[0-9].*/, "Пароль должен содержать хотя бы одну цифру")
    .matches(
      /.*[a-zа-я].*/,
      "Пароль должен содержать хотя бы одну строчную букву"
    )
    .required("Пароль обязателен"),
  repeatPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Пароли должны совпадать")
    .required("Повторите пароль"),
});

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Введите корректный email")
    .required("Email обязателен"),
});

type Tabs =
  | "login"
  | "signup"
  | "confirm"
  | "forgotPassword"
  | "forgotPasswordSuccess";

export const Auth = (props: { open: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<Tabs>("login");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const { login, register, forgotPassword } = useAuth();

  const handleChangeTab = (newValue: Tabs) => {
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

  const handleForgotPassword = async (values: { email: string }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      await forgotPassword(values);

      setActiveTab("forgotPasswordSuccess");
    } catch (error: any) {
      setError(error.message || "Произошла ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} disableScrollLock={true}>
      <Box
        sx={{
          width:
            activeTab === "confirm" || activeTab === "forgotPasswordSuccess"
              ? "600px"
              : activeTab === "forgotPassword"
              ? "486px"
              : "416px",
          margin: "auto",
          padding: 4,
          bgcolor: "background.paper",
          boxShadow: 3,
          borderRadius: 2,
          transition: "height 0.3s ease-in-out, width 0.3s ease",
          height:
            activeTab === "login"
              ? "430px"
              : activeTab === "confirm" || activeTab === "forgotPasswordSuccess"
              ? "auto"
              : activeTab === "forgotPassword"
              ? "360px"
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
              key="login"
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
                      onClick={() => handleChangeTab("signup")}
                      sx={{ fontWeight: 600 }}
                      disabled={isSubmitting}
                    >
                      Зарегистрироваться
                    </Link>
                    <Link
                      component="button"
                      type="button"
                      onClick={() => handleChangeTab("forgotPassword")}
                      sx={{ fontWeight: 600 }}
                      disabled={isSubmitting}
                      variant="body2"
                    >
                      Забыли пароль?
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          ) : activeTab === "signup" ? (
            <Formik
              key="signup"
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
                      onClick={() => handleChangeTab("login")}
                      sx={{ fontWeight: 600 }}
                      disabled={isSubmitting}
                    >
                      Войти
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          ) : activeTab === "confirm" ? (
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
          ) : activeTab === "forgotPassword" ? (
            <Formik
              key="forgotPassword"
              initialValues={{ email: "" }}
              validationSchema={forgotPasswordSchema}
              onSubmit={handleForgotPassword}
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
                    Восстановление пароля
                  </Typography>

                  <Typography variant="body1" component="h3">
                    Введите email, который привязан к вашему аккаунту
                  </Typography>

                  <TextInput
                    name="email"
                    label="Email"
                    placeholder="Введите адрес эл. почты"
                    type="email"
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
                    Отправить письмо
                  </Button>
                  <div style={{ width: "100%", fontSize: "14px" }}>
                    <Link onClick={() => handleChangeTab("login")}>
                      Вернуться к логину
                    </Link>
                  </div>
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
                Мы отправили письмо с временным паролем на ваш адрес,
                используйте его для входа в систему, после чего смените его
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
