import React, { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
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

export const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем путь для возврата после аутентификации
  const from = (location.state as any)?.from?.pathname || "/";

  const handleChangeTab = (
    event: React.SyntheticEvent,
    newValue: "login" | "signup"
  ) => {
    setActiveTab(newValue);
    setError(null); // Сбрасываем ошибку при переключении вкладок
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await login(values);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || "Произошла ошибка при входе");
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

      // Убираем repeatPassword из данных для регистрации
      const { repeatPassword, ...registerData } = values;
      await register(registerData);

      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || "Произошла ошибка при регистрации");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 416,
        margin: "auto",
        padding: 4,
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: 2,
        mt: 8,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChangeTab}
        aria-label="auth tabs"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Вход" value="login" disabled={isSubmitting} />
        <Tab label="Регистрация" value="signup" disabled={isSubmitting} />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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
            <Form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                Войдите в аккаунт
              </Typography>

              <TextInput
                name="email"
                placeholder="Введите адрес эл. почты"
                type="email"
                disabled={isSubmitting}
              />
              <TextInput
                name="password"
                placeholder="Введите пароль"
                type="password"
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

              <Typography variant="body2" color="text.secondary" align="center">
                Нет аккаунта?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  sx={{ fontWeight: 600 }}
                  disabled={isSubmitting}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Form>
          )}
        </Formik>
      ) : (
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
            <Form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                Создайте аккаунт в Fillusion
              </Typography>

              <TextInput
                name="name"
                placeholder="Введите ваше имя"
                disabled={isSubmitting}
              />
              <TextInput
                name="email"
                placeholder="Введите адрес эл. почты"
                type="email"
                disabled={isSubmitting}
              />
              <TextInput
                name="password"
                placeholder="Введите пароль"
                type="password"
                disabled={isSubmitting}
              />
              <TextInput
                name="repeatPassword"
                placeholder="Повторите пароль"
                type="password"
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

              <Typography variant="body2" color="text.secondary" align="center">
                Уже есть аккаунт?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => setActiveTab("login")}
                  sx={{ fontWeight: 600 }}
                  disabled={isSubmitting}
                >
                  Войти
                </Link>
              </Typography>
            </Form>
          )}
        </Formik>
      )}
    </Box>
  );
};
