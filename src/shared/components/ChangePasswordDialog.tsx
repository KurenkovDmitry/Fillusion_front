import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  InputAdornment, // Добавлено
  IconButton, // Добавлено
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Добавлено (убедитесь, что пакет @mui/icons-material установлен)
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useStyles } from "./LayoutWithHeader.styles";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  updateProfile: (data: any) => Promise<void>;
}

const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Обязательное поле"),
  newPassword: yup
    .string()
    .min(8, "Минимум 8 символов")
    .matches(/.*[A-ZА-Я].*/, "Нужна заглавная буква")
    .matches(/.*[0-9].*/, "Нужна цифра")
    .notOneOf([yup.ref("currentPassword")], "Пароли должны отличаться")
    .required("Обязательное поле"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
    .required("Обязательное поле"),
});

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  updateProfile,
}) => {
  const { classes } = useStyles();
  const [serverError, setServerError] = useState<string | null>(null);

  // Состояния для видимости паролей
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Обработчик клика (чтобы не терялся фокус с инпута)
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // event.preventDefault();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      disableScrollLock
      fullWidth
      sx={{
        borderRadius: "12px",
        "& .MuiPaper-root": {
          "@media (max-width: 600px)": {
            margin: 0,
            width: "95%",
          },
        },
      }}
    >
      <DialogTitle className={classes.changePasswordTitle}>
        <Typography fontWeight={600}>Изменить пароль</Typography>
      </DialogTitle>
      <Formik
        initialValues={{
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }}
        validationSchema={changePasswordSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setServerError(null);
          try {
            await updateProfile({ user: { password: values.newPassword } });
            onClose();
          } catch (error: any) {
            setServerError(error?.message || "Ошибка смены пароля");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          handleChange,
          handleBlur,
          touched,
          errors,
          isSubmitting,
          isValid,
          dirty,
        }) => (
          <Form>
            <DialogContent
              sx={{
                "&.MuiDialogContent-root": { paddingTop: 0, paddingBottom: 0 },
              }}
            >
              {/* ТЕКУЩИЙ ПАРОЛЬ */}
              <TextField
                name="currentPassword"
                label="Текущий пароль"
                type={showCurrentPassword ? "text" : "password"} // Динамический тип
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.currentPassword && Boolean(errors.currentPassword)
                }
                helperText={touched.currentPassword && errors.currentPassword}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showCurrentPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* НОВЫЙ ПАРОЛЬ */}
              <TextField
                name="newPassword"
                label="Новый пароль"
                type={showNewPassword ? "text" : "password"}
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* ПОДТВЕРЖДЕНИЕ ПАРОЛЯ */}
              <TextField
                name="confirmNewPassword"
                label="Подтверждение пароля"
                type={showConfirmPassword ? "text" : "password"}
                value={values.confirmNewPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.confirmNewPassword &&
                  Boolean(errors.confirmNewPassword)
                }
                helperText={
                  touched.confirmNewPassword && errors.confirmNewPassword
                }
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {serverError && (
                <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                  {serverError}
                </Typography>
              )}
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button onClick={onClose} className={classes.cancelButton}>
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !dirty || !isValid}
                className={classes.saveButton}
              >
                {isSubmitting ? "Сохранение..." : "Сменить пароль"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
