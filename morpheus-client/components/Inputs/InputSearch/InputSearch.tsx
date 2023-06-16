import InputText, { TextState } from "../InputText/InputText";
import styles from "./InputSearch.module.scss";

export interface InputSearchProps {
  text: TextState;
  setText?: (text: TextState) => void;
  showLabel?: boolean;
}

const InputSearch = (props: InputSearchProps) => {
  return (
    <div className={styles.inputSearchContainer}>
      {props.showLabel && (
        <span className={`material-icons ${styles.iconSearch}`}>search</span>
      )}

      <InputText
        id="inputTextSearch"
        placeholder={"Search"}
        text={props.text}
        setText={props.setText}
        isRequired={false}
        disabled={false}
      />
    </div>
  );
};

export default InputSearch;
