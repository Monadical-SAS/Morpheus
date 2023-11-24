import { FirebaseOptions, initializeApp } from "@firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

let FIREBASE_CONFIG: Record<string, any>;
try {
  FIREBASE_CONFIG = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG || "{}");
} catch (error: any) {
  console.warn(
    `Error JSON parsing firebase config. Supplied value: ${process.env.NEXT_PUBLIC_FIREBASE_CONFIG}`,
  );
  FIREBASE_CONFIG = {};
}

let app: any;
try {
  app = initializeApp(<FirebaseOptions>FIREBASE_CONFIG);
} catch (error: any) {
  if (error.code === "app/duplicate-app") {
    console.warn(error.name, error.code);
  } else {
    throw error;
  }
}

let analytics: Analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const auth = getAuth();

const getOrRefreshFirebaseToken = async () => {
  const token = await auth.currentUser?.getIdToken(true);
  const localToken = localStorage.getItem("token");
  if (token && token !== localToken) {
    localStorage.setItem("token", await token);
  }
  return token || localToken;
};

export { FIREBASE_CONFIG, analytics, auth, getOrRefreshFirebaseToken };
