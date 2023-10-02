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
  sendUserPasswordResetEmail,
  signOutFirebase,
} from "@/api/auth";
import { Response, Role, User } from "@/lib/models";
import { getAdminInfo } from "@/api/users";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToastContext } from "@/context/ToastContext";
import { LoginFormModel } from "@/components/organisms/Auth/LoginForm/LoginForm";

export enum AuthOption {
  Login = "login",
  Reset = "reset",
}

export interface IAuthContext {
  authLoading: boolean;
  authOption: AuthOption;
  setAuthOption: (authOption: AuthOption) => void;
  admin: User;
  loadAdminData: (authOption: AuthOption) => void;
  loginWithEmailAndPassword: (admin: LoginFormModel) => Promise<any>;
  logout: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const defaultState = {
  authLoading: false,
  authOption: AuthOption.Login,
  setAuthOption: () => {},
  admin: {} as User,
  loadAdminData: async () => {},
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
  const [admin, setAdmin] = useState<any>({});
  const [localAdmin, setLocalAdmin] = useLocalStorage("admin", {} as User);

  useEffect(() => {
    if (localAdmin && localAdmin.email) {
      loadAdminData(localAdmin.email)
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
    if (admin && admin.email) {
      setLocalAdmin(admin);
    }
  }, [admin]);

  const loginWithEmailAndPassword = (admin: LoginFormModel): Promise<any> => {
    return new Promise((resolve, reject) => {
      loginWithEmailAndPasswordFirebase(admin)
        .then((response: any) => {
          loadAdminData(response.email);
          resolve(response);
        })
        .catch((error) => {
          showErrorAlert(error.message);
          reject(error);
        });
    });
  };

  const loadAdminData = async (email: string) => {
    try {
      const response: Response = await getAdminInfo(email);
      if (response.success) {
        const userRoles = response.data.roles;
        if (
          userRoles &&
          userRoles.find((role: Role) => role.name === "admin")
        ) {
          setAdmin(response.data);
          setLocalAdmin(response.data);
          if (router.pathname === "/") {
            router.push("/models");
          }
        }
      } else {
        showErrorAlert(`The user ${email} is not an admin`);
      }
    } catch (error: any) {
      showErrorAlert(
        error.message || "An error occurred while loading the admin data",
      );
    }
  };

  const logout = async (): Promise<any> => {
    try {
      await signOutFirebase();
      localStorage.removeItem("admin");
      localStorage.removeItem("token");
      router.push("/");
      setAdmin({} as User);
      setLocalAdmin({} as User);
    } catch (error: any) {
      showErrorAlert(error.message || "Something went wrong");
    }
  };

  const resetPassword = async (email: string): Promise<any> => {
    try {
      await sendUserPasswordResetEmail(email);
      showSuccessAlert("Email sent successfully");
    } catch (error: any) {
      showErrorAlert(error.message || "Something went wrong");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        authOption,
        setAuthOption,
        admin,
        loadAdminData,
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
