import { useEffect } from "react";
import { NextPage } from "next";

import PrivateRoute from "../../components/Auth/PrivateRoute/PrivateRoute";
import FAQ from "../../components/FAQ/FAQ";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";

const Help: NextPage = () => {
  const { sendAnalyticsRecord } = useAnalytics();

  useEffect(() => {
    sendAnalyticsRecord("page_view", {
      page_location: window.location.href,
      page_title: document?.title,
      page_name: "Help",
    });
  }, []);

  return (
    <PrivateRoute>
      <div className="h-full w-full flex flex-col justify-center items-center bg-[#14172D] px-[340px] py-[120px] max-md:mt-[60px] max-md:px-6 max-md:py-12">
        <FAQ />
      </div>
    </PrivateRoute>
  );
};

export default Help;
