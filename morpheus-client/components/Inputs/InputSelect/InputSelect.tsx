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
  optional?: boolean;
}

const InputSelect = (props: InputSelectProps) => {
  useEffect(() => {
    if (!props.optional && !props.selected && props.options.length > 0) {
      props.setSelected(props.options[0]);
    }
  }, [props.optional, props.selected, props.options]);

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
          {props.optional && <SelectItem value={""}>None</SelectItem>}
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
