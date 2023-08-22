import React, {
  CSSProperties,
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import AppImage from "@/components/AppImage/AppImage";
import Modal from "../Modal/Modal";
import MaskPaintingCanvas from "../MaskPaintingCanvas/MaskPaintingCanvas";
import { CloseIcon } from "../icons/close";
import { UploadImageIcon } from "../icons/uploadImage";
import { PaintImageIcon } from "../icons/paintImage";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import styles from "./ImageDraggable.module.scss";
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

const DragDropFile = (props: DragDropFileProps) => {
  const inputRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_SCREEN_WIDTH;

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      setImgSrc(URL.createObjectURL(selectedFile));
      props.setImageFile(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (props.imageFile) {
      setImgSrc(URL.createObjectURL(props.imageFile));
    } else {
      setImgSrc(null);
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
    setImgSrc(null);
    setSelectedFile(null);
    props.setImageFile(null);
  };

  const ImageInputForm = (
    <div className={styles.formContainer}>
      <form
        className={styles.formFileUpload}
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
            <a className="body-1 main pointer" onClick={onButtonClick}>
              Click to upload
            </a>
            <span className="body-1 white">or drag and drop</span>
            <p className="body-2 secondary">Maximum file size 50 MB</p>
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
          <div className={styles.separator} />
          <div className={styles.verticalSeparator} />
        </Fragment>
      ) : null}

      {props.showPaintImageLink && (
        <div className={styles.paintInfo}>
          <PaintImageIcon />
          <Link className="underline body-1 main" href={"/paint"}>
            Paint an image
          </Link>
        </div>
      )}

      {props.showPaintMask && (
        <div className={styles.paintInfo}>
          <PaintImageIcon />
          <span
            className="underline body-1 main pointer"
            onClick={() => setShowEditModal(true)}
          >
            Paint a mask
          </span>
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

      <AppImage src={imgSrc} alt={"Base image"} />
    </div>
  );

  return (
    <Fragment>
      <div className={styles.imageDraggable}>
        {props.label && (
          <label htmlFor={props.id} className="base-2 white">
            {props.label}
          </label>
        )}

        {imgSrc ? ImageResultDetail : ImageInputForm}
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

export default DragDropFile;
