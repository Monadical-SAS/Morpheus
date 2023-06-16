import { CSSProperties } from "react";
import styles from "./Loader.module.scss";

const Loader = (props: {
  primary?: boolean;
  isLoading: boolean;
  message?: string;
  color?: string;
  width?: number;
  height?: number;
  fontColor?: string;
  styles?: CSSProperties;
}) => {
  return (
    <div
      className={`${styles.loaderContainer} ${props.primary && styles.primary}`}
      style={props.styles}
    >
      <svg
        className={styles.loader}
        width={props.width || 50}
        height={props.height || 50}
        color={props.color || "#B3005E"}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        fill="none"
      >
        <defs>
          <linearGradient id="spinner-secondHalf">
            <stop offset="30%" stopOpacity="0" stopColor="currentColor" />
            <stop offset="100%" stopOpacity="0.5" stopColor="currentColor" />
          </linearGradient>
          <linearGradient id="spinner-firstHalf">
            <stop offset="0%" stopOpacity="1" stopColor="currentColor" />
            <stop offset="100%" stopOpacity="0.5" stopColor="currentColor" />
          </linearGradient>
        </defs>

        <g strokeWidth="10">
          <path
            stroke="url(#spinner-secondHalf)"
            d="M 4 100 A 96 96 0 0 1 196 100"
          />
          <path
            stroke="url(#spinner-firstHalf)"
            d="M 196 100 A 96 96 0 0 1 4 100"
          />
          <path
            stroke="currentColor"
            strokeLinecap="round"
            d="M 4 100 A 96 96 0 0 1 4 98"
          />
        </g>
      </svg>

      {props.message && (
        <p className={`base-1 ${props.fontColor} ${styles.loaderText}`}>
          {props.message}
        </p>
      )}
    </div>
  );
};

export default Loader;
