import React, { ReactNode } from "react";
import { ArrowDownIcon } from "@/components/icons/arrowDown";
import { ArrowRightIcon } from "@/components/icons/arrowRight";
import styles from "./Accordion.module.scss";

interface AccordionProps {
  itemId: string;
  title: string;
  isOpen?: boolean;
  setOpenedItem: (item: string) => void;
  children: ReactNode;
}

export const Accordion = (props: AccordionProps) => {
  const onToggle = () => {
    props.setOpenedItem(props.itemId)
  };

  return (
    <div className={styles.accordion}>
      <div className={styles.accordionHeader} onClick={onToggle}>
        <span>{props.isOpen ? <ArrowDownIcon /> : <ArrowRightIcon />}</span>
        <p className="headline-6 white bold">{props.title}</p>
      </div>
      {props.isOpen && (
        <div
          className={`${styles.accordionContent} ${
            props.isOpen && styles.active
          }`}
        >
          {props.children}
        </div>
      )}
    </div>
  );
};
