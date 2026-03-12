import React, { useEffect } from "react";
import { useRouter } from "next/router";

import FullScreenLoader from "../components/Loaders/FullScreenLoader/Loader";
import CookiesConsent from "@/components/CookiesConsent/CookiesConsent";
import { Auth } from "@/components/Auth/Auth";
import { isEmptyObject } from "@/utils/object";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

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
    <div className="w-screen h-screen bg-[url('/images/redesign/landing.svg')] bg-cover bg-center bg-no-repeat relative">
      <div className="p-8 flex justify-between absolute top-0 left-0 w-full h-full bg-[radial-gradient(60.94%_60.94%_at_50%_50%,rgba(20,23,45,0)_0%,#14172D_100%)] overflow-y-auto max-md:p-0 md:justify-center">
        <div className="min-w-[490px] max-w-[490px] mt-12 ml-20 max-md:hidden md:hidden">
          <div className="h-auto w-auto">
            <h1 className="headline-1 primary">
              Morpheus - <br /> AI Art Generator
            </h1>
            <p className="body-2 secondary">
              Explore visual AI and easily add new models, extending Morpheus
              for your own project needs. 🧙
            </p>
          </div>
        </div>

        <div className="w-[746px] min-w-[340px] max-w-full h-full min-h-[700px] p-8 flex justify-center items-center rounded-lg bg-[#252238] max-md:w-full max-md:p-0">
          <Auth />
        </div>
      </div>

      <CookiesConsent />
    </div>
  );
};

export default Home;
