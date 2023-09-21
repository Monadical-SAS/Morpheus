import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export enum CookiesStatus {
  EMPTY = "",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export interface ICookiesConsentContext {
  cookiesStatus: CookiesStatus;
  setCookiesStatus: (accept: CookiesStatus) => void;
  cookiesAccepted: boolean;
}

const defaultState = {
  cookiesStatus: CookiesStatus.EMPTY,
  setCookiesStatus: () => console.log("setCookiesAccepted"),
  cookiesAccepted: false,
};

const CookiesConsentContext =
  createContext<ICookiesConsentContext>(defaultState);

const CookiesConsentProvider = (props: { children: ReactNode }) => {
  const [cookiesStatus, setCookiesStatus] = useState(CookiesStatus.EMPTY);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [localCookiesStatus, setLocalCookiesStatus] = useLocalStorage(
    "cookiesStatus",
    CookiesStatus.EMPTY
  );

  useEffect(() => {
    if (localCookiesStatus && localCookiesStatus !== cookiesStatus) {
      setCookiesStatus(localCookiesStatus);
    }
  }, [localCookiesStatus]);

  useEffect(() => {
    if (cookiesStatus) {
      setCookiesAccepted(cookiesStatus === CookiesStatus.ACCEPTED);
      if (cookiesStatus !== localCookiesStatus) {
        setLocalCookiesStatus(cookiesStatus);
      }
    }
  }, [cookiesStatus]);

  return (
    <CookiesConsentContext.Provider
      value={{
        cookiesStatus,
        setCookiesStatus,
        cookiesAccepted,
      }}
    >
      {props.children}
    </CookiesConsentContext.Provider>
  );
};

const useCookiesConsent = () => {
  const context = useContext(CookiesConsentContext);
  if (context === undefined) {
    throw new Error(
      "useCookiesConsent must be used within a CookiesConsentProvider"
    );
  }
  return context;
};

export { CookiesConsentProvider, useCookiesConsent };
