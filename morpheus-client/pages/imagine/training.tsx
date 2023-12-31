import { useEffect } from "react";
import { NextPage } from "next";

import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import UnderConstruction from "@/components/UnderConstruction/UnderConstruction";
import PrivateRoute from "@/components/Auth/PrivateRoute/PrivateRoute";
import styles from "@/styles/pages/Training.module.scss";

const Training: NextPage = () => {
  const { sendAnalyticsRecord } = useAnalytics();

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Training",
    });
  }, []);

  return (
    <PrivateRoute>
      <div className={styles.mainContent}>
        <UnderConstruction title={"Training Models"} variant={"small"} />
      </div>
    </PrivateRoute>
  );
};

export default Training;
