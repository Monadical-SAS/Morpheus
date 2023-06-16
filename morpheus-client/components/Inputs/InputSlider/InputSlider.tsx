import styles from "./InputSlider.module.scss";
import { ChangeEvent, CSSProperties } from "react";

export interface RangeProps {
  label?: string;
  minValue: number;
  maxValue: number;
  step?: number;
  value: number;
  setValue: (value: number) => void;
  styles?: CSSProperties;
  dark?: boolean;
}

const InputSlider = (props: RangeProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.setValue && props.setValue(parseFloat(event.target.value));
  };

  return (
    <div className={styles.inputSlider} style={props.styles}>
      <label htmlFor="rangeSlider">{props.label}</label>
      <input
        id="rangeSlider"
        type="range"
        min={props.minValue}
        max={props.maxValue}
        step={props.step || 1}
        value={props.value}
        onChange={handleChange}
        className={styles.slider}
      />
      <input
        type="number"
        min={props.minValue}
        max={props.maxValue}
        step={props.step || 1}
        value={props.value}
        onChange={handleChange}
        className={`${styles.sliderNumber} ${props.dark ? styles.dark : ""}`}
      />
    </div>
  );
};

export default InputSlider;
