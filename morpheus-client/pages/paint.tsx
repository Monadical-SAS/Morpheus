import { useEffect } from "react";

import Excalidraw from "../components/Excalidraw/Excalidraw";
import ImagineLayout from "@/layout/ImagineLayout/ImagineLayout";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

const Paint = () => {
  const { sendAnalyticsRecord } = useAnalytics();

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Paint",
    });
  }, []);

  return (
    <ImagineLayout>
      <Excalidraw />
    </ImagineLayout>
  );
};

export default Paint;
