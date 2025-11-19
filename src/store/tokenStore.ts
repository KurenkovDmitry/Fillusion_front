import { create } from "zustand";

// Определяем интерфейс для типизации
interface TokenStore {
  token: string | null;
  setToken: (value: string | null) => void;
}

// Создаем store
export const useTokenStore = create<TokenStore>()((set) => ({
  token: localStorage.getItem("token"),
  setToken: (value) => {
    set({ token: value });
    if (!value) {
      localStorage.removeItem("token");
    } else {
      localStorage.setItem("token", value);
    }
  },
}));
