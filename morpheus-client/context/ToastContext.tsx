import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

export interface IToastContext {
  showSuccessAlert: (message: string) => void;
  showErrorAlert: (error: string | undefined) => void;
  showInfoAlert: (message: string) => void;
  showWarningAlert: (
    message: string,
    actionLabel?: string,
    actionCallback?: () => void
  ) => void;
}

const defaultState = {
  showSuccessAlert: () => {},
  showErrorAlert: () => {},
  showInfoAlert: () => {},
  showWarningAlert: () => {},
};

const ToastContext = React.createContext<IToastContext>(defaultState);

const ToastProvider = (props: { children: React.ReactNode }) => {
  const { toast } = useToast();

  const showSuccessAlert = (message: string) => {
    if (!message) return;
    toast({
      variant: "success",
      title: "Well done!",
      description: message,
    });
  };

  const showInfoAlert = (message: string) => {
    if (!message) return;
    toast({
      variant: "info",
      title: "Heads Up!",
      description: message,
    });
  };

  const showWarningAlert = (
    message: string,
    actionLabel?: string,
    actionCallback?: () => void
  ) => {
    if (!message) return;
    toast({
      variant: "warning",
      title: "Caution!",
      description: message,
      action: (
        <ToastAction onClick={actionCallback} altText="Goto schedule to undo">
          {actionLabel}
        </ToastAction>
      ),
    });
  };

  const showErrorAlert = (message: string | undefined) => {
    if (!message) return;
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: message,
    });
  };

  return (
    <ToastContext.Provider
      value={{
        showSuccessAlert,
        showInfoAlert,
        showWarningAlert,
        showErrorAlert,
      }}
    >
      {props.children}
    </ToastContext.Provider>
  );
};

const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

export { ToastProvider, useToastContext };
