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
import styles from "./TextArea.module.scss";

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
  classNames?: { container?: string; textarea?: string };
  showCount?: boolean;
  rightIcon?: React.ReactNode;
  color?: string;
  numRows?: number;
  disableGrammarly?: boolean;
}

const grammarlyAttributes = {
  "data-gramm": "false",
  "data-gramm_editor": "false",
  "data-enable-grammarly": "false",
};

const InputTextArea = (props: InputTextProps) => {
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
        validators: getInputValidators(
          value,
          props.isRequired,
          props.minValueLength,
          props.maxValueLength
        ),
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
      <div className={styles.textAreaContainer} style={props.styles}>
        {props.label && (
          <label htmlFor={props.id} className="base-2 white">
            {props.label}
          </label>
        )}

        <textarea
          id={props.id}
          autoFocus={props.autoFocus}
          className={`${styles.textArea} ${props.rightIcon && styles.pRight} `}
          placeholder={props.placeholder}
          value={props.text.value}
          disabled={props.disabled}
          onChange={handleChange}
          {...extraAttributes}
          style={{ height: textareaHeight }}
          ref={textareaRef}
          rows={1}
        />

        {props.rightIcon && (
          <span className={styles.rightIcon}>{props.rightIcon}</span>
        )}

        {props.showCount && (
          <span className={`base-2 ${props.color} ${styles.count}`}>
            {props.text.value?.length}
            {props.maxValueLength ? " / " + props.maxValueLength : ""}
          </span>
        )}
      </div>

      {props.text.validators && (
        <small className={styles.error}>
          {buildStringFromArray(props.text.validators)}
        </small>
      )}
    </Fragment>
  );
};

export default InputTextArea;
