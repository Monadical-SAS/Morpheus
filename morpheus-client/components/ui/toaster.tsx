"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import {useToast} from "@/components/ui/use-toast";
import {isValidElement} from "react";
import {buildStringFromObject} from "@/utils/strings";

export function Toaster() {
  const {toasts} = useToast();

  const getToastDescription = (description: any) => {
    if (isValidElement(description)) return description;
    if (typeof description === "string") return description;
    if (typeof description === "object") {
      return buildStringFromObject(description);
    }
    return String(description);
  };

  return (
    <ToastProvider>
      {toasts.map(function ({id, title, description, action, ...props}) {
        if (!title && !description) return null;

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                  <ToastDescription>
                    {getToastDescription(description)}
                  </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose/>
          </Toast>
        );
      })}
      <ToastViewport/>
      </ToastProvider>
  );
}
