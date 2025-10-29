import { create } from "zustand";

// Определяем интерфейс для типизации
interface TokenStore {
  token: string;
  setToken: (value: string) => void;
}

// Создаем store
export const useTokenStore = create<TokenStore>()((set) => ({
  token: localStorage.getItem("token") ?? "",
  setToken: (value) => {
    set({ token: value });
    localStorage.setItem("token", value);
  },
}));
