import React, {
  CSSProperties,
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import ColorPaletteGenerator from "@/components/ColorPaletteGenerator/ColorPaletteGenerator";
import Modal from "../Modal/Modal";
import MaskPaintingCanvas from "../MaskPaintingCanvas/MaskPaintingCanvas";
import { CloseIcon } from "../icons/close";
import { UploadImageIcon } from "../icons/uploadImage";
import { PaintImageIcon } from "../icons/paintImage";
import useWindowDimensions from "@/hooks/useWindowDimensions";

interface DragDropFileProps {
  id?: string;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  label?: string;
  buttonLabel?: string;
  icon?: ReactNode;
  styles?: CSSProperties;
  showPaintImageLink?: boolean;
  showPaintMask?: boolean;
  showColorPalette?: boolean;
}

const ImagineImageInput = (props: DragDropFileProps) => {
  const inputRef = useRef<any>(null);
  const { isMobile, width } = useWindowDimensions();

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
    <div className="w-full max-w-full h-auto flex flex-row justify-center items-center text-center rounded-lg px-6 py-12 max-md:justify-start max-md:items-start max-md:p-0 max-md:gap-6"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23312E47FF' stroke-width='4' stroke-dasharray='10%2c 10' stroke-dashoffset='53' stroke-linecap='round'/%3e%3c/svg%3e\")" }}>
      <form
        className="relative flex flex-col justify-center items-center min-w-[150px] max-w-[170px] max-md:w-[160px] max-md:h-[160px] max-md:p-[5px] max-md:rounded-lg max-md:border max-md:border-[#312E47] max-md:bg-[#14172D]"
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
        style={props.styles}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={false}
          onChange={handleChange}
        />
        <label
          htmlFor="input-file-upload"
          className="h-full flex items-center justify-center border-2 rounded-2xl border-dashed border-transparent bg-transparent"
        >
          <div className="flex flex-col items-center">
            {props.icon ? props.icon : <UploadImageIcon />}
            <a
              className="underline body-1 main pointer"
              onClick={onButtonClick}
            >
              {isMobile ? "Upload" : "Upload an image"}
            </a>
            <span className="body-2 white">or drag and drop</span>
            <span className="caption-1 secondary">Maximum file size 50 MB</span>
          </div>
        </label>

        {dragActive && (
          <div
            className="absolute w-full h-full rounded-2xl top-0 right-0 bottom-0 left-0"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />
        )}
      </form>

      {props.showPaintImageLink ||
      props.showPaintMask ||
      props.showColorPalette ? (
        <Fragment>
          <div className="block relative w-[2px] h-full mx-12 [&::after]:content-[''] [&::after]:absolute [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-[2px] [&::after]:bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_10px,#312E47_10px,#312E47_22px)] md:mx-2 max-md:hidden" />
        </Fragment>
      ) : null}

      {props.showPaintImageLink && (
        <div className="relative flex flex-col justify-center items-center min-w-[150px] max-w-[170px] max-md:w-[160px] max-md:h-[160px] max-md:p-[5px] max-md:rounded-lg max-md:border max-md:border-[#312E47] max-md:bg-[#14172D]">
          <PaintImageIcon />
          <Link className="underline body-1 main" href={"/paint"}>
            {isMobile ? "Paint" : "Paint an image"}
          </Link>
        </div>
      )}

      {props.showPaintMask && (
        <div className="relative flex flex-col justify-center items-center min-w-[150px] max-w-[170px] max-md:w-[160px] max-md:h-[160px] max-md:p-[5px] max-md:rounded-lg max-md:border max-md:border-[#312E47] max-md:bg-[#14172D]">
          <PaintImageIcon />
          <a
            className="underline body-1 main pointer"
            onClick={() => setShowEditModal(true)}
          >
            {isMobile ? "Paint" : "Paint an image"}
          </a>
        </div>
      )}

      {props.showColorPalette && (
        <div className="relative flex flex-col justify-center items-center min-w-[150px] max-w-[170px] max-md:w-[160px] max-md:h-[160px] max-md:p-[5px] max-md:rounded-lg max-md:border max-md:border-[#312E47] max-md:bg-[#14172D]">
          <PaintImageIcon />
          <a
            className="underline body-1 main pointer"
            onClick={() => setShowEditModal(true)}
          >
            {isMobile ? "Generate" : "Generate a color palette"}
          </a>
        </div>
      )}
    </div>
  );

  const ImageResultDetail = (
    <div className="w-full h-auto max-w-[300px] max-h-[400px] relative bg-[#252238] rounded-lg flex flex-col p-2 max-md:max-w-full max-md:max-h-none max-md:-mt-10 max-md:p-0" style={props.styles}>
      <div className="h-auto flex flex-row justify-end items-center pb-2">
        <span onClick={clearImage}>
          <CloseIcon width={"24"} height={"24"} />
        </span>
      </div>

      <img src={imageSrc} alt={props.label} className="rounded-lg object-contain" />
    </div>
  );

  return (
    <Fragment>
      <div className="min-w-[244px] flex flex-col gap-3 max-md:px-6 max-md:min-w-0 max-md:w-auto max-md:flex-1">
        {props.label && (
          <span className="z-[9] max-w-[250px] base-2 white">{props.label}</span>
        )}

        {imageSrc ? ImageResultDetail : ImageInputForm}
      </div>

      <Modal
        width={"610px"}
        height={"auto"}
        isOpen={showEditModal}
        toggleModal={() => setShowEditModal(!showEditModal)}
      >
        {props.showPaintMask && (
          <MaskPaintingCanvas
            width={isMobile && width ? width - 88 : 512}
            height={isMobile && width ? width - 88 : 512}
            closeModal={() => setShowEditModal(false)}
          />
        )}

        {props.showColorPalette && (
          <ColorPaletteGenerator closeModal={() => setShowEditModal(false)} />
        )}
      </Modal>
    </Fragment>
  );
};

export default ImagineImageInput;
