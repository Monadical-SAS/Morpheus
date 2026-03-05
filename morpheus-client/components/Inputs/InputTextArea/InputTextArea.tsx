import React, {
  CSSProperties,
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import { buildStringFromArray } from "@/utils/strings";
import { TextState } from "../InputText/InputText";
import { getInputValidators } from "../validators";

export interface InputTextProps {
  id?: string;
  autoFocus?: boolean;
  label?: string;
  placeholder?: string;
  text: TextState;
  setText?: (text: TextState) => void;
  minValueLength?: number;
  maxValueLength?: number;
  isRequired?: boolean;
  disabled?: boolean;
  styles?: CSSProperties;
  inputStyles?: CSSProperties;
  showCount?: boolean;
  rightIcon?: React.ReactNode;
  color?: string;
  numRows?: number;
  disableGrammarly?: boolean;
  onClick?: () => void;
  automaticValidation?: boolean;
}

const grammarlyAttributes = {
  "data-gramm": "false",
  "data-gramm_editor": "false",
  "data-enable-grammarly": "false",
};

const InputTextArea = ({
  automaticValidation = true,
  ...props
}: InputTextProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const extraAttributes = props.disableGrammarly ? grammarlyAttributes : {};

  const handleChange = (event: any) => {
    const value = event.target.value;
    event.persist();
    adjustTextareaHeight(event.target);
    props.setText &&
      props.setText({
        value: value,
        validators: automaticValidation
          ? getInputValidators(
              value,
              props.isRequired,
              props.minValueLength,
              props.maxValueLength
            )
          : [],
      });
  };

  const adjustTextareaHeight = (element: any) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
    setTextareaHeight(`${element.scrollHeight}px`);
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, [props.text.value]);

  return (
    <Fragment>
      <div className="relative w-full h-auto flex flex-col" style={props.styles}>
        {props.label && (
          <label htmlFor={props.id} className="base-2 white mb-[10px]">
            {props.label}
          </label>
        )}

        <textarea
          id={props.id}
          autoFocus={props.autoFocus}
          className={`w-full px-5 py-3 rounded-lg text-[#8B90B2] border border-[#312E47] bg-[#252238] focus:border-[#d9006d] transition-[border-color] duration-150 min-h-[48px] max-h-[300px] resize-y overflow-hidden outline-none max-md:h-[100px] ${props.rightIcon ? "pr-12" : ""}`}
          placeholder={props.placeholder}
          value={props.text.value}
          disabled={props.disabled}
          onChange={handleChange}
          {...extraAttributes}
          style={{ height: textareaHeight, ...props.inputStyles }}
          ref={textareaRef}
          rows={1}
          onClick={props.onClick}
        />

        {props.rightIcon && (
          <span className="absolute top-[7px] right-2">{props.rightIcon}</span>
        )}

        {props.showCount && (
          <span className={`base-2 ${props.color} self-end`}>
            {props.text.value?.length}
            {props.maxValueLength ? " / " + props.maxValueLength : ""}
          </span>
        )}
      </div>

      {props.text.validators && (
        <small className="caption-1 text-red-500">
          {buildStringFromArray(props.text.validators)}
        </small>
      )}
    </Fragment>
  );
};

export default InputTextArea;
