import { Fragment } from "react";

interface AppLinkProps {
  href: string;
  text: string;
}

export const AppLink = (props: AppLinkProps) => {
  return (
    <Fragment>
      {" "}
      <a
        className="text-primary underline"
        href={props.href}
        target="_blank"
        rel="noreferrer"
      >
        {props.text}
      </a>{" "}
    </Fragment>
  );
};
