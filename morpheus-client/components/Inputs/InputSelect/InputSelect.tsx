import React, { CSSProperties, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InputSelectProps {
  label?: string;
  options: string[];
  selected: string;
  setSelected: (selected: string) => void;
  styles?: CSSProperties;
}

const InputSelect = (props: InputSelectProps) => {
  useEffect(() => {
    if (props.options.length > 0 && !props.selected) {
      props.setSelected(props.options[0]);
    }
  }, [props.options]);

  return (
    <Select
      defaultValue={props.selected}
      value={props.selected}
      onValueChange={props.setSelected}
    >
      <SelectTrigger>
        <SelectValue placeholder={props.label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default InputSelect;
