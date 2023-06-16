import { useEffect, useState } from "react";

export const useShowSettings = () => {
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === "Escape") {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showSettings]);

  return { showSettings, toggleSettings };
};
