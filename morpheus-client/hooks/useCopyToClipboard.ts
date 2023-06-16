function useCopyToClipboard() {
  const copyToClipboard = async (text: string) => {
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  };

  return { copyToClipboard };
}

export default useCopyToClipboard;
