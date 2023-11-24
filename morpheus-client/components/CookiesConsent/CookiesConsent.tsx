import styles from "./CookiesConsent.module.scss";
import {
  CookiesStatus,
  useCookiesConsent,
} from "@/context/CookiesConsentContext";

const CookiesConsent = () => {
  const { cookiesStatus, setCookiesStatus } = useCookiesConsent();

  return cookiesStatus === CookiesStatus.EMPTY ? (
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
          onClick={() => setCookiesStatus(CookiesStatus.DECLINED)}
        >
          Decline
        </button>

        <button
          className="buttonSubmit"
          onClick={() => setCookiesStatus(CookiesStatus.ACCEPTED)}
        >
          Accept
        </button>
      </div>
    </div>
  ) : null;
};

export default CookiesConsent;
