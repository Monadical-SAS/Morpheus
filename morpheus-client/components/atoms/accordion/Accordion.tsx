import React, { ReactNode } from "react";
import { ArrowDownIcon } from "@/components/icons/arrowDown";
import { ArrowRightIcon } from "@/components/icons/arrowRight";

interface AccordionProps {
  itemId: string;
  title: string;
  icon?: ReactNode;
  isOpen?: boolean;
  setOpenedItem: (item: string) => void;
  children: ReactNode;
}

export const Accordion = (props: AccordionProps) => {
  const onToggle = () => {
    props.setOpenedItem(props.itemId)
  };

  return (
    <div className="w-full h-auto mb-6 last:mb-0">
      <div className="w-full h-auto max-h-[32px] flex self-center cursor-pointer" onClick={onToggle}>
        <span className="mt-1">{props.isOpen ? <ArrowDownIcon /> : <ArrowRightIcon />}</span>
        {props.icon && <span className="mt-[2px] mr-[6px]">{props.icon}</span>}
        <p className="headline-6 white bold">{props.title}</p>
      </div>
      {props.isOpen && (
        <div className="w-auto h-auto">
          {props.children}
        </div>
      )}
    </div>
  );
};
