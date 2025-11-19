import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@services/api";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "@services/api";
import { useTokenStore } from "@store/tokenStore";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: UpdateProfileRequest) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { token, setToken } = useTokenStore();
  const tokenRef = useRef(token);

  const checkAuth = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    const { accessToken } = await AuthService.login(credentials);
    setToken(accessToken);
    const user = await AuthService.getCurrentUser();
    setUser(user);
  };

  const register = async (userData: RegisterRequest) => {
    const { accessToken } = await AuthService.register(userData);
    setToken(accessToken);
  };

  const refresh = async () => {
    const { accessToken } = await AuthService.refreshToken();
    setToken(accessToken);
  };

  const logout = async () => {
    await AuthService.logout();
    setToken(null);
    setUser(null);
    navigate("/");
  };

  const updateProfile = async (userData: UpdateProfileRequest) => {
    await AuthService.updateProfile(userData);
    const user = await AuthService.getCurrentUser();
    setUser(user);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    refresh,
    logout,
    updateProfile,
    checkAuth,
  };

  useEffect(() => {
    if (tokenRef.current) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
