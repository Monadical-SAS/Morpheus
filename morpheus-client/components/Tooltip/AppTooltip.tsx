import React, { isValidElement, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface TooltipProps {
  title?: string;
  content: ReactNode | string | null;
  direction?: "top" | "bottom" | "left" | "right";
  delay?: number;
  children: ReactNode;
  styles?: any;
  ref?: any;
}

const AppTooltip = (props: TooltipProps) => {
  if (!props.content) return <>{props.children}</>;

  const getTooltipContent = () => {
    if (isValidElement(props.content)) {
      return props.content;
    }
    if (typeof props.content === "string") {
      return <p className="body-2 white">{props.content}</p>;
    }
    return null;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{props.children}</TooltipTrigger>
        <TooltipContent side={props.direction}>
          {props.title && (
            <p className="headline-4 white mb-3">{props.title}</p>
          )}
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AppTooltip;
