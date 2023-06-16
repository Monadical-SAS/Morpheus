import { CSSProperties } from "react";
import styles from "./RoundedIcon.module.scss";

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
    if (props.readOnly) {
      return;
    }
    return props.status ? styles.active : styles.inactive;
  };

  return (
    <span
      onClick={props.onClick}
      style={props.styles}
      className={`material-icons ${styles.icon} ${getVariantStyle()} ${
        props.classname
      }`}
    >
      {props.icon}
    </span>
  );
};

export default RoundedIcon;
