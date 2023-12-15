import { User } from 'firebase/auth';
import moment from 'moment';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Exercise } from '@/types/Exercise';

type AlertType = "error";

const useAlert: any = create(devtools((set: any, get: any) => ({
  message: undefined as string | undefined,
  type: undefined as AlertType | undefined,

  error: async (message: string) => {
    console.log(">> hooks.alert.error", { message });
    set({ message, type: "error" });
  },
})));

export default useAlert;
