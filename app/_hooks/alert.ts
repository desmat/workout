import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AlertType } from '@/types/Alert';
import trackEvent from '@/utils/trackEvent';

const useAlert: any = create(devtools((set: any, get: any) => ({
  message: undefined as string | undefined,
  type: undefined as AlertType | undefined,

  error: async (message?: string) => {
    // console.log(">> hooks.alert.error", { message });
    trackEvent("error", { message })
    set({ message, type: message && "error" });
  },

  warning: async (message?: string) => {
    // console.log(">> hooks.alert.warning", { message });
    set({ message, type: message && "warning" });
  },

  info: async (message?: string) => {
    // console.log(">> hooks.alert.info", { message });
    set({ message, type: message && "info" });
  },

  success: async (message?: string) => {
    // console.log(">> hooks.alert.success", { message });
    set({ message, type: message && "success" });
  },
})));

export default useAlert;
