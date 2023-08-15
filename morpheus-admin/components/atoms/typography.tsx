import { ReactNode } from "react";

export enum TypographyVariant {
  Title,
  Subtitle,
  Paragraph,
  Span,
}

export enum TypographyColor {
  Primary = "text-primary",
  Secondary = "text-secondary",
  Accent = "text-accent",
  Success = "text-success",
  Info = "text-info",
  Warning = "text-warning",
  Danger = "text-danger",
}

export enum TypographyAlignment {
  Left = "text-left",
  Center = "text-center",
  Right = "text-right",
}

export enum TypographyWeight {
  Normal = "font-normal",
  Bold = "font-bold",
}

export interface TypographyProps {
  children: ReactNode | ReactNode[];
  className?: string;
  alignment?: TypographyAlignment;
  variant: TypographyVariant;
  color?: TypographyColor;
  weight?: TypographyWeight;
}

export const Typography = (props: TypographyProps) => {
  const classNames = [
    props.alignment,
    props.color,
    props.weight,
    props.className,
  ].join(" ");

  switch (props.variant) {
    case TypographyVariant.Title:
      return <h1 className={`text-5xl ${classNames}`}>{props.children}</h1>;

    case TypographyVariant.Subtitle:
      return <h2 className={`text-2xl ${classNames}`}>{props.children}</h2>;

    case TypographyVariant.Paragraph:
      return <p className={`text-sm ${classNames}`}>{props.children}</p>;

    case TypographyVariant.Span:
      return <span className={`${classNames}`}>{props.children}</span>;
  }
};
