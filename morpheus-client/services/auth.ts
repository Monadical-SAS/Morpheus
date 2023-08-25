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

export const signUpWithEmailAndPasswordFirebase = async (user: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        resolve({
          user: {
            ...userCredential.user,
            is_new_user: getAdditionalUserInfo(userCredential)?.isNewUser,
          },
        });
        
      })
      .catch((error) => {
        reject(new Error(mapAuthCodeToMessage[error.code] || "Something went wrong with your sign up process"));
      });
  });
};

export const loginWithEmailAndPasswordFirebase = async (user: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        resolve({
          user: {
            ...userCredential.user,
            is_new_user: getAdditionalUserInfo(userCredential)?.isNewUser,
          },
        });
      })
      .catch((error) => {
        reject(new Error(mapAuthCodeToMessage[error.code] || "Something went wrong with your authentication process"));
      });
  });
};

export const sendUserPasswordResetEmail = async (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(new Error(mapAuthCodeToMessage[error.code] || "Something went wrong with your password reset process"));
      });
  });
};

export const loginWithGoogleFirebase = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((userCredential) => {
        resolve({
          user: {
            ...userCredential.user,
            is_new_user: getAdditionalUserInfo(userCredential)?.isNewUser,
          },
        });
        
      })
      .catch((error) => {
        reject(new Error(mapAuthCodeToMessage[error.code] || "Something went wrong with your authentication process"));
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
        reject(new Error(mapAuthCodeToMessage[error.code] || "Something went wrong with your sign out process"));
      });
  });
};

const mapAuthCodeToMessage: { [key: string]: string } = {
  "auth/wrong-password": "Password provided is not correct",
  "auth/invalid-password": "Password provided is not correct",
  "auth/invalid-email": "Email provided is invalid",
  "auth/invalid-display-name": "Display name provided is invalid",
  "auth/invalid-phone-number": "Phone number provided is invalid",
  "auth/invalid-photo-url": "Photo URL provided is invalid",
  "auth/invalid-uid": "UID provided is invalid",
  "auth/invalid-provider-id": "Provider ID provided is invalid",
  "auth/email-already-in-use": "Email provided is already in use",
  "auth/user-not-found": "User not found",
};
