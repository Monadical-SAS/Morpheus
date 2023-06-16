import React, { ChangeEvent, createRef, CSSProperties, useEffect } from "react";
import { CloseIcon } from "../../icons/close";
import styles from "./InputFile.module.scss";

interface InputFileProps {
  label?: string;
  file: File | null;
  setFile: (file: File | null) => void;
  styles?: CSSProperties;
}

const InputFile = (props: InputFileProps) => {
  const ref = createRef<HTMLInputElement>();

  useEffect(() => {
    if (props.file == null && ref.current != null) {
      ref.current.value = "";
    }
  }, [props.file, ref]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      props.setFile(e.target.files[0]);
    }
  };

  const resetInputFile = () => {
    if (ref.current) {
      ref.current.value = "";
    }
    props.setFile(null);
  };

  return (
    <div className={styles.inputContainer} style={props.styles}>
      {props.label && (
        <p className={`base-2 white ${styles.inputLabel}`}>{props.label}</p>
      )}

      <input
        type="file"
        id="images"
        accept="image/*"
        required
        onChange={(e) => handleFileChange(e)}
        ref={ref}
        className="base-3 white"
      />

      <label htmlFor="images" className="base-1 white">
        Upload new image
      </label>

      {props.file && (
        <div className={styles.fileResult}>
          <p className="base-2 white">{props.file.name}</p>
          <span onClick={resetInputFile}>
            <CloseIcon width={"16"} height={"16"} />
          </span>
        </div>
      )}
    </div>
  );
};

export default InputFile;
