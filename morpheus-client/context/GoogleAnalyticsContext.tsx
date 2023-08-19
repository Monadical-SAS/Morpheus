import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { analytics } from "@/lib/firebaseClient";
import { logEvent } from "firebase/analytics";
import { CookiesStatus } from "@/utils/cookies";

export interface IAnalyticsContext {
  analytics: any;
  cookiesStatus: string;
  setCookiesStatus: (accept: string) => void;
  sendAnalyticsRecord: (type: string, message: any) => void;
}

const defaultState = {
  analytics: undefined,
  cookiesStatus: "",
  setCookiesStatus: () => {},
  sendAnalyticsRecord: () => {},
};

const AnalyticsContext = createContext<IAnalyticsContext>(defaultState);

const FirebaseTrackingProvider = (props: { children: ReactNode }) => {
  const router = useRouter();
  const [cookiesStatus, setCookiesStatus] = useState("");

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (cookiesStatus === CookiesStatus.Accepted && analytics) {
        return;
      }

      logEvent(analytics, "page_view", {
        page_location: url,
        page_title: document?.title,
      });
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [cookiesStatus, router.events]);

  const sendAnalyticsRecord = (type: string, parameters: object) => {
    if (cookiesStatus === CookiesStatus.Accepted && analytics) {
      logEvent(analytics, type, parameters);
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        cookiesStatus,
        setCookiesStatus,
        sendAnalyticsRecord,
      }}
    >
      {props.children}
    </AnalyticsContext.Provider>
  );
};

const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within a AnalyticsProvider");
  }
  return context;
};

export { FirebaseTrackingProvider, useAnalytics };
