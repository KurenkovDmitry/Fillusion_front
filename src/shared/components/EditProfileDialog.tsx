import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  MenuItem,
} from "@mui/material";
import { Formik, Form, Field, FieldProps } from "formik";
import * as yup from "yup";
import { useStyles } from "./LayoutWithHeader.styles";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: any;
  updateProfile: (data: any) => Promise<void>;
}

const updateNameSchema = yup.object({
  name: yup
    .string()
    .min(2, "Минимум 2 символа")
    .max(50, "Максимум 50 символов")
    .required("Обязательное поле"),
});

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  user,
  updateProfile,
}) => {
  const { classes } = useStyles();

  // Начальные значения формы
  const initialValues = useMemo(
    () => ({
      avatar: undefined as File | undefined,
      name: user?.name || "",
    }),
    [user]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          "@media (max-width: 600px)": {
            margin: 0,
            width: "95%",
          },
        },
      }}
    >
      <DialogTitle className={classes.changePasswordTitle}>
        <Typography fontWeight={600}>Изменить профиль</Typography>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={updateNameSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await updateProfile({
              user: { name: values.name },
              avatar: values.avatar,
            });
            onClose();
          } catch (error) {
            console.error(error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, isSubmitting, isValid, dirty }) => {
          // Создаем превью URL безопасно
          const avatarPreview = values.avatar
            ? URL.createObjectURL(values.avatar)
            : user?.avatarUrl;

          return (
            <Form>
              <DialogContent
                sx={{
                  "&.MuiDialogContent-root": {
                    paddingTop: "6px",
                    paddingBottom: "6px",
                  },
                }}
              >
                <MenuItem
                  disableRipple
                  sx={{ cursor: "default", gap: 2, padding: "4px", mb: 2 }}
                >
                  <Avatar src={avatarPreview} sx={{ width: 56, height: 56 }} />
                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <Typography noWrap fontWeight={600}>
                      {values.name || user?.name}
                    </Typography>
                    <Typography noWrap variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>

                  <Field name="avatar">
                    {({ form }: FieldProps) => (
                      <label htmlFor="avatar-upload">
                        <input
                          id="avatar-upload"
                          name="avatar"
                          type="file"
                          accept="image/*"
                          className={classes.avatarUploadBtn}
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            if (file) form.setFieldValue("avatar", file);
                          }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          className={classes.buttonOutlined}
                          component="span"
                        >
                          Загрузить
                        </Button>
                      </label>
                    )}
                  </Field>
                </MenuItem>

                <Field name="name">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Ваше имя"
                      fullWidth
                      margin="normal"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </DialogContent>

              <DialogActions className={classes.dialogActions}>
                <Button onClick={onClose} className={classes.cancelButton}>
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || !dirty || isSubmitting}
                  className={classes.saveButton}
                >
                  Сохранить
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};
