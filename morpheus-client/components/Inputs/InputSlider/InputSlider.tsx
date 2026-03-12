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
    <div className="w-full h-auto flex flex-col mb-6" style={props.styles}>
      <label htmlFor="rangeSlider" className="mb-2 mt-4">{props.label}</label>
      <input
        id="rangeSlider"
        type="range"
        min={props.minValue}
        max={props.maxValue}
        step={props.step || 1}
        value={props.value}
        onChange={handleChange}
        className="appearance-none w-full h-[15px] rounded bg-[#d3d3d3] outline-none opacity-70 transition-opacity duration-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[25px] [&::-webkit-slider-thumb]:h-[25px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#B3005E] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0"
      />
      <input
        type="number"
        min={props.minValue}
        max={props.maxValue}
        step={props.step || 1}
        value={props.value}
        onChange={handleChange}
        className={`mt-[5px] w-[15%] h-[30px] border border-[#d3d3d3] rounded text-base ${props.dark ? "bg-[#252238] text-white" : ""}`}
      />
    </div>
  );
};

export default InputSlider;
