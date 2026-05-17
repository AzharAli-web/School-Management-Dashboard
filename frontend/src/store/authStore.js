import { create } from "zustand";
import api from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null,
  token: null, // Initialize as null to avoid hydration mismatch
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      set({ user: data, token: data.token, isLoading: false });
      return data.role;
    } catch (error) {
      set({
        error: error.response?.data?.message || "An error occurred",
        isLoading: false,
      });
      return false;
    }
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      localStorage.setItem("token", data.token);
      set({ user: data, token: data.token, isLoading: false });
      return data.role;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },

  logout: (callback) => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
    if (callback) callback();
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/auth/profile");
      set({ user: data, isLoading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, token: null, isLoading: false });
    }
  },
  
  initialize: () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ token });
    }
  }
}));
