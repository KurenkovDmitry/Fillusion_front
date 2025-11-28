import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      disableScrollLock
      fullWidth
      sx={{ borderRadius: "12px" }}
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
              <TextField
                name="currentPassword"
                label="Текущий пароль"
                type="password"
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.currentPassword && Boolean(errors.currentPassword)
                }
                helperText={touched.currentPassword && errors.currentPassword}
                fullWidth
                margin="normal"
              />
              <TextField
                name="newPassword"
                label="Новый пароль"
                type="password"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                fullWidth
                margin="normal"
              />
              <TextField
                name="confirmNewPassword"
                label="Подтверждение пароля"
                type="password"
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
