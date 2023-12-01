import { useRef, useState } from "react";
import { CloseIcon } from "@/components/icons/close";
import { CheckIcon } from "@/components/icons/check";
import { useImagine } from "@/context/ImagineContext";
import { useToastContext } from "@/context/ToastContext";

type ColorPaletteGeneratorProps = {
  closeModal: () => void;
};

const initialColors = ["#ffffff", "#ffffff"];

const ColorPaletteGenerator = (props: ColorPaletteGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setColorPaletteFile } = useImagine();
  const { showInfoAlert } = useToastContext();
  const [colors, setColors] = useState<string[]>(initialColors);

  const addColor = () => {
    if (colors.length >= 5) {
      showInfoAlert("You can only have 5 colors in your palette");
      return;
    }
    setColors([...colors, "#ffffff"]);
  };

  const changeColor = (color: string, index: number) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const resetColors = () => {
    setColors(initialColors);
  };

  const handleCompleted = () => {
    if (!canvasRef) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    const step = 1 / (colors.length - 1);
    for (let i = 0; i < colors.length; i++) {
      gradient.addColorStop(step * i, colors[i]);
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob: any) => {
      const file = new File([blob as Blob], "color-palette.png", {
        type: "image/png",
      });
      setColorPaletteFile(file);
      props.closeModal();
    }, "image/png");
  };

  return (
    <div className="">
      <h2 className="headline-3 white">Generate Color Palette</h2>

      <canvas ref={canvasRef} width={500} height={500} hidden />
      <div className="w-full h-[300px] md:w-[500px] md:h-[500px] grid mt-5 p-1 bg-white">
        {colors.map((color, index) => (
          <div key={index}>
            <input
              type="color"
              value={color}
              className="w-full h-full"
              onChange={(e) => changeColor(e.target.value, index)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-row items-center gap-[16px] mt-10">
        <button className="buttonSubmit w-full" onClick={addColor}>
          Add Color
        </button>

        <span
          className="material-icons text-white cursor-pointer"
          onClick={resetColors}
        >
          replay
        </span>

        <span onClick={props.closeModal} className="cursor-pointer">
          <CloseIcon width={"24"} height={"24"} color={"#FFFFFF"} />
        </span>

        <span onClick={handleCompleted} className="cursor-pointer">
          <CheckIcon width={"24"} height={"24"} color={"#FFFFFF"} />
        </span>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
