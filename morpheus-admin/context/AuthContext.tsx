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
} from "@/api/auth";
import { User } from "@/lib/models";
import { getUserInfo, loadOrCreateUserInfo } from "@/api/users";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToastContext } from "@/context/ToastContext";
import { LoginFormModel } from "@/components/organisms/Auth/LoginForm/LoginForm";

export enum AuthOption {
  Login = "login",
  Reset = "reset",
}

const USER = "user";

export interface IAuthContext {
  authLoading: boolean;
  authOption: AuthOption;
  setAuthOption: (authOption: AuthOption) => void;
  user: User;
  loadUserData: (email: string) => void;
  loginWithGoogle: () => Promise<any>;
  loginWithEmailAndPassword: (user: LoginFormModel) => Promise<any>;
  logout: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const defaultState = {
  authLoading: false,
  authOption: AuthOption.Login,
  setAuthOption: () => {},
  user: {} as User,
  loadUserData: async () => {},
  loginWithGoogle: async () => {},
  loginWithEmailAndPassword: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
};

const AuthContext = createContext<IAuthContext>(defaultState);

const AuthProvider = (props: { children: ReactNode }) => {
  const router = useRouter();
  const { showSuccessAlert, showErrorAlert } = useToastContext();

  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authOption, setAuthOption] = useState<AuthOption>(AuthOption.Login);
  const [user, setUser] = useState<any>({});
  const [localUser, setLocalUser] = useLocalStorage(USER, {} as User);

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

  const loginWithEmailAndPassword = (user: LoginFormModel): Promise<any> => {
    return new Promise((resolve, reject) => {
      loginWithEmailAndPasswordFirebase(user)
        .then((response: any) => {
          loadOrCreateMorpheusUser(response);
        })
        .catch((error) => {
          showErrorAlert(error.message);
          reject(error);
        });
    });
  };

  const loginWithGoogle = (): Promise<any> => {
    return loginWithGoogleFirebase()
      .then((response) => {
        loadOrCreateMorpheusUser(response.user);
      })
      .catch((error) => {
        showErrorAlert(error.message);
      });
  };

  const loadOrCreateMorpheusUser = (firebaseUser: any) => {
    const user = {
      name: firebaseUser.displayName,
      email: firebaseUser.email,
    };
    if (!user.email) {
      showErrorAlert("Email is required");
    }
    loadOrCreateUser(user);
  };

  const loadOrCreateUser = (user: any) => {
    const newData = { ...user, role: USER };
    loadOrCreateUserInfo(newData)
      .then((response: any) => {
        if (response.success) {
          setUser(response.data);
        } else {
          showErrorAlert(
            response.error || "An error occurred while loading the user data",
          );
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
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const logout = (): Promise<any> => {
    return signOutFirebase()
      .then(() => {
        localStorage.removeItem(USER);
        localStorage.removeItem("token");
        router.push("/");
        setUser({} as User);
        setLocalUser({} as User);
      })
      .catch((error) => {
        showErrorAlert(error.message);
      });
  };

  const resetPassword = (email: string): Promise<any> => {
    return sendUserPasswordResetEmail(email)
      .then(() => {
        showSuccessAlert("Email sent successfully");
      })
      .catch((error) => {
        showErrorAlert(error.message || "Something went wrong");
      });
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        authOption,
        setAuthOption,
        user,
        loadUserData,
        loginWithGoogle,
        loginWithEmailAndPassword,
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
