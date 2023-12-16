import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AlertType } from '@/types/Alert';

const useAlert: any = create(devtools((set: any, get: any) => ({
  message: undefined as string | undefined,
  type: undefined as AlertType | undefined,

  error: async (message?: string) => {
    console.log(">> hooks.alert.error", { message });
    set({ message, type: "error" });
  },

  warning: async (message?: string) => {
    console.log(">> hooks.alert.warning", { message });
    set({ message, type: "warning" });
  },

  info: async (message?: string) => {
    console.log(">> hooks.alert.info", { message });
    set({ message, type: "info" });
  },

  success: async (message?: string) => {
    console.log(">> hooks.alert.success", { message });
    set({ message, type: "success" });
  },
})));

export default useAlert;
