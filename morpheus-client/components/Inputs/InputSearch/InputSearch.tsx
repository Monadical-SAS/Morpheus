import InputText, { TextState } from "../InputText/InputText";

export interface InputSearchProps {
  text: TextState;
  setText?: (text: TextState) => void;
  showLabel?: boolean;
}

const InputSearch = (props: InputSearchProps) => {
  return (
    <div className="w-full h-full max-h-[48px] flex flex-row items-center relative z-0">
      {props.showLabel && (
        <span className="material-icons w-5 h-5 absolute left-1 top-[30px] text-[#979797]">search</span>
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
