// components/ProtectedRoute.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@shared/hooks";
import { LayoutWithHeader } from "../LayoutWithHeader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Сохраняем текущий путь для возврата после аутентификации
      navigate("/?withLogin=true", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [user, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <LayoutWithHeader>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </LayoutWithHeader>
    );
  }

  return <>{children}</>;
};
