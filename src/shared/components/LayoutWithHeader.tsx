import type { ReactNode } from "react";
import { useState } from "react";
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
  Divider,
} from "@mui/material";
import { Edit, Logout, Person } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { Form, Formik } from "formik";
import * as yup from "yup";

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
}: {
  children: ReactNode;
  noJustify?: boolean;
}) => {
  const navigate = useNavigate();
  // const { user, logout, updateProfile } = useAuth();
  const user = { name: "124124", email: "3r12141@12414.ru" };
  const logout = () => {};
  const updateProfile = () => {};

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const handleUpdateName = async (values: { name: string }) => {
    try {
      await updateProfile({ name: values.name });
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
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          width: "100dvw",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: noJustify ? "" : "center",
          alignItems: "center",
          background: "#F3F3F5",
        }}
      >
        <header
          style={{
            position: "absolute",
            top: "0px",
            width: "100dvw",
            backgroundColor: "#becaff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              margin: "16px 0",
              color: "white",
              background:
                "linear-gradient(90deg, #4f8cff 0%, #7f53ff 50%, #ff6a88 100%)",
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

          {user && (
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: "12px 16px",
                  }}
                  disabled
                >
                  <Person fontSize="small" />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>

                <Divider />

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
                  <Typography variant="body2">Изменить имя</Typography>
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
        </header>

        {children}

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
            <Typography variant="h6" fontWeight={600}>
              Изменить имя
            </Typography>
          </DialogTitle>

          <Formik
            initialValues={{ name: user?.name || "" }}
            validationSchema={updateNameSchema}
            onSubmit={handleUpdateName}
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
    </div>
  );
};
