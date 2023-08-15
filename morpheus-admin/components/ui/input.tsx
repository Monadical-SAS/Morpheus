import * as React from "react";

import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-input border-sm bg-input px-3 py-2 " +
            "text-sm text-foreground2 ring-offset-background file:border-0 file:bg-transparent file:text-sm " +
            "file:font-medium placeholder:text-muted-foreground focus-visible:outline-none " +
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
            "disabled:cursor-not-allowed disabled:opacity-50",
          className || "",
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

interface ICustomInputProps {
  name: string;
  label: string;
  placeholder?: string;
  control: any;
  defaultValue: string;
}

export const CustomInput = (props: ICustomInputProps) => {
  return (
    <FormField
      defaultValue={props.defaultValue}
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <Input placeholder={props.placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
