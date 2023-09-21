import { useEffect } from "react";
import { NextPage } from "next";

import PrivateRoute from "../../components/Auth/PrivateRoute/PrivateRoute";
import FAQ from "../../components/FAQ/FAQ";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import styles from "../../styles/pages/Help.module.scss";

const Help: NextPage = () => {
  const { sendAnalyticsRecord } = useAnalytics();

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Help",
    });
  }, []);

  return (
    <PrivateRoute>
      <div className={styles.mainContent}>
        <FAQ />
      </div>
    </PrivateRoute>
  );
};

export default Help;
