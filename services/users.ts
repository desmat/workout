import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { firebaseAdminConfig } from "@/firestore-admin.config";
import { firebaseConfig } from "@/firestore.config";
import { User } from 'firebase/auth';

// NOTE: can't use firebase-auth in middleware and so using alternative next-firebase-auth-edge
// see https://github.com/vercel/next.js/discussions/33586

const {
  verifyIdToken,
  // verifyAndRefreshExpiredIdToken,
  getCustomIdAndRefreshTokens,
  handleTokenRefresh,
  getUser: _getUser,
  setCustomUserClaims: _setCustomUserClaims,
} = getFirebaseAuth(
  {
    projectId: firebaseAdminConfig.projectId || "",
    clientEmail: firebaseAdminConfig.clientEmail || "",
    privateKey: firebaseAdminConfig.privateKey || ""
  },
  firebaseConfig.apiKey || "",
);

export async function getUser(uid: string) {
  return _getUser(uid);
}

export function getUserName(user: User): string {
  return user?.isAnonymous
    ? "Anonymous"
    : user?.displayName
    || (user?.email && user.email.split("@")?.length > 0 && user.email.split("@")[0])
    || "Noname";
}

export function getProviderType(user: User): string | undefined {
  const providerId = user?.providerData[0]?.providerId;
  return !user.isAnonymous && providerId == "password" ? "email" : providerId;
    
}

export function getProviderName(user: User): string {
  const providerId = user?.providerData[0]?.providerId;
  const providerEmail = user?.providerData[0]?.email;

  return user?.isAnonymous
    ? "(anonymous)"
    : providerEmail && providerId && (providerId != "password") 
      ? `${providerEmail} via ${providerId}` 
      : providerEmail || providerId || "(unknown)";
}

export async function setCustomUserClaims(uid: string, obj: any) {
  const ret = await _setCustomUserClaims(uid, obj)
  // console.log("*** setUserCustomClaim", { ret });

  return getUser(uid);
}

export async function authenticateUser(request: any) {
  // console.log(">> services.users.authenticateUser", { request });
  const authorization = request.headers.get("Authorization");
  // console.log(">> services.users.authenticateUser", { authorization });
  
  let idToken;
  if (authorization?.startsWith("Bearer ")) {
    idToken = authorization.split("Bearer ")[1];
  }
  // console.log(">> services.users.authenticateUser", { idToken });

  let tokens;
  if (idToken) {
    try {
      tokens = await verifyIdToken(idToken);
      // console.log("*** authenticateUser", { tokens, idToken });
      const user = await getUser(tokens.uid);
      const refreshAndIdTokens = await getCustomIdAndRefreshTokens(idToken, firebaseConfig.apiKey || "", undefined, firebaseConfig.authDomain);
      // console.log("*** authenticateUser ***", { user, refreshAndIdTokens });
      return { user, refreshToken: refreshAndIdTokens.refreshToken };
    } catch (error: any) {
      // console.warn("*** authenticateUser ***", { code: error.code, message: error.message, error });
      // throw 'authentication failed';
      return { error };
    }
  }

  return {}
}

export async function validateUserSession(request: any): Promise<any> {
  const refreshToken = request.cookies.get("session")?.value;
  // console.log("*** validateUserSession ***", { refreshToken });

  if (refreshToken) {
    try {
      // const tokens = await verifyIdToken(authToken);
      const handleredRefreshToken = await handleTokenRefresh(refreshToken, firebaseConfig.apiKey || "", firebaseConfig.authDomain || "");
      console.log("*** validateUserSession", { refreshToken, handleredRefreshToken });

      const user = await getUser(handleredRefreshToken.decodedToken.uid);
      // console.log("*** validateUserSession ***", { user, refreshToken });
      return { user };
    } catch (error: any) {
      // console.warn("*** validateUserSession ***", { code: error.code, message: error.message, error });
      // throw 'authentication failed';
      return { error };
    }
  }

  return {}
}
