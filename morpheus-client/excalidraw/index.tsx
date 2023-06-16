import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ExcalidrawApp from "./excalidraw-app";

import "./excalidraw-app/pwa";

window.__EXCALIDRAW_SHA__ = process.env.NEXT_PUBLIC_GIT_SHA;
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <ExcalidrawApp />
  </StrictMode>
);
