import { useEffect } from "react";
import { useRouter } from "next/router";

import FullScreenLoader from "../components/Loaders/FullScreenLoader/Loader";
import { Auth } from "@/components/Auth/Auth";
import { isEmptyObject } from "@/utils/object";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import styles from "../styles/pages/Home.module.scss";

const Home = () => {
  const router = useRouter();
  const { authLoading, user } = useAuth();
  const { sendAnalyticsRecord } = useAnalytics();

  useEffect(() => {
    if (!isEmptyObject(user)) {
      router.push("/imagine/text2img");
    }
  }, [router, user]);

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Home",
    });
  }, []);

  return authLoading ? (
    <FullScreenLoader isLoading={authLoading} />
  ) : (
    <div className={styles.homeContent}>
      <div className={styles.overlay}>
        <div className={styles.textContainer}>
          <div className={styles.textContent}>
            <h1 className="headline-1 primary">
              Morpheus - <br /> AI Art Generator
            </h1>
            <p className="body-2 secondary">
              Explore visual AI and easily add new models, extending Morpheus
              for your own project needs. 🧙
            </p>
          </div>
        </div>

        <div className={styles.authContainer}>
          <Auth />
        </div>
      </div>
    </div>
  );
};

export default Home;
