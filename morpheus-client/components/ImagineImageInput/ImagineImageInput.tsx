import React, {
  CSSProperties,
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import Modal from "../Modal/Modal";
import MaskPaintingCanvas from "../MaskPaintingCanvas/MaskPaintingCanvas";
import { CloseIcon } from "../icons/close";
import { UploadImageIcon } from "../icons/uploadImage";
import { PaintImageIcon } from "../icons/paintImage";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import styles from "./ImagineImageInput.module.scss";
import Link from "next/link";

interface DragDropFileProps {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  label?: string;
  buttonLabel?: string;
  icon?: ReactNode;
  styles?: CSSProperties;
  showEditImage?: boolean;
  showPaintImageLink?: boolean;
  showPaintMask?: boolean;
  id?: string;
}

const ImagineImageInput = (props: DragDropFileProps) => {
  const inputRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_SCREEN_WIDTH;

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      setImageSrc(URL.createObjectURL(selectedFile));
      props.setImageFile(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (props.imageFile) {
      setImageSrc(URL.createObjectURL(props.imageFile));
    } else {
      setImageSrc(null);
    }
  }, [props.imageFile]);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: any) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const clearImage = () => {
    setImageSrc(null);
    setSelectedFile(null);
    props.setImageFile(null);
  };

  const ImageInputForm = (
    <div className={styles.formContainer}>
      <form
        className={styles.formInputItem}
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
        style={props.styles}
      >
        <input
          ref={inputRef}
          type="file"
          className={styles.inputFileUpload}
          multiple={false}
          onChange={handleChange}
        />
        <label
          htmlFor="input-file-upload"
          className={`${styles.labelFileUpload} ${
            dragActive && styles.dragActive
          }`}
        >
          <div className={styles.dragInfo}>
            {props.icon ? props.icon : <UploadImageIcon />}
            <a className="body-1 main underline pointer" onClick={onButtonClick}>
              {isMobile ? "Upload" : "Upload an image"}
            </a>
            <span className="body-2 white">or drag and drop</span>
            <span className="caption-1 secondary">Maximum file size 50 MB</span>
          </div>
        </label>

        {dragActive && (
          <div
            className={styles.dragFileElement}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />
        )}
      </form>

      {props.showPaintImageLink || props.showPaintMask ? (
        <Fragment>
          <div className={styles.verticalSeparator} />
        </Fragment>
      ) : null}

      {props.showPaintImageLink && (
        <div className={styles.formInputItem}>
          <PaintImageIcon />
          <Link className="underline body-1 main" href={"/paint"}>
            {isMobile ? "Paint" : "Paint an image"}
          </Link>
        </div>
      )}

      {props.showPaintMask && (
        <div className={styles.formInputItem}>
          <PaintImageIcon />
          <a
            className="underline body-1 main pointer"
            onClick={() => setShowEditModal(true)}
          >
            {isMobile ? "Paint" : "Paint an image"}
          </a>
        </div>
      )}
    </div>
  );

  const ImageResultDetail = (
    <div className={styles.selectedFile} style={props.styles}>
      <div className={styles.header}>
        <span onClick={clearImage}>
          <CloseIcon width={"24"} height={"24"} />
        </span>
      </div>

      <img src={imageSrc} alt={props.label} />
    </div>
  );

  return (
    <Fragment>
      <div className={styles.imagineImageInput}>
        {props.label && (
          <span className={`${styles.label} base-2 white`}>
            {props.label}
          </span>
        )}

        {imageSrc ? ImageResultDetail : ImageInputForm}
      </div>

      <Modal
        width={"610px"}
        height={"auto"}
        isOpen={showEditModal}
        toggleModal={() => setShowEditModal(!showEditModal)}
      >
        <MaskPaintingCanvas
          width={isMobile ? width - 88 : 512}
          height={isMobile ? width - 88 : 512}
          closeModal={() => setShowEditModal(false)}
        />
      </Modal>
    </Fragment>
  );
};

export default ImagineImageInput;
