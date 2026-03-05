import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { CloseIcon } from "../icons/close";
import useWindowDimensions from "@/hooks/useWindowDimensions";

interface ModalProps {
  showHeader?: boolean;
  headerContent?: ReactNode;
  children?: ReactNode;
  isOpen: boolean;
  toggleModal: () => void;
  width?: string;
  height?: string;
  styles?: CSSProperties;
}

const Modal = (props: ModalProps) => {
  const { isMobile } = useWindowDimensions();

  const initialStyles = useMemo(() => {
    const defaultSize = isMobile ? 90 : 80;

    return {
      width: props.width || `${defaultSize}vw`,
      height: props.height || `${defaultSize}vh`,
      ...props.styles,
    };
  }, [props]);

  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const modalRoot = document.getElementById("portal-modal");

      if (!container) {
        const newContainer = document.createElement("div");
        setContainer(newContainer);
        modalRoot?.appendChild(newContainer);
      }

      return () => {
        if (container) {
          modalRoot?.removeChild(container);
        }
      };
    }
  }, [container]);

  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === "Escape") {
        props.toggleModal();
      }
    };

    if (props.isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [props]);

  const renderModalContent = () => {
    return props.isOpen ? (
      <dialog className="z-40 w-screen h-screen absolute top-0 right-0 bottom-0 left-0 bg-[rgba(0,0,0,0.7)] flex justify-center items-center" onClick={props.toggleModal}>
        <div
          style={initialStyles}
          onClick={(e) => e.stopPropagation()}
          className="w-[50vw] max-w-[1280px] h-[50vh] max-h-[90vh] p-12 rounded-lg flex flex-col gap-8 bg-[#252238] border border-[#312E47] overflow-y-auto max-md:w-[80vw] max-md:max-w-[90vw] max-md:h-auto max-md:p-6"
        >
          {props.showHeader && (
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 flex items-center">
                {props.headerContent ? props.headerContent : null}
              </div>
              <span className="justify-self-end cursor-pointer" onClick={props.toggleModal}>
                <CloseIcon />
              </span>
            </div>
          )}

          {props.children}
        </div>
      </dialog>
    ) : null;
  };

  return container
    ? ReactDOM.createPortal(renderModalContent(), container)
    : null;
};

export default Modal;
