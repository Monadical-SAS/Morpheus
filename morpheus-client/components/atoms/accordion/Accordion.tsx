import React, { ReactNode } from "react";
import { ArrowDownIcon } from "@/components/icons/arrowDown";
import { ArrowRightIcon } from "@/components/icons/arrowRight";
import styles from "./Accordion.module.scss";

interface AccordionProps {
  title: string;
  isOpen?: boolean;
  setOpenedItem: (item: string) => void;
  children: ReactNode;
}

export const Accordion = (props: AccordionProps) => {
  const onToggle = () => props.setOpenedItem(props.title);

  return (
    <div className={styles.accordion}>
      <div className={styles.accordionHeader} onClick={onToggle}>
        <span>{props.isOpen ? <ArrowDownIcon /> : <ArrowRightIcon />}</span>
        <p className="headline-6 white bold">{props.title}</p>
      </div>
      {props.isOpen && (
        <div className={styles.accordionContent}>{props.children}</div>
      )}
    </div>
  );
};
