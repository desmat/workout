import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type AlertType = "error";

const useAlert: any = create(devtools((set: any, get: any) => ({
  message: undefined as string | undefined,
  type: undefined as AlertType | undefined,

  error: async (message?: string) => {
    console.log(">> hooks.alert.error", { message });
    set({ message, type: "error" });
  },
})));

export default useAlert;
