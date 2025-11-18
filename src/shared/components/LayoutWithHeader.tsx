import type { ReactNode } from "react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Edit, Logout, Person } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { Field, Form, Formik, useFormikContext } from "formik";
import * as yup from "yup";
import { Auth } from "@pages";

interface UpdateProfileForm {
  name: string;
  avatar?: ArrayBuffer;
}

// Схема валидации для изменения имени
const updateNameSchema = yup.object({
  name: yup
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .required("Введите имя"),
});

export const LayoutWithHeader = ({
  children,
  noJustify,
  transparent,
}: {
  children: ReactNode;
  noJustify?: boolean;
  transparent?: boolean;
}) => {
  const navigate = useNavigate();
  const { user, isLoading, logout, updateProfile } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [open, setOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
  };

  const handleUpdateProfile = async (values: UpdateProfileForm) => {
    try {
      // await updateProfile({ user: { name: values.name } });
      // const formData = new FormData();
      // formData.append('name', values.name)
      // await updateProfile(formData);
      await updateProfile({ name: values.name, avatar: values.avatar });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Ошибка при обновлении имени:", error);
    }
  };

  // Генерация инициалов для аватара
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Генерация цвета для аватара на основе имени
  const getAvatarColor = () => {
    if (!user?.name) return "#4f8cff";

    const colors = [
      "#4f8cff",
      "#7f53ff",
      "#ff6a88",
      "#ffa726",
      "#66bb6a",
      "#ef5350",
      "#ab47bc",
      "#26c6da",
      "#d4e157",
      "#ff7043",
    ];

    const index = user.name.length % colors.length;
    return colors[index];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <header
        style={{
          position: transparent ? "absolute" : "initial",
          top: "0px",
          width: "100dvw",
          backgroundColor: "#18191b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          boxSizing: "border-box",
          zIndex: transparent ? "2" : "auto",
        }}
      >
        <h2
          style={{
            margin: "16px 0",
            color: "white",
            background:
              /*transparent
                ? "linear-gradient(90deg, #000b69ff 0%, #000a44ff 50%, #000000ff 100%)"
                : */ "linear-gradient(90deg, #2d3383ff 0%, #7f53ff 50%, #d6002bff 100%)",
            width: "fit-content",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 800,
            fontSize: "2rem",
            letterSpacing: "2px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          Fillusion
        </h2>

        {isLoading && (
          <Box display="flex" alignItems="center" gap={1}>
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Box>
              <Skeleton
                variant="text"
                width={100}
                height={24}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
              <Skeleton
                variant="text"
                width={150}
                height={16}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
              />
            </Box>
          </Box>
        )}
        {!isLoading && user && (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="body1"
              sx={{
                color: "white",
                fontWeight: 600,
                display: { xs: "none", sm: "block" },
              }}
            >
              {user.name}
            </Typography>

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {user.avatarUrl ? (
                <Avatar
                  src={user.avatarUrl}
                  sx={{
                    width: 40,
                    height: 40,
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    bgcolor: getAvatarColor(),
                    width: 40,
                    height: 40,
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              )}
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={handleEditProfile}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: "8px 16px",
                }}
              >
                <Edit fontSize="small" />
                <Typography variant="body2">Изменить профиль</Typography>
              </MenuItem>

              <MenuItem
                onClick={handleLogout}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: "8px 16px",
                  color: "error.main",
                }}
              >
                <Logout fontSize="small" />
                <Typography variant="body2">Выйти</Typography>
              </MenuItem>
            </Menu>
          </Box>
        )}
        {!isLoading && !user && (
          <div>
            <Button
              variant="outlined"
              onClick={() => setOpen(true)}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  backgroundColor: "#2b2b2bff",
                },
              }}
            >
              Войти
            </Button>
            <Auth open={open} onClose={() => setOpen(false)} />
          </div>
        )}
      </header>

      <div
        style={{
          width: "100%",
          display: "flex",
          minHeight: "calc(100dvh - 80px)",
          flexDirection: "column",
          justifyContent: noJustify ? "" : "center",
          alignItems: "center",
          background: "#F3F3F5",
        }}
      >
        {children}
      </div>

      {/* Диалог изменения имени */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle>
          <Typography fontWeight={600}>Изменить профиль</Typography>
        </DialogTitle>

        <Formik<UpdateProfileForm>
          initialValues={{
            avatar: undefined,
            name: user?.name || "",
          }}
          validationSchema={updateNameSchema}
          onSubmit={handleUpdateProfile}
          enableReinitialize
        >
          {({
            isSubmitting,
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
          }) => (
            <Form>
              <DialogContent>
                <MenuItem
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "12px 16px",
                    cursor: "default",
                  }}
                  disableTouchRipple
                  disableRipple
                >
                  <Avatar
                    src={values.avatar || user?.avatarUrl}
                    sx={{
                      // bgcolor: getAvatarColor(),
                      width: 40,
                      height: 40,
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  />

                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {values.name || user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Box marginLeft="auto">
                    <Field name="avatar" marginLeft="auto">
                      {({
                        field, // { name, value, onChange, onBlur }
                        form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
                        meta,
                      }) => {
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        const formikProps = useFormikContext();

                        const handleAvatarChange = (event) => {
                          let reader = new FileReader();
                          let file = event.target.files[0];
                          reader.onloadend = () => {
                            formikProps.setFieldValue("avatar", reader.result);
                          };
                          reader.readAsDataURL(file);
                        };

                        return (
                          <div>
                            <input
                              type="file"
                              id="avatar-upload"
                              accept="image/*"
                              style={{ display: "none" }}
                              // {...field}
                              onChange={handleAvatarChange}
                            />
                            <label htmlFor="avatar-upload">
                              <Button
                                component="span"
                                variant="outlined"
                                size="small"
                              >
                                Загрузить аватар
                              </Button>
                            </label>
                            {/* {meta.touched && meta.error && (
                              <div className="error">{meta.error}</div>
                            )} */}
                          </div>
                        );
                      }}
                    </Field>
                  </Box>
                </MenuItem>

                <TextField
                  name="name"
                  label="Ваше имя"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  fullWidth
                  margin="normal"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </DialogContent>

              <DialogActions sx={{ padding: "16px 24px", gap: 1 }}>
                <Button
                  onClick={() => setEditDialogOpen(false)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                  }}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "8px",
                    background: "#4f8cff",
                    "&:hover": { background: "#3a6fd8" },
                  }}
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};
