import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import {
  loginWithEmailAndPasswordFirebase,
  loginWithGoogleFirebase,
  sendUserPasswordResetEmail,
  signOutFirebase,
  signUpWithEmailAndPasswordFirebase,
} from "@/services/auth";
import { User, UserRegistration } from "@/models/models";
import { getUserInfo, loadOrCreateUserInfo } from "@/services/users";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToastContext } from "@/context/ToastContext";

export enum AuthOption {
  Login = "login",
  SignUp = "signup",
  Reset = "reset",
}

export interface IAuthContext {
  authLoading: boolean;
  authOption: AuthOption;
  setAuthOption: (authOption: AuthOption) => void;
  user: User;
  loadUser: (email: string) => void;
  registerWithEmailAndPassword: (user: UserRegistration) => Promise<void>;
  loginWithEmailAndPassword: (user: UserRegistration) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const defaultState = {
  authLoading: false,
  authOption: AuthOption.Login,
  setAuthOption: () => {},
  user: {} as User,
  loadUser: async () => {},
  registerWithEmailAndPassword: async () => {},
  loginWithEmailAndPassword: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
};

const AuthContext = createContext<IAuthContext>(defaultState);

const AuthProvider = (props: { children: ReactNode }) => {
  const router = useRouter();
  const { showErrorAlert } = useToastContext();

  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authOption, setAuthOption] = useState<AuthOption>(AuthOption.Login);
  const [user, setUser] = useState<any>({});
  const [localUser, setLocalUser] = useLocalStorage("user", {} as User);

  useEffect(() => {
    if (localUser && localUser.email) {
      loadUserData(localUser.email)
        .then(() => {
          setTimeout(() => {
            setAuthLoading(false);
          }, 500);
        })
        .catch(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.email) {
      setLocalUser(user);
    }
  }, [user]);

  const registerWithEmailAndPassword = (
    user: UserRegistration
  ): Promise<void> => {
    return signUpWithEmailAndPasswordFirebase(user)
      .then((response) => {
        loadOrCreateMorpheusUser({ ...response, displayName: user.name });
      })
      .catch(() => {
        showErrorAlert("An error occurred while creating the new user");
      });
  };

  const loginWithEmailAndPassword = (user: UserRegistration): Promise<User> => {
    return new Promise((resolve, reject) => {
      loginWithEmailAndPasswordFirebase(user)
        .then((response: any) => {
          loadOrCreateMorpheusUser(response);
        })
        .catch((error) => {
          showErrorAlert( "An error occurred while authenticating the user");
          reject(error);
        });
    });
  };

  const loginWithGoogle = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      loginWithGoogleFirebase()
        .then((response) => {
          loadOrCreateMorpheusUser(response.user);
          resolve();
        })
        .catch((error) => {
          showErrorAlert( "An error occurred while authenticating the user");
          reject(error);
        });
    });
  };

  const loadOrCreateMorpheusUser = (firebaseUser: any) => {
    const user = {
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber,
    };
    if (!user.email) {
      showErrorAlert("Email is required");
    }
    loadOrCreateUser(user);
  };

  const loadOrCreateUser = (user: any) => {
    const newData = { ...user, role: "user" };
    loadOrCreateUserInfo(newData)
      .then((response: any) => {
        if (response.success) {
          setUser(response.data);
        } else {
          showErrorAlert(response.error || "An error occurred while loading the user data");
        }
      })
      .catch(() => {
        showErrorAlert("An error occurred while loading the user data");
      });
  };

  const loadUserData = (email: string) => {
    return getUserInfo(email)
      .then((response: any) => {
        if (response.success) {
          setUser(response.data);
          setLocalUser(response.data);
        } else {
          showErrorAlert("An error occurred while loading the user data");
        }
      })
      .catch(() => {
        showErrorAlert("An error occurred while loading the user data");
      });
  };

  const logout = () => {
    return signOutFirebase()
      .then(() => {
        localStorage.clear();
        sessionStorage.clear();
        router.push("/");
        setUser({} as User);
        setLocalUser({} as User);
      })
      .catch(() => {
        showErrorAlert("An error occurred while logging out");
      });
  };

  const resetPassword = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      sendUserPasswordResetEmail(email).then(resolve).catch(reject);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        authOption,
        setAuthOption,
        user,
        loadUser: loadUserData,
        registerWithEmailAndPassword,
        loginWithEmailAndPassword,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
