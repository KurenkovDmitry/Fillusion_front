import React, { useEffect, useState, ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Edit, Logout, Person } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { Auth } from "@pages";
import { useStyles } from "./LayoutWithHeader.styles";
import { EditProfileDialog } from "./EditProfileDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

interface LayoutProps {
  children: ReactNode;
  noJustify?: boolean;
  transparent?: boolean;
  activeLogin?: boolean;
  setActiveLogin?: React.Dispatch<React.SetStateAction<boolean>>;
}

// Утилиты для аватара (можно вынести в utils)
const getAvatarColor = (name: string = "") => {
  const colors = ["#4f8cff", "#7f53ff", "#ff6a88", "#ffa726", "#66bb6a"];
  return colors[name.length % colors.length] || "#4f8cff";
};

const getUserInitials = (name: string = "") => {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
};

export const LayoutWithHeader: React.FC<LayoutProps> = ({
  children,
  noJustify,
  transparent,
  activeLogin,
  setActiveLogin,
}) => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const { user, isLoading, logout, updateProfile } = useAuth();

  const [params] = useSearchParams();
  const isLoginUrlParam = params.get("withLogin") === "true";

  // Состояние меню и диалогов
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Синхронизация открытия логина
  useEffect(() => {
    const shouldBeOpen = (activeLogin || isLoginUrlParam) && !user;
    if (shouldBeOpen) {
      setIsAuthOpen(true);
    }
  }, [activeLogin, isLoginUrlParam, user]);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
  };

  const navigateToProjects = () => {
    navigate("/projects");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <header
        className={cx(classes.header, transparent && classes.headerTransparent)}
      >
        <h2 className={classes.logo} onClick={() => navigate("/")}>
          Fillusion
        </h2>

        {/* Скелетон загрузки */}
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
            </Box>
          </Box>
        )}

        {/* Пользователь авторизован */}
        {!isLoading && user && (
          <div className={classes.header__logoSection}>
            <span
              className={classes.header__projectsLink}
              aria-label="projects-link"
              onClick={navigateToProjects}
            >
              Проекты
            </span>
            <div className={classes.header__divider} />
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontWeight: 500,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {user.name}
              </Typography>

              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  padding: "4px",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                {user.avatarUrl ? (
                  <Avatar src={user.avatarUrl} sx={{ width: 40, height: 40 }} />
                ) : (
                  <Avatar
                    sx={{
                      bgcolor: getAvatarColor(user.name),
                      width: 40,
                      height: 40,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {getUserInitials(user.name)}
                  </Avatar>
                )}
              </IconButton>

              <Menu
                disableScrollLock
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem
                  onClick={() => {
                    setIsEditOpen(true);
                    setAnchorEl(null);
                  }}
                  sx={{ gap: 1 }}
                >
                  <Edit fontSize="small" /> Изменить профиль
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setIsPassOpen(true);
                    setAnchorEl(null);
                  }}
                  sx={{ gap: 1 }}
                >
                  <Person fontSize="small" /> Изменить пароль
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ gap: 1, color: "error.main" }}
                >
                  <Logout fontSize="small" /> Выйти
                </MenuItem>
              </Menu>
            </Box>
          </div>
        )}

        {/* Кнопка войти */}
        {!isLoading && !user && (
          <div>
            <Button
              variant="outlined"
              onClick={() => setIsAuthOpen(true)}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": { backgroundColor: "#2b2b2bff" },
              }}
            >
              Войти
            </Button>
            <Auth
              open={isAuthOpen}
              onClose={() => {
                setIsAuthOpen(false);
                setActiveLogin?.(false); // Уведомляем родителя, если нужно
              }}
            />
          </div>
        )}
      </header>

      {/* Основной контент */}
      <div
        className={cx(
          classes.mainContent,
          !noJustify && classes.mainContentCentered
        )}
      >
        {children}
      </div>

      {/* Подключенные диалоги */}
      <EditProfileDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        updateProfile={updateProfile}
      />

      <ChangePasswordDialog
        open={isPassOpen}
        onClose={() => setIsPassOpen(false)}
        updateProfile={updateProfile}
      />
    </div>
  );
};
