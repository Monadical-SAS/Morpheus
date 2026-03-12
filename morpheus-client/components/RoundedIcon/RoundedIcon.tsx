import { CSSProperties } from "react";

interface IconProps {
  icon: string;
  readOnly?: boolean;
  status?: boolean;
  onClick?: () => void;
  styles?: CSSProperties;
  classname?: string;
}

const RoundedIcon = (props: IconProps) => {
  const getVariantStyle = () => {
    if (props.readOnly) return "";
    return props.status ? "" : "bg-[#6D6D94] hover:text-[#B3005E] hover:border hover:border-[#B3005E] hover:bg-white";
  };

  return (
    <span
      onClick={props.onClick}
      style={props.styles}
      className={`material-icons w-10 h-10 !flex !items-center !justify-center mb-[6px] rounded-full p-[6px] text-[22px] shadow-[0_0_10px_0_rgba(0,0,0,0.2)] bg-[#B3005E] text-white transition-all duration-200 ease-in cursor-pointer outline-none select-none ${getVariantStyle()} ${
        props.classname || ""
      }`}
    >
      {props.icon}
    </span>
  );
};

export default RoundedIcon;
