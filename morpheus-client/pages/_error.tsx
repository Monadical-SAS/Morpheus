import { useCallback } from "react";
import { useRouter } from "next/router";
import { MainLayout } from "@/layout/MainLayout/MainLayout";
import styles from "../styles/pages/Error.module.scss";

const Page500 = () => {
  const router = useRouter();

  const handleClickToAction = useCallback(async () => {
    await router.push("/");
  }, [router]);

  return (
    <MainLayout>
      <div className={styles.mainContent}>
        <div className={styles.textContent}>
          <h2 className="bold40 white">Internal Server Error</h2>
          <hr />
          <p className="heading white">
            It seems like something went wrong, <br />
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

export default Page500;