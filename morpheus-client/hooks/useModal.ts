import { useState } from "react";

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    toggleModal,
  };
}
