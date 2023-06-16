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
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import styles from "./Modal.module.scss";

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
  const { width } = useWindowDimensions();

  const initialStyles = useMemo(() => {
    const isMobile = width < MOBILE_SCREEN_WIDTH;
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
      <dialog className={styles.modalContainer} onClick={props.toggleModal}>
        <div
          style={initialStyles}
          onClick={(e) => e.stopPropagation()}
          className={styles.modalBody}
        >
          {props.showHeader && (
            <div className={styles.modalHeader}>
              <div className={styles.headerContent}>
                {props.headerContent ? props.headerContent : null}
              </div>
              <span className={styles.closeIcon} onClick={props.toggleModal}>
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
