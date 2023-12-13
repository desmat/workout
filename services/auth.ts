import { FirebaseApp } from "firebase/app";
import { Auth, User, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "@/firestore.config";
import { SigninMethod } from "@/types/SigninMethod";

export let app: FirebaseApp; 
export let auth: Auth;

export async function init(callbacks?: any) {
  // console.log("*** services.auth.init firebaseConfig:", firebaseConfig);

  const authStateChanged = callbacks?.onAuthStateChanged || function(user: User) {
    if (user) {
      // // User is signed in, see docs for a list of available properties
      // // https://firebase.google.com/docs/reference/js/firebase.User
      // const uid = user.uid;
      // console.log('onAuthStateChanged', { user });
    } else {
      // // User is signed out
      // console.log('onAuthStateChanged signed out');
    }
  };
  
  return new Promise((resolve: any, reject: any) => {
    // try to avoid warnings when running on server side
    import("firebase/app").then((firebaseApp) => {
      app = firebaseApp.initializeApp(firebaseConfig);
      import("firebase/auth").then((firebaseAuth) => {
        auth = firebaseAuth.getAuth();
        firebaseAuth.onAuthStateChanged(auth, authStateChanged);
        // console.log("*** services.auth.init", { currentUser: auth.currentUser });
        resolve(true);
      });
    });
  })
}

export function signInAnonymously() {
  console.log("*** services.auth.signInAnonymously firebaseConfig:", firebaseConfig);

  return new Promise((resolve, reject) => {
    // try to avoid warnings when running on server side
    import("firebase/auth").then((firebaseAuth) => {
      firebaseAuth.signInAnonymously(auth).then((user) => {
        console.log('Signed in anonymously to firebase', user);
        resolve(user);
      }).catch((error) => {
        console.error('Error signing in anonymously to firebase', error);
        reject(error);
      })});
    });
}

export async function signin(method: SigninMethod, params?: any) {
    console.log("*** services.auth.signin firebaseConfig:", {method, params});

    if (method == "google") {
        const provider = new GoogleAuthProvider();

        return new Promise((resolve, reject) => {
            signInWithPopup(auth, provider)
                .then((result) => {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential?.accessToken;
                    // The signed-in user info.
                    const user = result.user;
                    // IdP data available using getAdditionalUserInfo(result)
                    // ...
                    console.log("*** services.auth.signin user:", user);
                    resolve(user);
                }).catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // The email of the user's account used.
                    const email = error.customData.email;
                    // The AuthCredential type that was used.
                    const credential = GoogleAuthProvider.credentialFromError(error);
                    // ...
                    console.log("*** services.auth.signin error:", error);
                    reject(error);
                });
        });
    } else if (method == "signup-email") {
        return new Promise((resolve, reject) => {
            createUserWithEmailAndPassword(auth, params.email, params.password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    // ...
                    console.log("*** services.auth.signin signed up user:", user);
                    resolve(user);
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                    console.log("*** services.auth.signin error:", error);
                    reject(
                        errorCode == "auth/email-already-in-use" ? "Email already in use" : 
                        errorCode == "auth/invalid-email" ? "Invalid email" : 
                        errorMessage
                    );
                });
        });
    } else if (method == "login-email") {
        return new Promise((resolve, reject) => {
            signInWithEmailAndPassword(auth, params.email, params.password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    // ...
                    console.log("*** services.auth.signin logged in user:", user);
                    resolve(user);
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                    console.log("*** services.auth.signin error:", { error, errorCode, errorMessage });
                    reject(
                        errorCode == "auth/wrong-password" ? "Incorrect password" : 
                        errorCode == "auth/user-not-found" ? "User not found" :
                        errorCode == "auth/user-disabled" ? "Account disabled" :
                        errorCode == "auth/too-many-requests" ? "Account disabled" :
                        errorMessage
                    );
                });
        });
    } else {
        throw `Signing method not supported: ${method}`;
    }
}

export async function logout(callbacks?: any) {
  console.log("*** services.auth.logout firebaseConfig:", firebaseConfig);

  return new Promise((resolve, reject) => {
    signOut(auth)
      .then((params: any) => {
        console.log("*** services.auth.logout params:", params);
        resolve(true);
      }).catch((error) => {
        console.log("*** services.auth.logout error:", error);
        reject(error);
      })
  });
}
