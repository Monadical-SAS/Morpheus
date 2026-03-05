import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";

import { MainLayout } from "@/layout/MainLayout/MainLayout";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

const Page400 = () => {
  const { sendAnalyticsRecord } = useAnalytics();
  const router = useRouter();
  const handleClickToAction = useCallback(async () => {
    await router.push("/");
  }, [router]);

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Error",
    });
  }, []);

  return (
    <MainLayout>
      <div className="w-full h-full bg-[url('/images/404.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center">
        <div className="h-auto w-auto flex p-12 flex-col justify-center items-center [background-image:radial-gradient(rgba(0,0,0,1)_0,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.0)_100%)]">
          <h2 className="bold40 white mt-10 [text-shadow:2px_2px_#252238]">Page Not Found</h2>
          <hr className="w-full mb-6" />
          <p className="heading white my-10 text-center [text-shadow:2px_2px_2px_#252238]">
            It seems like you are lost, <br />
            but don't worry, <br />
            we can help you get back on track.
          </p>

          <button className="buttonSubmit mt-6" onClick={handleClickToAction}>
            Go to Home
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Page400;
