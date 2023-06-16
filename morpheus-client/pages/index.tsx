import { useEffect } from "react";
import { useRouter } from "next/router";

import FullScreenLoader from "../components/Loaders/FullScreenLoader/Loader";
import { Auth } from "@/components/Auth/Auth";
import { isEmptyObject } from "@/utils/object";
import { useAuth } from "@/context/AuthContext";
import styles from "../styles/pages/Home.module.scss";

const Home = () => {
  const router = useRouter();
  const { authLoading, user } = useAuth();

  useEffect(() => {
    if (!isEmptyObject(user)) {
      router.push("/imagine/text2img");
    }
  }, [router, user]);

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
              Unleash your imagination and use the power of AI to create the
              most extraordinary scenarios you can envision. 🧙
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
