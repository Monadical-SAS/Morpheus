import { useEffect } from "react";

import { CookiesStatus } from "@/utils/cookies";
import Excalidraw from "../components/Excalidraw/Excalidraw";
import ImagineLayout from "@/layout/ImagineLayout/ImagineLayout";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

const Paint = () => {
  const { cookiesStatus, sendAnalyticsRecord } = useAnalytics();

  useEffect(() => {
    if (cookiesStatus === CookiesStatus.Accepted) {
      sendAnalyticsRecord("page_view", {
        page_location: window.location.href,
        page_title: document?.title,
        page_name: "Paint",
      });
    }
  }, [cookiesStatus, sendAnalyticsRecord]);

  return (
    <ImagineLayout>
      <Excalidraw />
    </ImagineLayout>
  );
};

export default Paint;