import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "../lib/firebaseClient";

export const signUpWithEmailAndPasswordFirebase = async (
  user: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        resolve(userCredential.user);
      })
      .catch((error) => {
        reject(mapAuthCodeToMessage(error.code));
      });
  });
};

export const loginWithEmailAndPasswordFirebase = async (
  user: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        resolve(userCredential.user);
      })
      .catch((error) => {
        reject(mapAuthCodeToMessage(error.code));
      });
  });
};

export const sendUserPasswordResetEmail = async (
  email: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(mapAuthCodeToMessage(error.code));
      });
  });
};

export const loginWithGoogleFirebase = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const additionalInfo = getAdditionalUserInfo(result);
        resolve({ user, additionalInfo });
      })
      .catch((error) => {
        reject(mapAuthCodeToMessage(error.code));
      });
  });
};

export const signOutFirebase = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    signOut(auth)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(mapAuthCodeToMessage(error.code));
      });
  });
};

const mapAuthCodeToMessage = (authCode: string) => {
  switch (authCode) {
    case "auth/wrong-password":
      return "Password provided is not correct";

    case "auth/invalid-password":
      return "Password provided is not correct";

    case "auth/invalid-email":
      return "Email provided is invalid";

    case "auth/invalid-display-name":
      return "Display name provided is invalid";

    case "auth/invalid-phone-number":
      return "Phone number provided is invalid";

    case "auth/invalid-photo-url":
      return "Photo URL provided is invalid";

    case "auth/invalid-uid":
      return "UID provided is invalid";

    case "auth/invalid-provider-id":
      return "Provider ID provided is invalid";

    case "auth/email-already-in-use":
      return "Email provided is already in use";

    case "auth/user-not-found":
      return "User not found";

    default:
      return "Something went wrong with your authentication process";
  }
};
