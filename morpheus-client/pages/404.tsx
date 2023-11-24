import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";

import { MainLayout } from "@/layout/MainLayout/MainLayout";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import styles from "../styles/pages/Error.module.scss";

const Page400 = () => {
  const { sendAnalyticsRecord } = useAnalytics();
  const router = useRouter();
  const handleClickToAction = useCallback(async () => {
    await router.push("/");
  }, [router]);

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Error",
    });
  }, []);

  return (
    <MainLayout>
      <div className={styles.mainContent}>
        <div className={styles.textContent}>
          <h2 className="bold40 white">Page Not Found</h2>
          <hr />
          <p className="heading white">
            It seems like you are lost, <br />
            but don't worry, <br />
            we can help you get back on track.
          </p>

          <button className="buttonSubmit" onClick={handleClickToAction}>
            Go to Home
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Page400;
