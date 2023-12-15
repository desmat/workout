import { User } from "firebase/auth";
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { init as doInit, logout as doLogout, signin as doSignin, signInAnonymously as doSignInAnonymously } from "@/services/auth";
import { SigninMethod } from "@/types/SigninMethod";

const useUser: any = create(devtools((set: any, get: any) => ({
  user: undefined,
  loaded: false,
  loading: false, // guard against signin in many times anonymously
  fetching: false, // guard against fetching many times

  load: async () => {
    console.log(">> hooks.user.load", {});

    const onAuthStateChanged = async function (user: User) {
      const { user: savedUser, loaded, loading, fetching } = get();
      console.log('>> hooks.User.useUser.onAuthStateChanged', { loading, fetching, loaded, user, savedUser });

      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        if (!fetching && (user.uid != savedUser?.uid || !loaded)) {
          console.log('>> hooks.User.useUser.onAuthStateChanged fetching user', { loading, fetching, loaded, user });
          set({ fetching: true });
          fetch('/api/user', {
            method: "GET"
          }).then(async (response: any) => {
            if (response.status != 200) {
              console.error(`Error fetching user ${user.uid}: ${response.status} (${response.statusText})`);
              set({ loaded: true, loading: false, fetching: false });
              return;
            }

            const updatedUser = await response.json();
            console.log('>> hooks.User.useUser.onAuthStateChanged fetched user', { user, updatedUser });
            set({ user: { ...user, admin: updatedUser.customClaims?.admin }, loaded: true, loading: false, fetching: false });
          });
        }
      } else {
        // User is signed out
        console.log('>> hooks.User.useUser.onAuthStateChanged signed out', { loading, loaded });
        // set({ user: undefined, loaded: true });
        set({ user: undefined });

        // when not signed in or logged out sign in anonymously
        if (!loaded && !loading) {
          set({ loaded: false, loading: true });
          console.log('>> hooks.User.useUser.onAuthStateChanged doSignInAnonymously', { loading, loaded });
          doSignInAnonymously().then(async (auth: any) => {
            const user = auth.user;
            const authToken = await user.getIdToken();
            console.log('>> hooks.User.useUser.onAuthStateChanged doSignInAnonymously completed', { loading, loaded, user, authToken });

            // fetch('/api/user', {
            //   method: "POST",
            //   body: JSON.stringify({ uid: user.uid }),
            //   headers: {
            //     Authorization: `Bearer ${authToken}`,
            //   },
            // }).then(async (response: any) => {
            //   const updatedUser = await response.json();
            //   console.log('>> hooks.User.useUser.onAuthStateChanged doSignInAnonymously fetch user completed', { updatedUser });
            //   set({ user: { ...user, admin: updatedUser.customClaims?.admin }, loaded: true, loading: false });              
            // });
            set({ loading: false });
          });
        }
      }
    };

    return doInit({ onAuthStateChanged }).then((ret: any) => {
      console.log('>> hooks.User.useUser.doInit', { ret });
      // set({ user, loaded: true });
    });
  },

  signin: async (method: SigninMethod, params?: any) => {
    console.log(">> hooks.User.signin", { method, params });

    const signinFn = async () => {
      if (method == "anonymous") {
        const ret = (await doSignInAnonymously()) as any;
        return ret?.user;
      } else {
        return doSignin(method, params);
      }
    };

    return new Promise((resolve, reject) => {
      set({ /* user: undefined, */ loaded: false, loading: true });
      signinFn()
        .then(async (user: any) => {
          console.log(">> hooks.User.signin", { user });

          const authToken = await user.getIdToken();
          console.log(">> hooks.User.signin", { authToken });

          fetch('/api/user', {
            method: "POST",
            body: JSON.stringify({ uid: user.uid, authToken }),
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }).then(async (response: any) => {
            const updatedUser = await response.json();
            console.log('>> hooks.User.signin', { updatedUser });
            set({ user: { ...user, admin: updatedUser.customClaims?.admin }, loaded: true, loading: false });
            resolve(user);
          });
        }).catch((error) => {
          console.warn('>> hooks.User.signin', { error });
          set({ /* user: undefined, */ loaded: true, loading: false, fetching: false });
          reject(error);
        });
    });
  },


  logout: async () => {
    console.log(">> hooks.User.logout");

    return new Promise((resolve, reject) => {
      if (get().user) {
        set({ /* user: undefined, */ loaded: false, loading: false });
        doLogout().then(() => {
          console.log(">> hooks.User.logout then");
          set({ user: undefined, loaded: false, loading: false });
          fetch('/api/user', {
            method: "DELETE",
          }).then(() => {
            console.log(">> hooks.User.logout success");
            resolve(true);
          }).catch((error) => {
            console.warn(">> hooks.User.logout error", { error })
            reject(error);
          })
        });
      }
    });
  },
})));

export default useUser;
