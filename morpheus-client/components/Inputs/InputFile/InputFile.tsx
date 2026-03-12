import React, { ChangeEvent, createRef, CSSProperties, useEffect } from "react";
import { CloseIcon } from "../../icons/close";

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
    <div className="w-auto max-w-full" style={props.styles}>
      {props.label && (
        <p className="base-2 white mb-[10px]">{props.label}</p>
      )}

      <input
        type="file"
        id="images"
        accept="image/*"
        required
        onChange={(e) => handleFileChange(e)}
        ref={ref}
        className="hidden"
      />

      <label htmlFor="images" className="w-full h-12 min-h-[48px] max-h-[48px] flex items-center justify-center px-3 py-2 cursor-pointer rounded-lg bg-[#252238] border-2 border-[#312E47] base-1 white">
        Upload new image
      </label>

      {props.file && (
        <div className="mt-[10px] flex items-center gap-4">
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
