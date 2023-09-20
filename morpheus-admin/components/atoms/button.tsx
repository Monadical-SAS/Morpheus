export enum ButtonSize {
  Xs = "btn-xs",
  Sm = "btn-sm",
  Md = "btn-md",
  Lg = "btn-lg",
}

export enum ButtonFill {
  Full = "",
  Outline = "btn-outline",
}

export enum ButtonVariant {
  Default = "",
  Primary = "btn-primary",
  Secondary = "btn-secondary",
  Accent = "btn-accent",
  Info = "btn-info",
  Success = "btn-success",
  Warning = "btn-warning",
  Error = "btn-error",
}

export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  fill?: ButtonFill;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      className={`btn ${props.variant} ${props.fill} ${props.size} ${props.className}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.text}
    </button>
  );
};
