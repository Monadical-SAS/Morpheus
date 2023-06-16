import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "../icons/check";
import { CloseIcon } from "../icons/close";
import { useImagine } from "@/context/ImagineContext";
import {
  convertInpaintingMaskToMask,
  convertMaskToInpaintingMask,
  getFileFromBlob,
} from "@/utils/images";
import InputNumber, {
  initializeNumber,
  NumberState,
} from "../Inputs/InputNumber/InputNumber";
import styles from "./MaskPaintingCanvas.module.scss";

type MaskedCanvasProps = {
  src: string;
  width: number;
  height: number;
  closeModal: () => void;
};

const MaskPaintingCanvas = (props: MaskedCanvasProps) => {
  const { maskFile, setMaskFile } = useImagine();

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [brushSize, setBrushSize] = useState<NumberState>(initializeNumber(50));

  useEffect(() => {
    renderInitialSetup();
  }, [props.src, props.width, props.height]);

  const renderInitialSetup = () => {
    const imageCanvas = imageCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;

    if (!imageCanvas || !drawingCanvas) return;
    const ctx = imageCanvas.getContext("2d");

    const image = new Image();
    image.src = props.src;
    image.onload = () => {
      if (!imageCanvas || !drawingCanvas || !ctx) return;
      imageCanvas.width = props.width;
      imageCanvas.height = props.height;
      drawingCanvas.width = props.width;
      drawingCanvas.height = props.height;

      // Calculate the scale factors for resizing
      const scaleX = props.width / image.width;
      const scaleY = props.height / image.height;
      const scale = Math.max(scaleX, scaleY);

      // Calculate the new image dimensions after resizing
      const newWidth = image.width * scale;
      const newHeight = image.height * scale;

      // Calculate the center coordinates for cropping
      const left = (newWidth - props.width) / 2;
      const top = (newHeight - props.height) / 2;

      // Draw the resized image on the canvas
      ctx.drawImage(image, -left, -top, newWidth, newHeight);
      renderInitialMask();
    };
  };

  const renderInitialMask = () => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    if (!maskFile) return;

    const ctx = drawingCanvas.getContext("2d");
    const maskImg = new Image();
    maskImg.src = URL.createObjectURL(maskFile);
    maskImg.onload = () => {
      if (!drawingCanvas || !ctx) return;
      ctx.drawImage(maskImg, 0, 0, drawingCanvas.width, drawingCanvas.height);
      const imageData = ctx.getImageData(
        0,
        0,
        drawingCanvas.width,
        drawingCanvas.height
      );
      const invertedData = convertInpaintingMaskToMask(imageData);
      ctx.putImageData(invertedData, 0, 0);
    };
  };

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    setLastX(e.nativeEvent.offsetX);
    setLastY(e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !drawingCanvasRef.current) return;
    const ctx = drawingCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    ctx.stroke();

    setLastX(e.nativeEvent.offsetX);
    setLastY(e.nativeEvent.offsetY);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: any) => {
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    setIsDrawing(true);
    setLastX(offsetX);
    setLastY(offsetY);
  };

  const handleTouchMove = (e: any) => {
    if (!isDrawing || !drawingCanvasRef.current) return;
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    const ctx = drawingCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    ctx.stroke();

    setLastX(offsetX);
    setLastY(offsetY);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    const ctx = drawingCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  };

  const handleCompleted = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const invertedImageData = convertMaskToInpaintingMask(imageData);
    ctx.putImageData(invertedImageData, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setMaskFile(getFileFromBlob(blob, "mask.png"));
      props.closeModal();
    });
  };

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={imageCanvasRef} className={styles.imageCanvas} />

      <canvas
        className={styles.drawingCanvas}
        ref={drawingCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className={styles.actionsContainer}>
        <InputNumber
          id="inputNumberBrushSize"
          number={brushSize}
          setNumber={setBrushSize}
          minValue={10}
          maxValue={100}
          containerStyles={{ width: "100%" }}
          label={"Brush Size"}
          step={10}
        />

        <div className={styles.actions}>
          <span className="material-icons" onClick={resetCanvas}>
            replay
          </span>

          <span onClick={props.closeModal}>
            <CloseIcon width={"24"} height={"24"} />
          </span>

          <span onClick={handleCompleted}>
            <CheckIcon width={"24"} height={"24"} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default MaskPaintingCanvas;
