import { createContext, ReactNode, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { analytics } from "@/lib/firebaseClient";
import { logEvent } from "firebase/analytics";
import { useCookiesConsent } from "@/context/CookiesConsentContext";

export interface IAnalyticsContext {
  analytics: any;

  sendAnalyticsRecord: (type: string, message: any) => void;
}

const defaultState = {
  analytics: undefined,
  sendAnalyticsRecord: () => {},
};

const AnalyticsContext = createContext<IAnalyticsContext>(defaultState);

const FirebaseTrackingProvider = (props: { children: ReactNode }) => {
  const router = useRouter();
  const { cookiesAccepted } = useCookiesConsent();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (!cookiesAccepted) {
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
  }, [cookiesAccepted, router.events]);

  const sendAnalyticsRecord = (type: string, parameters: object) => {
    if (cookiesAccepted && analytics) {
      logEvent(analytics, type, parameters);
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
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
