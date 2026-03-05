import {
  CookiesStatus,
  useCookiesConsent,
} from "@/context/CookiesConsentContext";

const CookiesConsent = () => {
  const { cookiesStatus, setCookiesStatus } = useCookiesConsent();

  return cookiesStatus === CookiesStatus.EMPTY ? (
    <div className="fixed bottom-0 left-0 w-screen min-h-[50px] h-auto z-[999] flex items-center justify-center bg-[rgba(0,0,0,0.9)] p-5 max-md:flex-col max-md:justify-start">
      <div className="w-[70%] h-full flex items-center max-md:w-full max-md:flex-col max-md:items-start">
        <p className="body-1 secondary">
          This website uses cookies to ensure you get the best experience on our
          website.
          <a className="underline text-primary" target="_blank" href="">
            Privacy Policy
          </a>
        </p>
      </div>

      <div className="w-auto ml-6 flex justify-between min-w-[400px] pr-6 max-md:w-full max-md:flex-col max-md:m-0 max-md:mt-6">
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
