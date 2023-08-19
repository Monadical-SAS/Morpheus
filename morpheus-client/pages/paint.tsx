import { useEffect } from "react";

import Excalidraw from "../components/Excalidraw/Excalidraw";
import { CookiesStatus } from "@/utils/cookies";
import { MainContainer } from "@/layout/MainContainer/MainContainer";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import styles from "@/styles/pages/Paint.module.scss";

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
    <MainContainer>
      <div className={styles.mainContent}>
        <Excalidraw />
      </div>
    </MainContainer>
  );
};

export default Paint;
