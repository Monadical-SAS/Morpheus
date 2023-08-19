import { useEffect, useState } from "react";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import { deleteAllCookies, CookiesStatus } from "@/utils/cookies";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import styles from "./CookiesConsent.module.scss";



const CookiesConsent = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { cookiesStatus, setCookiesStatus } = useAnalytics();

  const [localCookies, setLocalCookies] = useLocalStorage<string | null>("cp:cookies", null);


  useEffect(() => {
    const newStatus = localCookies || cookiesStatus || "";
    if (newStatus !== "") {
      if (localCookies && localCookies !== "") setCookiesStatus(localCookies);
    }
    setIsHydrated(true)
  }, [localCookies, setCookiesStatus, cookiesStatus]);

  const handleActionCookies = (event: any, status: string) => {
    event.preventDefault();

    if (status === CookiesStatus.Declined) {
      deleteAllCookies();
    }

    setCookiesStatus(status);
    setLocalCookies(status);
  };

  return isHydrated && localCookies === null ? (
    <div className={styles.cookiesContainer}>
      <div className={styles.textContainer}>
        <p className="body-1 secondary">
          This website uses cookies to ensure you get the best experience on our
          website.
          <a className="underline text-primary" target="_blank" href="">
            Privacy Policy
          </a>
        </p>
      </div>

      <div className={styles.buttonsSection}>
        <button
          className="buttonSubmit"
          onClick={(event) => handleActionCookies(event, CookiesStatus.Declined)}
        >
          Decline
        </button>

        <button
          className="buttonSubmit"
          onClick={(event) => handleActionCookies(event, CookiesStatus.Accepted)}
        >
          Accept
        </button>
      </div>
    </div>
  ) : null;
};

export default CookiesConsent;