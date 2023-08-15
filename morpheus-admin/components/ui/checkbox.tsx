import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-[2px] border border-primary ring-offset-background " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className || "",
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex flex-row-reverse items-center justify-center text-current",
      )}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

interface ICustomCheckboxProps {
  name: string;
  label: string;
  control: any;
  defaultValue: boolean;
}

export const CustomCheckbox = (props: ICustomCheckboxProps) => {
  return (
    <FormField
      defaultValue={props.defaultValue}
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex flex-row-reverse justify-end items-end">
          <FormLabel className="ml-2">{props.label}</FormLabel>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
